package com.retailiq.api.controller;

import com.retailiq.api.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@Tag(name = "Reports", description = "Endpoints for downloading CSV data exports")
@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @Operation(summary = "Export Sales CSV", description = "Downloads daily sales trend data as a CSV file")
    @GetMapping(value = "/export/sales", produces = "text/csv")
    public ResponseEntity<byte[]> exportSales(
            @RequestParam(name = "start_date", defaultValue = "#{T(java.time.LocalDate).now().minusMonths(1).toString()}") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start_date,
            @RequestParam(name = "end_date", defaultValue = "#{T(java.time.LocalDate).now().toString()}") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end_date) {
        
        String csvData = reportService.generateSalesCsv(start_date, end_date);
        byte[] csvBytes = csvData.getBytes();

        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=sales_report_" + start_date + "_to_" + end_date + ".csv");
        headers.setContentType(MediaType.parseMediaType("text/csv"));

        return ResponseEntity.ok()
                .headers(headers)
                .body(csvBytes);
    }

    @Operation(summary = "Export Products CSV", description = "Downloads top products performance data as a CSV file")
    @GetMapping(value = "/export/products", produces = "text/csv")
    public ResponseEntity<byte[]> exportProducts(
            @RequestParam(name = "start_date", defaultValue = "#{T(java.time.LocalDate).now().minusMonths(1).toString()}") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start_date,
            @RequestParam(name = "end_date", defaultValue = "#{T(java.time.LocalDate).now().toString()}") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end_date) {
        
        String csvData = reportService.generateProductsCsv(start_date, end_date);
        byte[] csvBytes = csvData.getBytes();

        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=products_report_" + start_date + "_to_" + end_date + ".csv");
        headers.setContentType(MediaType.parseMediaType("text/csv"));

        return ResponseEntity.ok()
                .headers(headers)
                .body(csvBytes);
    }

    @Operation(summary = "Export Sales PDF", description = "Downloads detailed sales report as a PDF file")
    @GetMapping(value = "/export/sales/pdf", produces = "application/pdf")
    public ResponseEntity<byte[]> exportSalesPdf(
            @RequestParam(name = "start_date", defaultValue = "#{T(java.time.LocalDate).now().minusMonths(1).toString()}") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start_date,
            @RequestParam(name = "end_date", defaultValue = "#{T(java.time.LocalDate).now().toString()}") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end_date) {
        
        byte[] pdfBytes = reportService.generateSalesPdf(start_date, end_date);

        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=sales_report_" + start_date + "_to_" + end_date + ".pdf");
        headers.setContentType(MediaType.APPLICATION_PDF);

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }

    @Operation(summary = "Export Products PDF", description = "Downloads top products performance data as a PDF file")
    @GetMapping(value = "/export/products/pdf", produces = "application/pdf")
    public ResponseEntity<byte[]> exportProductsPdf(
            @RequestParam(name = "start_date", defaultValue = "#{T(java.time.LocalDate).now().minusMonths(1).toString()}") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start_date,
            @RequestParam(name = "end_date", defaultValue = "#{T(java.time.LocalDate).now().toString()}") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end_date) {
        
        byte[] pdfBytes = reportService.generateProductsPdf(start_date, end_date);

        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=products_report_" + start_date + "_to_" + end_date + ".pdf");
        headers.setContentType(MediaType.APPLICATION_PDF);

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }
}
