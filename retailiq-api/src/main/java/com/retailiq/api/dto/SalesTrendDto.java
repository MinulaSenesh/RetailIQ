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
public class SalesTrendDto {
    private String period; // e.g. "2026-03-11" or "2026-W10" or "2026-03"
    private BigDecimal revenue;
    private long orderCount;
}
