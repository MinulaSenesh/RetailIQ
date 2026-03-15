package com.retailiq.api.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class OrderCheckoutRequest {
    private Long customerId;
    private List<Item> items;
    private BigDecimal totalAmount;

    @Data
    public static class Item {
        private Long productId;
        private Integer quantity;
        private BigDecimal price;
    }
}
