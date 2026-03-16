package com.retailiq.api.controller;

import com.retailiq.api.dto.*;
import com.retailiq.api.exception.ApiResponse;
import com.retailiq.api.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Tag(name = "Analytics", description = "KPI dashboard, sales trends, forecasting, and customer segment analytics")
@Slf4j
@RestController
@RequestMapping("/api/v1/analytics")
public class AnalyticsController {

        private final AnalyticsService analyticsService;
        private final RestClient restClient;

        public AnalyticsController(AnalyticsService analyticsService,
                        @Value("${analytics.service.url:http://localhost:8000}") String analyticsServiceUrl) {
                this.analyticsService = analyticsService;
                this.restClient = RestClient.builder()
                                .baseUrl(analyticsServiceUrl)
                                .build();
        }

        @Operation(summary = "Get KPI summary", description = "Returns total revenue, orders, AOV, and customer counts with growth percentages vs previous period")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "KPIs retrieved successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid date parameters"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
        })
        @GetMapping("/kpis")
        @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'ANALYST', 'VIEWER')")
        public ResponseEntity<ApiResponse<KpiResponse>> getKpis(
                        @Parameter(description = "Start date (YYYY-MM-DD)") @RequestParam(name = "start_date", defaultValue = "#{T(java.time.LocalDate).now().minusMonths(1).toString()}") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start_date,
                        @Parameter(description = "End date (YYYY-MM-DD)") @RequestParam(name = "end_date", defaultValue = "#{T(java.time.LocalDate).now().toString()}") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end_date) {
                return ResponseEntity.ok(
                                ApiResponse.success(analyticsService.getKpis(start_date, end_date), "KPIs retrieved"));
        }

        @Operation(summary = "Get sales trend", description = "Returns daily, weekly, or monthly revenue trend within the date range")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Sales trend retrieved"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid parameters"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
        })
        @GetMapping("/sales/trend")
        @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'ANALYST', 'VIEWER')")
        public ResponseEntity<ApiResponse<List<SalesTrendDto>>> getSalesTrend(
                        @Parameter(description = "Start date") @RequestParam(name = "start_date", defaultValue = "#{T(java.time.LocalDate).now().minusMonths(3).toString()}") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start_date,
                        @Parameter(description = "End date") @RequestParam(name = "end_date", defaultValue = "#{T(java.time.LocalDate).now().toString()}") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end_date,
                        @Parameter(description = "Aggregation period: day, week, month") @RequestParam(name = "period", defaultValue = "day") String period,
                        @Parameter(description = "Filter by region") @RequestParam(name = "region", required = false) String region) {
                return ResponseEntity.ok(ApiResponse.success(
                                analyticsService.getSalesTrend(start_date, end_date, period, region),
                                "Sales trend retrieved"));
        }

        @Operation(summary = "Get sales by region", description = "Returns revenue and order count grouped by geographic region")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Regional data retrieved"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
        })
        @GetMapping("/sales/by-region")
        @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'ANALYST', 'VIEWER')")
        public ResponseEntity<ApiResponse<List<Object>>> getSalesByRegion(
                        @RequestParam(name = "start_date", defaultValue = "#{T(java.time.LocalDate).now().minusMonths(1).toString()}") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start_date,
                        @RequestParam(name = "end_date", defaultValue = "#{T(java.time.LocalDate).now().toString()}") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end_date) {
                return ResponseEntity.ok(ApiResponse.success(analyticsService.getSalesByRegion(start_date, end_date),
                                "Sales by region retrieved"));
        }

        @Operation(summary = "Get customer segments", description = "Returns RFM-based customer segment breakdown with counts and percentages")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Segments retrieved"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
        })
        @GetMapping("/customers/segments")
        @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'ANALYST', 'VIEWER')")
        public ResponseEntity<ApiResponse<List<CustomerSegmentDto>>> getCustomerSegments() {
                return ResponseEntity
                                .ok(ApiResponse.success(analyticsService.getCustomerSegments(),
                                                "Customer segments retrieved"));
        }

        @Operation(summary = "Get top products", description = "Returns top N products by revenue with margin analysis")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Products retrieved"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
        })
        @GetMapping("/products/top")
        @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'ANALYST', 'VIEWER')")
        public ResponseEntity<ApiResponse<List<ProductPerformanceDto>>> getTopProducts(
                        @RequestParam(name = "start_date", defaultValue = "#{T(java.time.LocalDate).now().minusMonths(1).toString()}") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start_date,
                        @RequestParam(name = "end_date", defaultValue = "#{T(java.time.LocalDate).now().toString()}") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end_date,
                        @Parameter(description = "Filter by category ID") @RequestParam(name = "category_id", required = false) Long category_id,
                        @Parameter(description = "Max records to return") @RequestParam(name = "limit", defaultValue = "10") int limit) {
                return ResponseEntity.ok(ApiResponse.success(
                                analyticsService.getTopProducts(start_date, end_date, category_id, limit),
                                "Top products retrieved"));
        }

        @Operation(summary = "Get inventory turnover", description = "Returns inventory turnover rate for all active products")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Inventory data retrieved"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
        })
        @GetMapping("/inventory/turnover")
        @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'ANALYST', 'VIEWER')")
        public ResponseEntity<ApiResponse<List<Object>>> getInventoryTurnover() {
                return ResponseEntity
                                .ok(ApiResponse.success(analyticsService.getInventoryTurnover(),
                                                "Inventory turnover retrieved"));
        }

        @Operation(summary = "Get sales forecast", description = "Returns ML-based sales forecast from Python analytics microservice")
        @GetMapping("/forecast")
        @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'ANALYST', 'VIEWER')")
        public ResponseEntity<ApiResponse<Object>> getForecast(
                        @RequestParam(name = "days", defaultValue = "30") int days) {
                try {
                        Object result = restClient.get()
                                        .uri("/forecast/sales?days=" + days)
                                        .retrieve()
                                        .body(Object.class);
                        return ResponseEntity.ok(ApiResponse.success(result, "Forecast retrieved"));
                } catch (Exception e) {
                        log.warn("Analytics microservice unavailable for forecast: {}", e.getMessage());
                        return ResponseEntity.ok(ApiResponse.success(
                                        Map.of("forecast", Collections.emptyList(),
                                                        "message",
                                                        "Analytics service offline — start retailiq-analytics to enable forecasting"),
                                        "Forecast service unavailable"));
                }
        }
}

