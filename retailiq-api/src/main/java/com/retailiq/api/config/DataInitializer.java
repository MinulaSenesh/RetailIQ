package com.retailiq.api.config;

import com.retailiq.api.entity.User;
import com.retailiq.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Ensures seed user passwords are correctly BCrypt-hashed on startup.
 * This runs in dev/default profiles only and is idempotent.
 */
@Slf4j
@Component
@RequiredArgsConstructor
@Profile("!test")
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @org.springframework.beans.factory.annotation.Value("${seed.user.password:password}")
    private String seedPassword;

    @Override
    @Transactional
    public void run(String... args) {
        cleanDuplicateUsers("admin@retailiq.com", "Admin User", "ADMIN");
        cleanDuplicateUsers("community@retailiq.com", "Community Viewer", "VIEWER");
        cleanDuplicateUsers("analyst@retailiq.com", "Analyst User", "ANALYST");
        cleanDuplicateUsers("manager@retailiq.com", "Manager User", "MANAGER");

        log.info("✅ All seed user passwords initialized and duplicates cleaned");
    }

    private void cleanDuplicateUsers(String email, String username, String role) {
        var users = userRepository.findAll().stream()
                .filter(u -> email.equalsIgnoreCase(u.getEmail()))
                .toList();

        if (users.size() > 1) {
            log.warn("Found {} duplicate users for email {}. Cleaning up...", users.size(), email);
            // Keep the first one, delete others
            for (int i = 1; i < users.size(); i++) {
                userRepository.delete(users.get(i));
            }
        }
        if (seedPassword == null || seedPassword.isEmpty()) {
            log.error("SEED_USER_PASSWORD is not set! Using default 'password'");
            seedPassword = "password";
        }

        userRepository.findByEmail(email).ifPresentOrElse(user -> {
            log.info("Updating seeded user: {} with role: {}", email, role);
            user.setPasswordHash(passwordEncoder.encode(seedPassword));
            userRepository.save(user);
        }, () -> {
            log.info("Creating seeded user: {} with role: {}", email, role);
            userRepository.save(User.builder().email(email).username(username)
                    .passwordHash(passwordEncoder.encode(seedPassword)).role(role).build());
        });
    }
}
