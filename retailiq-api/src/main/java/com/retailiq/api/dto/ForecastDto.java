package com.retailiq.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ForecastDto {
    private List<ForecastPoint> predictions;
    private double mae;
    private double rmse;
    private double r2;
    private int daysForecasted;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ForecastPoint {
        private String date;
        private BigDecimal predicted;
        private BigDecimal lowerBound;
        private BigDecimal upperBound;
    }
}
