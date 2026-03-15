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
public class ProductPerformanceDto {
    private Long productId;
    private String productName;
    private String sku;
    private String category;
    private BigDecimal totalRevenue;
    private long unitsSold;
    private BigDecimal grossMargin;
    private double marginPercent;
}
