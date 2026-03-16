package com.retailiq.api.service;

import com.retailiq.api.dto.CustomerSegmentDto;
import com.retailiq.api.dto.KpiResponse;
import com.retailiq.api.dto.SalesTrendDto;
import com.retailiq.api.repository.CustomerRepository;
import com.retailiq.api.repository.OrderRepository;
import com.retailiq.api.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AnalyticsServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private AnalyticsService analyticsService;

    @Test
    void testGetKpis_CalculatesGrowthCorrectly() {
        LocalDate end = LocalDate.of(2026, 3, 12);
        LocalDate start = end.minusDays(30);

        // Current period
        when(orderRepository.sumRevenueBetween(
                eq(start.atStartOfDay()), eq(end.atTime(23, 59, 59))))
                .thenReturn(new BigDecimal("15000.00"));
        when(orderRepository.countOrdersBetween(
                eq(start.atStartOfDay()), eq(end.atTime(23, 59, 59))))
                .thenReturn(150L);
        when(customerRepository.countActiveCustomersAt(any())).thenReturn(500L);

        // Previous period (30 days prior)
        LocalDateTime prevStart = start.atStartOfDay().minusDays(30);
        LocalDateTime prevEnd = start.atStartOfDay().minusSeconds(1);
        
        when(orderRepository.sumRevenueBetween(eq(prevStart), eq(prevEnd)))
                .thenReturn(new BigDecimal("10000.00"));
        when(orderRepository.countOrdersBetween(eq(prevStart), eq(prevEnd)))
                .thenReturn(100L);

        KpiResponse response = analyticsService.getKpis(start, end);

        assertNotNull(response);
        assertEquals(new BigDecimal("15000.00"), response.getTotalRevenue());
        assertEquals(150L, response.getTotalOrders());
        assertEquals(new BigDecimal("100.00"), response.getAverageOrderValue());
        assertEquals(50.0, response.getRevenueGrowthPercent()); // (15000 - 10000) / 10000 * 100
        assertEquals(50.0, response.getOrderGrowthPercent());   // (150 - 100) / 100 * 100
        assertEquals(500L, response.getTotalCustomers());
    }

    @Test
    void testGetSalesTrend() {
        LocalDate end = LocalDate.of(2026, 3, 12);
        LocalDate start = end.minusDays(7);

        List<Object[]> queryResult = new ArrayList<>();
        queryResult.add(new Object[]{"2026-03-10", new BigDecimal("500.00"), 5L});
        queryResult.add(new Object[]{"2026-03-11", new BigDecimal("750.00"), 7L});

        when(orderRepository.salesTrend(any(LocalDateTime.class), any(LocalDateTime.class), eq("%Y-%m-%d"), eq(null)))
                .thenReturn(queryResult);

        List<SalesTrendDto> response = analyticsService.getSalesTrend(start, end, "day", null);

        assertNotNull(response);
        assertEquals(2, response.size());
        assertEquals("2026-03-10", response.get(0).getPeriod());
        assertEquals(new BigDecimal("500.00"), response.get(0).getRevenue());
        assertEquals(5L, response.get(0).getOrderCount());
    }

    @Test
    void testGetCustomerSegments_CalculatesPercentages() {
        List<Object[]> queryResult = new ArrayList<>();
        queryResult.add(new Object[]{"Champions", 50L});
        queryResult.add(new Object[]{"At Risk", 150L});

        when(customerRepository.countBySegment()).thenReturn(queryResult);

        List<CustomerSegmentDto> response = analyticsService.getCustomerSegments();

        assertNotNull(response);
        assertEquals(2, response.size());
        assertEquals("Champions", response.get(0).getSegment());
        assertEquals(50L, response.get(0).getCount());
        assertEquals(25.0, response.get(0).getPercentage()); // 50 / (50 + 150)

        assertEquals("At Risk", response.get(1).getSegment());
        assertEquals(150L, response.get(1).getCount());
        assertEquals(75.0, response.get(1).getPercentage()); // 150 / 200
    }
}
