package com.retailiq.api.service;

import com.retailiq.api.dto.OrderCheckoutRequest;
import com.retailiq.api.entity.Customer;
import com.retailiq.api.entity.Order;
import com.retailiq.api.entity.OrderItem;
import com.retailiq.api.entity.Product;
import com.retailiq.api.repository.CustomerRepository;
import com.retailiq.api.repository.OrderRepository;
import com.retailiq.api.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;

    @Transactional
    public Order checkout(OrderCheckoutRequest request) {
        Customer customer = customerRepository.findByUserUserId(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        Order order = Order.builder()
                .customer(customer)
                .orderDate(LocalDateTime.now())
                .status("PENDING")
                .totalAmount(request.getTotalAmount())
                .discountAmount(BigDecimal.ZERO)
                .shippingAddress(customer.getCity() + ", " + customer.getCountry())
                .build();

        var items = request.getItems().stream().map(reqItem -> {
            Product product = productRepository.findById(reqItem.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            if (product.getStockQuantity() < reqItem.getQuantity()) {
                throw new RuntimeException("Not enough stock for " + product.getProductName());
            }

            product.setStockQuantity(product.getStockQuantity() - reqItem.getQuantity());
            productRepository.save(product);

            return OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(reqItem.getQuantity())
                    .unitPrice(reqItem.getPrice())
                    .build();
        }).collect(Collectors.toList());

        order.setItems(items);
        return orderRepository.save(order);
    }
}
