package com.retailiq.api.service;

import com.retailiq.api.entity.AuditLog;
import com.retailiq.api.entity.User;
import com.retailiq.api.repository.AuditLogRepository;
import com.retailiq.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public void logAction(String action, String tableName, Long recordId, String details) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = (authentication != null && authentication.getName() != null)
                    ? authentication.getName()
                    : "system";

            User user = null;
            if (!"system".equals(email) && !"anonymousUser".equals(email)) {
                user = userRepository.findByEmail(email).orElse(null);
            }

            String ipAddress = "unknown";
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder
                    .getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                ipAddress = request.getRemoteAddr();
            }

            AuditLog logEntry = AuditLog.builder()
                    .user(user)
                    .action(action)
                    .tableName(tableName)
                    .recordId(recordId)
                    .details(details)
                    .ipAddress(ipAddress)
                    .build();

            auditLogRepository.save(logEntry);
        } catch (Exception e) {
            log.error("Failed to save audit log: {}", e.getMessage());
        }
    }
}
