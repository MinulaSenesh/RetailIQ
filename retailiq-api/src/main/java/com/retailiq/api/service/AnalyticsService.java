package com.retailiq.api.service;

import com.retailiq.api.dto.*;
import com.retailiq.api.repository.CustomerRepository;
import com.retailiq.api.repository.OrderRepository;
import com.retailiq.api.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsService {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;

    public KpiResponse getKpis(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);

        // Previous period for growth calculation
        long days = endDate.toEpochDay() - startDate.toEpochDay();
        LocalDateTime prevStart = start.minusDays(days);
        LocalDateTime prevEnd = start.minusSeconds(1);

        BigDecimal revenue = orderRepository.sumRevenueBetween(start, end);
        BigDecimal prevRevenue = orderRepository.sumRevenueBetween(prevStart, prevEnd);
        long orders = orderRepository.countOrdersBetween(start, end);
        long prevOrders = orderRepository.countOrdersBetween(prevStart, prevEnd);
        long customers = customerRepository.countActiveCustomers();

        BigDecimal aov = (orders > 0)
                ? revenue.divide(BigDecimal.valueOf(orders), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        BigDecimal prevAov = (prevOrders > 0)
                ? prevRevenue.divide(BigDecimal.valueOf(prevOrders), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        long prevCustomers = customerRepository.countActiveCustomers(); // Note: Simplified, actual history needs a temporal query. Assuming 0 growth if no temporal data exists.

        double revenueGrowth = growthPercent(prevRevenue, revenue);
        double orderGrowth = growthPercent(BigDecimal.valueOf(prevOrders), BigDecimal.valueOf(orders));
        double aovGrowth = growthPercent(prevAov, aov);
        double customerGrowth = growthPercent(BigDecimal.valueOf(prevCustomers), BigDecimal.valueOf(customers));

        return KpiResponse.builder()
                .totalRevenue(revenue)
                .totalOrders(orders)
                .averageOrderValue(aov)
                .totalCustomers(customers)
                .revenueGrowthPercent(revenueGrowth)
                .orderGrowthPercent(orderGrowth)
                .customerGrowthPercent(customerGrowth)
                .averageOrderValueGrowthPercent(aovGrowth)
                .build();
    }

    public List<SalesTrendDto> getSalesTrend(LocalDate startDate, LocalDate endDate, String period, String region) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);

        String fmt = switch (period) {
            case "week" -> "%Y-W%u";
            case "month" -> "%Y-%m";
            default -> "%Y-%m-%d";
        };

        List<Object[]> rows = orderRepository.salesTrend(start, end, fmt, region);
        return rows.stream().map(row -> SalesTrendDto.builder()
                .period((String) row[0])
                .revenue((BigDecimal) row[1])
                .orderCount(((Number) row[2]).longValue())
                .build()).collect(Collectors.toList());
    }

    public List<CustomerSegmentDto> getCustomerSegments() {
        List<Object[]> rows = customerRepository.countBySegment();
        long total = rows.stream().mapToLong(r -> ((Number) r[1]).longValue()).sum();
        return rows.stream().map(row -> {
            long count = ((Number) row[1]).longValue();
            return CustomerSegmentDto.builder()
                    .segment((String) row[0])
                    .count(count)
                    .percentage(total > 0 ? (count * 100.0 / total) : 0)
                    .build();
        }).collect(Collectors.toList());
    }

    public List<ProductPerformanceDto> getTopProducts(LocalDate startDate, LocalDate endDate, Long categoryId,
            int limit) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);
        List<Object[]> rows = productRepository.topProductsByRevenue(start, end, categoryId, limit);
        return rows.stream().map(row -> {
            BigDecimal revenue = (BigDecimal) row[4];
            BigDecimal margin = (BigDecimal) row[6];
            double marginPct = (revenue != null && revenue.compareTo(BigDecimal.ZERO) > 0 && margin != null)
                    ? margin.divide(revenue, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue()
                    : 0.0;
            return ProductPerformanceDto.builder()
                    .productId(((Number) row[0]).longValue())
                    .productName((String) row[1])
                    .sku((String) row[2])
                    .category((String) row[3])
                    .totalRevenue(revenue)
                    .unitsSold(((Number) row[5]).longValue())
                    .grossMargin(margin)
                    .marginPercent(marginPct)
                    .build();
        }).collect(Collectors.toList());
    }

    public List<Object> getInventoryTurnover() {
        List<Object[]> rows = productRepository.inventoryTurnover();
        List<Object> result = new ArrayList<>();
        for (Object[] row : rows) {
            result.add(new java.util.LinkedHashMap<String, Object>() {
                {
                    put("productId", ((Number) row[0]).longValue());
                    put("productName", row[1]);
                    put("sku", row[2]);
                    put("stockQuantity", ((Number) row[3]).intValue());
                    put("unitsSold", ((Number) row[4]).longValue());
                    put("turnoverRate", ((Number) row[5]).doubleValue());
                }
            });
        }
        return result;
    }

    public List<Object> getSalesByRegion(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);
        List<Object[]> rows = orderRepository.salesByRegion(start, end);
        List<Object> result = new ArrayList<>();
        for (Object[] row : rows) {
            result.add(new java.util.LinkedHashMap<String, Object>() {
                {
                    put("region", row[0]);
                    put("revenue", row[1]);
                    put("orderCount", ((Number) row[2]).longValue());
                }
            });
        }
        return result;
    }

    private double growthPercent(BigDecimal prev, BigDecimal current) {
        if (prev == null || prev.compareTo(BigDecimal.ZERO) == 0)
            return 0.0;
        return current.subtract(prev)
                .divide(prev, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .doubleValue();
    }
}
