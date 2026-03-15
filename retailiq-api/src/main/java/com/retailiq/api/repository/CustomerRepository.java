package com.retailiq.api.repository;

import com.retailiq.api.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

        Optional<Customer> findByUserUserId(Long userId);

        @Query(value = """
                        SELECT segment, COUNT(*) AS cnt
                        FROM customers
                        WHERE segment IS NOT NULL
                        GROUP BY segment
                        ORDER BY cnt DESC
                        """, nativeQuery = true)
        List<Object[]> countBySegment();

        @Query(value = """
                        SELECT COUNT(DISTINCT customer_id) FROM orders
                        WHERE order_date >= DATE_SUB(NOW(), INTERVAL 90 DAY) AND status != 'Cancelled'
                        """, nativeQuery = true)
        long countActiveCustomers();

        @Query(value = """
                        SELECT COUNT(DISTINCT customer_id) FROM orders
                        WHERE order_date >= DATE_SUB(:refTime, INTERVAL 90 DAY) 
                          AND order_date <= :refTime
                          AND status != 'Cancelled'
                        """, nativeQuery = true)
        long countActiveCustomersAt(@Param("refTime") java.time.LocalDateTime refTime);

        @Query("SELECT COUNT(c) FROM Customer c WHERE c.createdAt <= :refTime")
        long countTotalCustomersAt(@Param("refTime") java.time.LocalDateTime refTime);

        @Query("SELECT COUNT(c) FROM Customer c")
        long countTotalCustomers();
}
