package com.retailiq.api.service;

import com.retailiq.api.entity.Order;
import com.retailiq.api.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final OrderRepository orderRepository;

    @Value("${payhere.merchant.id:1211149}")
    private String merchantId;

    @Value("${payhere.merchant.secret:4MmB47Z76i476I25S4E184R4S142n22I53D52E22}")
    private String merchantSecret;

    @Transactional(readOnly = true)
    public Map<String, Object> getPayHereParams(Long orderId) {
        log.info("Generating PayHere params for order ID: {}", orderId);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> {
                    log.error("Order not found: {}", orderId);
                    return new com.retailiq.api.exception.ResourceNotFoundException("Order", "id", orderId);
                });

        log.debug("Order fetched: #{}", order.getOrderId());
        if (order.getCustomer() == null) {
            log.error("Customer is NULL for order: {}", orderId);
            throw new RuntimeException("Customer not found for order " + orderId);
        }
        
        // PayHere strictly requires 2 decimal places with dot separator (e.g., 3000.00)
        DecimalFormat df = new DecimalFormat("0.00", DecimalFormatSymbols.getInstance(Locale.US));
        String amountFormatted = df.format(order.getTotalAmount());
        String currency = "LKR";
        String orderIdStr = order.getOrderId().toString();
        
        // Generate Hash: UpperCase(MD5(merchant_id + order_id + amount + currency + UpperCase(MD5(merchant_secret))))
        String hash = generateHash(orderIdStr, amountFormatted, currency);

        // Build parameters map - ensuring all are strings for consistency
        Map<String, Object> params = new HashMap<>();
        params.put("merchant_id", merchantId);
        params.put("order_id", orderIdStr);
        params.put("amount", amountFormatted);
        params.put("currency", currency);
        params.put("hash", hash);
        params.put("first_name", order.getCustomer().getFirstName());
        params.put("last_name", order.getCustomer().getLastName());
        params.put("email", order.getCustomer().getEmail());
        params.put("phone", order.getCustomer().getPhone() != null && !order.getCustomer().getPhone().isBlank() 
                  ? order.getCustomer().getPhone() : "0771234567");
        params.put("address", order.getCustomer().getAddress() != null && !order.getCustomer().getAddress().isBlank() 
                  ? order.getCustomer().getAddress() : "No 123, Main Street");
        params.put("city", order.getCustomer().getCity() != null && !order.getCustomer().getCity().isBlank() 
                  ? order.getCustomer().getCity() : "Colombo");
        params.put("country", "Sri Lanka");
        
        // Add delivery info (can be same as billing for simplicity)
        params.put("delivery_address", params.get("address"));
        params.put("delivery_city", params.get("city"));
        params.put("delivery_country", params.get("country"));
        
        params.put("items", "RetailIQ Order " + orderIdStr);
        
        log.info("PayHere params generated successfully. Hash: {}", hash);
        return params;
    }

    public void processPayHereNotification(Map<String, String> params) {
        String orderId = params.get("order_id");
        String payhereAmount = params.get("payhere_amount");
        String payhereCurrency = params.get("payhere_currency");
        String statusCode = params.get("status_code");
        String md5sig = params.get("md5sig");

        // Verify Hash
        String localHash = generateHashForNotification(orderId, payhereAmount, payhereCurrency, statusCode);
        
        if (!localHash.equalsIgnoreCase(md5sig)) {
            log.error("PayHere notification hash mismatch! Potential fraud attempt for order: {}", orderId);
            log.debug("Local Hash: {}, Received Hash: {}", localHash, md5sig);
            return;
        }

        Order order = orderRepository.findById(Long.parseLong(orderId)).orElse(null);
        if (order == null) {
            log.error("Order not found from PayHere notification: {}", orderId);
            return;
        }

        if ("2".equals(statusCode)) { // 2 = Success
            order.setPaymentStatus("PAID");
            order.setStatus("CONFIRMED");
            order.setTransactionId(params.get("payment_id"));
            orderRepository.save(order);
            log.info("Order {} marked as PAID via PayHere notification", orderId);
        } else if ("-2".equals(statusCode)) { // -2 = Canceled
            order.setPaymentStatus("CANCELED");
            orderRepository.save(order);
        } else if ("0".equals(statusCode)) { // 0 = Pending
            order.setPaymentStatus("PENDING_GATEWAY");
            orderRepository.save(order);
        } else {
            order.setPaymentStatus("FAILED");
            orderRepository.save(order);
        }
    }

    private String generateHash(String orderId, String amount, String currency) {
        String merchantSecretHash = DigestUtils.md5Hex(merchantSecret).toUpperCase();
        String source = merchantId + orderId + amount + currency + merchantSecretHash;
        String finalHash = DigestUtils.md5Hex(source).toUpperCase();
        log.info("PAYHERE_HASH_DEBUG: source='{}', finalHash='{}'", source, finalHash);
        return finalHash;
    }

    private String generateHashForNotification(String orderId, String amount, String currency, String statusCode) {
        String merchantSecretHash = DigestUtils.md5Hex(merchantSecret).toUpperCase();
        String source = merchantId + orderId + amount + currency + statusCode + merchantSecretHash;
        return DigestUtils.md5Hex(source).toUpperCase();
    }
}
