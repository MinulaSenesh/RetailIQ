package com.retailiq.api.service;

import com.retailiq.api.dto.ProfileUpdateRequest;
import com.retailiq.api.entity.Customer;
import com.retailiq.api.entity.User;
import com.retailiq.api.repository.CustomerRepository;
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
    private final PasswordEncoder passwordEncoder;

    public User getProfile(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public User updateProfile(String currentEmail, ProfileUpdateRequest request) {
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

        return user;
    }

    @Transactional
    public void updateAvatar(String email, String avatarUrl) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setAvatarUrl(avatarUrl);
        userRepository.save(user);
    }
}
