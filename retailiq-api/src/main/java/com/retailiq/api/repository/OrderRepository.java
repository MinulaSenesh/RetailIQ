package com.retailiq.api.repository;

import com.retailiq.api.entity.Order;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    @Override
    @EntityGraph(attributePaths = {"customer"})
    Page<Order> findAll(Pageable pageable);

    @Query(value = "SELECT o FROM Order o WHERE o.customer.user.userId = :userId ORDER BY o.orderDate DESC")
    List<Order> findMyOrders(@Param("userId") Long userId);

    @Query("SELECT o FROM Order o JOIN FETCH o.customer WHERE o.orderDate BETWEEN :start AND :end ORDER BY o.orderDate DESC")
    List<Order> findOrdersWithCustomerBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);


    @Query(value = """
            SELECT COALESCE(SUM(total_amount), 0)
            FROM orders
            WHERE order_date BETWEEN :start AND :end AND status != 'Cancelled'
            """, nativeQuery = true)
    BigDecimal sumRevenueBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query(value = """
            SELECT COUNT(*) FROM orders
            WHERE order_date BETWEEN :start AND :end AND status != 'Cancelled'
            """, nativeQuery = true)
    long countOrdersBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query(value = """
            SELECT DATE_FORMAT(order_date, :fmt) AS period,
                   SUM(total_amount)            AS revenue,
                   COUNT(*)                     AS orderCount
            FROM orders
            WHERE order_date BETWEEN :start AND :end
              AND status != 'Cancelled'
              AND (:region IS NULL OR region = :region)
            GROUP BY period
            ORDER BY period
            """, nativeQuery = true)
    List<Object[]> salesTrend(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("fmt") String fmt,
            @Param("region") String region);

    @Query(value = """
            SELECT o.region, SUM(o.total_amount) AS revenue, COUNT(*) AS orderCount
            FROM orders o
            WHERE o.order_date BETWEEN :start AND :end AND o.status != 'Cancelled'
            GROUP BY o.region
            ORDER BY revenue DESC
            """, nativeQuery = true)
    List<Object[]> salesByRegion(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
