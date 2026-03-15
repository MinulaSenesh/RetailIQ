package com.retailiq.api.config;

import com.retailiq.api.entity.User;
import com.retailiq.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

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

    @Override
    public void run(String... args) {
        userRepository.findByEmail("admin@retailiq.com").ifPresentOrElse(user -> {
            user.setPasswordHash(passwordEncoder.encode("password"));
            userRepository.save(user);
        }, () -> {
            userRepository.save(User.builder().email("admin@retailiq.com").username("Admin User")
                    .passwordHash(passwordEncoder.encode("password")).role("ADMIN").build());
        });

        userRepository.findByEmail("analyst@retailiq.com").ifPresentOrElse(user -> {
            user.setPasswordHash(passwordEncoder.encode("password"));
            userRepository.save(user);
        }, () -> {
            userRepository.save(User.builder().email("analyst@retailiq.com").username("Analyst User")
                    .passwordHash(passwordEncoder.encode("password")).role("ANALYST").build());
        });

        userRepository.findByEmail("manager@retailiq.com").ifPresentOrElse(user -> {
            user.setPasswordHash(passwordEncoder.encode("password"));
            userRepository.save(user);
        }, () -> {
            userRepository.save(User.builder().email("manager@retailiq.com").username("Manager User")
                    .passwordHash(passwordEncoder.encode("password")).role("MANAGER").build());
        });

        log.info("✅ All seed user passwords initialized (admin, analyst, manager)");
    }
}
