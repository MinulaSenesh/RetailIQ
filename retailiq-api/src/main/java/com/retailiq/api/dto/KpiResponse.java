package com.retailiq.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KpiResponse {
    private BigDecimal totalRevenue;
    private long totalOrders;
    private BigDecimal averageOrderValue;
    private long totalCustomers;
    private double revenueGrowthPercent;
    private double orderGrowthPercent;
    private double customerGrowthPercent;
    private double averageOrderValueGrowthPercent;
}
