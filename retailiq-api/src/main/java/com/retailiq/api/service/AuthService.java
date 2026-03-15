package com.retailiq.api.service;
import lombok.extern.slf4j.Slf4j;

import com.retailiq.api.dto.LoginRequest;
import com.retailiq.api.dto.LoginResponse;
import com.retailiq.api.dto.RefreshRequest;
import com.retailiq.api.dto.RegisterRequest;
import com.retailiq.api.entity.Customer;
import com.retailiq.api.entity.User;
import com.retailiq.api.repository.CustomerRepository;
import com.retailiq.api.repository.UserRepository;
import com.retailiq.api.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

        private final AuthenticationManager authenticationManager;
        private final UserRepository userRepository;
        private final CustomerRepository customerRepository;
        private final JwtTokenProvider jwtTokenProvider;
        private final UserDetailsService userDetailsService;
        private final PasswordEncoder passwordEncoder;

        @Transactional
        public LoginResponse register(RegisterRequest request) {
                if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                        throw new RuntimeException("Email already in use");
                }

                User user = User.builder()
                                .username(request.getEmail())
                                .email(request.getEmail())
                                .passwordHash(passwordEncoder.encode(request.getPassword()))
                                .firstName(request.getFirstName())
                                .lastName(request.getLastName())
                                .role("CUSTOMER")
                                .active(true)
                                .build();
                user = userRepository.save(user);

                Customer customer = Customer.builder()
                                .firstName(request.getFirstName())
                                .lastName(request.getLastName())
                                .email(request.getEmail())
                                .user(user)
                                .build();
                customerRepository.save(customer);

                UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
                String accessToken = jwtTokenProvider.generateAccessToken(userDetails);
                String refreshToken = jwtTokenProvider.generateRefreshToken(userDetails);

                return LoginResponse.builder()
                                .accessToken(accessToken)
                                .refreshToken(refreshToken)
                                .tokenType("Bearer")
                                .expiresIn(86400000L)
                                .user(LoginResponse.UserDto.builder()
                                                .userId(user.getUserId())
                                                .username(user.getUsername())
                                                .email(user.getEmail())
                                                .role(user.getRole())
                                                .firstName(user.getFirstName())
                                                .lastName(user.getLastName())
                                                .avatarUrl(user.getAvatarUrl())
                                                .phone(customer.getPhone())
                                                .address(customer.getAddress())
                                                .postalCode(customer.getPostalCode())
                                                .build())
                                .build();
        }

        public LoginResponse login(LoginRequest request) {
                log.info("Detailed Login Check - Email: [{}]", request.getEmail());
                
                userRepository.findByEmail(request.getEmail()).ifPresentOrElse(
                    u -> {
                        boolean matches = passwordEncoder.matches(request.getPassword(), u.getPasswordHash());
                        log.info("User found. Manual password match result: {}", matches);
                        log.info("Stored hash starts with: {}", u.getPasswordHash().substring(0, Math.min(u.getPasswordHash().length(), 10)));
                    },
                    () -> log.warn("User NOT found in database for email: [{}]", request.getEmail())
                );

                Authentication authentication = authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

                UserDetails userDetails = (UserDetails) authentication.getPrincipal();
                User user = userRepository.findByEmail(userDetails.getUsername())
                                .orElseThrow(() -> new RuntimeException("User not found"));

                // Update last login
                user.setLastLogin(LocalDateTime.now());
                userRepository.save(user);

                String accessToken = jwtTokenProvider.generateAccessToken(userDetails);
                String refreshToken = jwtTokenProvider.generateRefreshToken(userDetails);

                Customer customer = customerRepository.findByUserUserId(user.getUserId()).orElse(null);

                return LoginResponse.builder()
                                .accessToken(accessToken)
                                .refreshToken(refreshToken)
                                .tokenType("Bearer")
                                .expiresIn(86400000L)
                                .user(LoginResponse.UserDto.builder()
                                                .userId(user.getUserId())
                                                .username(user.getUsername())
                                                .email(user.getEmail())
                                                .role(user.getRole())
                                                .firstName(user.getFirstName())
                                                .lastName(user.getLastName())
                                                .avatarUrl(user.getAvatarUrl())
                                                .phone(customer != null ? customer.getPhone() : null)
                                                .address(customer != null ? customer.getAddress() : null)
                                                .postalCode(customer != null ? customer.getPostalCode() : null)
                                                .build())
                                .build();
        }

        public LoginResponse refresh(RefreshRequest request) {
                String email = jwtTokenProvider.extractUsername(request.getRefreshToken());
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                if (!jwtTokenProvider.isTokenValid(request.getRefreshToken(), userDetails)) {
                        throw new RuntimeException("Invalid refresh token");
                }

                String newAccessToken = jwtTokenProvider.generateAccessToken(userDetails);
                String newRefreshToken = jwtTokenProvider.generateRefreshToken(userDetails);

                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                Customer customer = customerRepository.findByUserUserId(user.getUserId()).orElse(null);

                return LoginResponse.builder()
                                .accessToken(newAccessToken)
                                .refreshToken(newRefreshToken)
                                .tokenType("Bearer")
                                .expiresIn(86400000L)
                                .user(LoginResponse.UserDto.builder()
                                                .userId(user.getUserId())
                                                .username(user.getUsername())
                                                .email(user.getEmail())
                                                .role(user.getRole())
                                                .firstName(user.getFirstName())
                                                .lastName(user.getLastName())
                                                .avatarUrl(user.getAvatarUrl())
                                                .phone(customer != null ? customer.getPhone() : null)
                                                .address(customer != null ? customer.getAddress() : null)
                                                .postalCode(customer != null ? customer.getPostalCode() : null)
                                                .build())
                                .build();
        }
}
