package com.retailiq.api.controller;

import com.retailiq.api.entity.Order;
import com.retailiq.api.exception.ApiResponse;
import com.retailiq.api.exception.ResourceNotFoundException;
import com.retailiq.api.repository.OrderRepository;
import com.retailiq.api.security.JwtTokenProvider;
import com.retailiq.api.service.OrderService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.*;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(OrderController.class)
class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private OrderRepository orderRepository;

    @MockBean
    private OrderService orderService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private UserDetailsService userDetailsService;

    @Test
    @WithMockUser(username = "admin@retailiq.com", roles = {"ADMIN"})
    void testGetAllOrders_Success() throws Exception {
        Order order = Order.builder()
                .orderId(1L)
                .status("Completed")
                .totalAmount(new BigDecimal("150.00"))
                .orderDate(LocalDateTime.of(2026, 3, 10, 10, 30))
                .build();

        Page<Order> page = new PageImpl<>(List.of(order), PageRequest.of(0, 50, Sort.by(Sort.Direction.DESC, "orderDate")), 1);
        when(orderRepository.findAll(any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get("/api/v1/orders")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].orderId").value(1))
                .andExpect(jsonPath("$.data[0].status").value("Completed"));
    }

    @Test
    @WithMockUser(username = "admin@retailiq.com", roles = {"ADMIN"})
    void testGetOrderById_Success() throws Exception {
        Order order = Order.builder()
                .orderId(5L)
                .status("Pending")
                .totalAmount(new BigDecimal("99.99"))
                .build();

        when(orderRepository.findById(5L)).thenReturn(Optional.of(order));

        mockMvc.perform(get("/api/v1/orders/5")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.orderId").value(5))
                .andExpect(jsonPath("$.data.status").value("Pending"));
    }

    @Test
    @WithMockUser(username = "admin@retailiq.com", roles = {"ADMIN"})
    void testGetOrderById_NotFound() throws Exception {
        when(orderRepository.findById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/v1/orders/999")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }
}
