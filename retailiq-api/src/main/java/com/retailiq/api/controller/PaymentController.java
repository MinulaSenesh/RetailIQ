package com.retailiq.api.controller;

import com.retailiq.api.exception.ApiResponse;
import com.retailiq.api.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping("/payhere/params/{orderId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPayHereParams(@PathVariable("orderId") Long orderId) {
        return ResponseEntity.ok(ApiResponse.success(
            paymentService.getPayHereParams(orderId), 
            "PayHere parameters generated"
        ));
    }

    @PostMapping("/payhere/notify")
    public ResponseEntity<String> handlePayHereNotification(@RequestParam Map<String, String> params) {
        paymentService.processPayHereNotification(params);
        return ResponseEntity.ok("OK");
    }
}
