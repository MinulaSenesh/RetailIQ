package com.retailiq.api.service;

import com.retailiq.api.dto.ProfileUpdateRequest;
import com.retailiq.api.dto.UserDto;
import com.retailiq.api.entity.Customer;
import com.retailiq.api.entity.User;
import com.retailiq.api.repository.CustomerRepository;
import com.retailiq.api.repository.OrderRepository;
import com.retailiq.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;
    private final PasswordEncoder passwordEncoder;

    public UserDto getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToDto(user);
    }

    @Transactional
    public UserDto updateProfile(String currentEmail, ProfileUpdateRequest request) {
        User user = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null)  user.setLastName(request.getLastName());

        if (request.getEmail() != null && !request.getEmail().isBlank() && !request.getEmail().equals(currentEmail)) {
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                throw new RuntimeException("Email is already in use.");
            }
            user.setEmail(request.getEmail());
            user.setUsername(request.getEmail());
        }

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        user = userRepository.save(user);

        // Only update Customer profile fields if user is a CUSTOMER role
        if ("CUSTOMER".equals(user.getRole())) {
            Optional<Customer> optCustomer = customerRepository.findByUserUserId(user.getUserId());
            if (optCustomer.isPresent()) {
                Customer customer = optCustomer.get();
                if (request.getPhone() != null)      customer.setPhone(request.getPhone());
                if (request.getAddress() != null)    customer.setAddress(request.getAddress());
                if (request.getPostalCode() != null) customer.setPostalCode(request.getPostalCode());
                if (request.getFirstName() != null)  customer.setFirstName(request.getFirstName());
                if (request.getLastName() != null)   customer.setLastName(request.getLastName());
                customerRepository.save(customer);
            }
        }

        return mapToDto(user);
    }

    private UserDto mapToDto(User user) {
        UserDto.UserDtoBuilder builder = UserDto.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .avatarUrl(user.getAvatarUrl());

        if ("CUSTOMER".equals(user.getRole())) {
            customerRepository.findByUserUserId(user.getUserId()).ifPresent(customer -> {
                builder.phone(customer.getPhone());
                builder.address(customer.getAddress());
                builder.postalCode(customer.getPostalCode());
            });
        }

        return builder.build();
    }

    @Transactional
    public void updateAvatar(String email, String avatarUrl) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setAvatarUrl(avatarUrl);
        userRepository.save(user);
    }

    @Transactional
    public void deleteProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // If user is a customer, delete associated orders and customer record
        if ("CUSTOMER".equals(user.getRole())) {
            customerRepository.findByUserUserId(user.getUserId()).ifPresent(customer -> {
                // Dependency: OrderRepository needs to be available in this service
                // I will add it via constructor injection in the next step
                orderRepository.deleteByCustomer(customer);
                customerRepository.delete(customer);
            });
        }

        userRepository.delete(user);
    }
}
