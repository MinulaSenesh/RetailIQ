package com.retailiq.api.service;

import com.retailiq.api.dto.ProductPerformanceDto;
import com.retailiq.api.dto.SalesTrendDto;
import com.lowagie.text.Document;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final AnalyticsService analyticsService;
    private final com.retailiq.api.repository.OrderRepository orderRepository;

    public String generateSalesCsv(LocalDate startDate, LocalDate endDate) {
        java.time.LocalDateTime start = startDate.atStartOfDay();
        java.time.LocalDateTime end = endDate.atTime(23, 59, 59);
        List<com.retailiq.api.entity.Order> orders = orderRepository.findOrdersWithCustomerBetween(start, end);
        
        StringBuilder csvBuilder = new StringBuilder();
        // Updated to be compatible with Data Upload ETL (order_id, customer_email, product_sku, quantity, unit_price, order_date)
        csvBuilder.append("order_id,order_date,customer_name,customer_email,segment,region,status,payment_method,total_amount,discount_amount,unit_price,quantity,product_sku\n");
        
        java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        
        for (com.retailiq.api.entity.Order order : orders) {
            String customerName = order.getCustomer().getFirstName() + " " + order.getCustomer().getLastName();
            
            // For a basic export that is re-importable, we take the first item's SKU/Price/Qty if needed, 
            // but ideally we'd export line-items. For now, we align headers and add placeholders for missing ETL required fields.
            String sku = "UNKNOWN";
            int qty = 1;
            java.math.BigDecimal price = order.getTotalAmount();
            
            if (order.getItems() != null && !order.getItems().isEmpty()) {
                var item = order.getItems().iterator().next();
                sku = item.getProduct() != null ? item.getProduct().getSku() : "UNKNOWN";
                qty = item.getQuantity();
                price = item.getUnitPrice();
            }

            csvBuilder.append(String.format("%d,\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",%.2f,%.2f,%.2f,%d,\"%s\"\n", 
                    order.getOrderId(), 
                    order.getOrderDate().format(formatter),
                    customerName.replace("\"", "\"\""),
                    order.getCustomer().getEmail(),
                    order.getCustomer().getSegment() != null ? order.getCustomer().getSegment() : "Unknown",
                    order.getRegion() != null ? order.getRegion() : "Unknown",
                    order.getStatus(),
                    order.getPaymentMethod() != null ? order.getPaymentMethod() : "Unknown",
                    order.getTotalAmount(), 
                    order.getDiscountAmount() != null ? order.getDiscountAmount() : java.math.BigDecimal.ZERO,
                    price,
                    qty,
                    sku));
        }
        
        return csvBuilder.toString();
    }

    public String generateProductsCsv(LocalDate startDate, LocalDate endDate) {
        List<ProductPerformanceDto> products = analyticsService.getTopProducts(startDate, endDate, null, 1000);
        
        StringBuilder csvBuilder = new StringBuilder();
        csvBuilder.append("Product ID,Product Name,Category,Units Sold,Total Revenue,Margin %\n");
        
        for (ProductPerformanceDto product : products) {
            csvBuilder.append(String.format("%d,\"%s\",\"%s\",%d,%.2f,%.2f\n",
                    product.getProductId(),
                    product.getProductName().replace("\"", "\"\""), // Escape quotes
                    product.getCategory(),
                    product.getUnitsSold(),
                    product.getTotalRevenue(),
                    product.getMarginPercent()));
        }
        
        return csvBuilder.toString();
    }

    public byte[] generateSalesPdf(LocalDate startDate, LocalDate endDate) {
        java.time.LocalDateTime start = startDate.atStartOfDay();
        java.time.LocalDateTime end = endDate.atTime(23, 59, 59);
        List<com.retailiq.api.entity.Order> orders = orderRepository.findOrdersWithCustomerBetween(start, end);

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4.rotate());
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Paragraph title = new Paragraph("RetailIQ Sales Report", titleFont);
            title.setAlignment(com.lowagie.text.Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            PdfPTable table = new PdfPTable(7);
            table.setWidthPercentage(100);
            table.setWidths(new float[] { 1, 2, 2, 1.5f, 1.5f, 1.5f, 1.5f });

            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
            String[] headers = { "ID", "Date", "Customer", "Segment", "Status", "Payment", "Net Amount" };
            for (String header : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(header, headerFont));
                cell.setBackgroundColor(Color.LIGHT_GRAY);
                cell.setPadding(5);
                table.addCell(cell);
            }

            Font rFont = FontFactory.getFont(FontFactory.HELVETICA, 9);
            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");

            for (com.retailiq.api.entity.Order order : orders) {
                table.addCell(new Phrase(String.valueOf(order.getOrderId()), rFont));
                table.addCell(new Phrase(order.getOrderDate().format(fmt), rFont));
                table.addCell(new Phrase(order.getCustomer().getFirstName() + " " + order.getCustomer().getLastName(), rFont));
                table.addCell(new Phrase(order.getCustomer().getSegment() != null ? order.getCustomer().getSegment() : "Unknown", rFont));
                table.addCell(new Phrase(order.getStatus(), rFont));
                table.addCell(new Phrase(order.getPaymentMethod() != null ? order.getPaymentMethod() : "Unknown", rFont));
                
                java.math.BigDecimal net = order.getTotalAmount().subtract(order.getDiscountAmount() != null ? order.getDiscountAmount() : java.math.BigDecimal.ZERO);
                table.addCell(new Phrase(String.format("Rs. %.2f", net.doubleValue()), rFont));
            }

            document.add(table);
            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate Sales PDF", e);
        }
    }

    public byte[] generateProductsPdf(LocalDate startDate, LocalDate endDate) {
        List<ProductPerformanceDto> products = analyticsService.getTopProducts(startDate, endDate, null, 100);

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Paragraph title = new Paragraph("RetailIQ Top Products Report", titleFont);
            title.setAlignment(com.lowagie.text.Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            PdfPTable table = new PdfPTable(6);
            table.setWidthPercentage(100);
            table.setWidths(new float[] { 1, 3, 2, 1.5f, 1.5f, 1.5f });

            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
            String[] headers = { "ID", "Product Name", "Category", "Units Sold", "Revenue", "Margin %" };
            for (String header : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(header, headerFont));
                cell.setBackgroundColor(Color.LIGHT_GRAY);
                cell.setPadding(5);
                table.addCell(cell);
            }

            Font rFont = FontFactory.getFont(FontFactory.HELVETICA, 9);
            for (ProductPerformanceDto p : products) {
                table.addCell(new Phrase(String.valueOf(p.getProductId()), rFont));
                table.addCell(new Phrase(p.getProductName(), rFont));
                table.addCell(new Phrase(p.getCategory(), rFont));
                table.addCell(new Phrase(String.valueOf(p.getUnitsSold()), rFont));
                table.addCell(new Phrase(String.format("Rs. %.2f", p.getTotalRevenue().doubleValue()), rFont));
                table.addCell(new Phrase(String.format("%.1f%%", p.getMarginPercent()), rFont));
            }

            document.add(table);
            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate Products PDF", e);
        }
    }
}
