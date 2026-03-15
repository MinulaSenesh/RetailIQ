package com.retailiq.api.repository;

import com.retailiq.api.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // Only return non-soft-deleted products
    Page<Product> findByActiveTrue(Pageable pageable);

    @Query(value = """
            SELECT p.product_id, p.product_name, p.sku,
                   c.name AS category,
                   SUM(oi.line_total) AS totalRevenue,
                   SUM(oi.quantity)   AS unitsSold,
                   SUM(oi.quantity * (oi.unit_price - p.cost_price)) AS grossMargin
            FROM order_items oi
            JOIN products p ON oi.product_id = p.product_id
            JOIN categories c ON p.category_id = c.category_id
            JOIN orders o ON oi.order_id = o.order_id
            WHERE o.order_date BETWEEN :start AND :end
              AND o.status != 'Cancelled'
              AND (:categoryId IS NULL OR p.category_id = :categoryId)
            GROUP BY p.product_id, p.product_name, p.sku, c.name
            ORDER BY totalRevenue DESC
            LIMIT :lim
            """, nativeQuery = true)
    List<Object[]> topProductsByRevenue(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("categoryId") Long categoryId,
            @Param("lim") int limit);

    @Query(value = """
            SELECT p.product_id, p.product_name, p.sku, p.stock_quantity,
                   COALESCE(SUM(oi.quantity), 0) AS soldQty,
                   CASE WHEN COALESCE(avg_stock.avg_qty, p.stock_quantity) = 0 THEN 0
                        ELSE COALESCE(SUM(oi.quantity), 0) / COALESCE(avg_stock.avg_qty, p.stock_quantity)
                   END AS turnoverRate
            FROM products p
            LEFT JOIN order_items oi ON p.product_id = oi.product_id
            LEFT JOIN orders o ON oi.order_id = o.order_id AND o.status != 'Cancelled'
            LEFT JOIN (
                SELECT product_id, AVG(change_qty) AS avg_qty
                FROM inventory_log WHERE reason = 'Restock'
                GROUP BY product_id
            ) avg_stock ON p.product_id = avg_stock.product_id
            WHERE p.is_active = 1
            GROUP BY p.product_id, p.product_name, p.sku, p.stock_quantity, avg_stock.avg_qty
            ORDER BY turnoverRate DESC
            """, nativeQuery = true)
    List<Object[]> inventoryTurnover();
}
