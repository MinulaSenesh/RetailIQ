package com.retailiq.api.controller;

import com.retailiq.api.dto.OrderCheckoutRequest;
import com.retailiq.api.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.retailiq.api.entity.Order;
import com.retailiq.api.exception.ApiResponse;
import com.retailiq.api.exception.ResourceNotFoundException;
import com.retailiq.api.repository.OrderRepository;
import com.retailiq.api.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

        private final OrderRepository orderRepository;
        private final UserRepository userRepository;
        private final OrderService orderService;

        @GetMapping
        public ResponseEntity<ApiResponse<List<Order>>> getAll(
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "50") int size,
                        @RequestParam(required = false) String status) {

                Page<Order> paged = orderRepository.findAll(
                                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "orderDate")));
                List<Order> orders = paged.getContent();
                if (status != null && !status.isBlank()) {
                        orders = orders.stream()
                                        .filter(o -> status.equalsIgnoreCase(o.getStatus()))
                                        .toList();
                }
                return ResponseEntity.ok(ApiResponse.success(orders,
                                "Orders retrieved — page " + page + " of " + paged.getTotalPages()));
        }

        @GetMapping("/my-orders")
        public ResponseEntity<ApiResponse<List<Order>>> getMyOrders() {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                String email = auth.getName();
                com.retailiq.api.entity.User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
                List<Order> orders = orderRepository.findMyOrders(user.getUserId());
                return ResponseEntity.ok(ApiResponse.success(orders, "My orders retrieved"));
        }

        @PostMapping("/checkout")
        public ResponseEntity<ApiResponse<Order>> checkout(@RequestBody OrderCheckoutRequest request) {
                Order order = orderService.checkout(request);
                return ResponseEntity.ok(ApiResponse.success(order, "Checkout completed successfully"));
        }

        @GetMapping("/{id}")
        public ResponseEntity<ApiResponse<Order>> getById(@PathVariable Long id) {
                Order order = orderRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
                return ResponseEntity.ok(ApiResponse.success(order, "Order retrieved"));
        }

        @PutMapping("/{id}/status")
        public ResponseEntity<ApiResponse<Order>> updateStatus(
                        @PathVariable Long id,
                        @RequestParam String status) {
                Order order = orderRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
                order.setStatus(status);
                return ResponseEntity.ok(ApiResponse.success(orderRepository.save(order), "Order status updated"));
        }
}
