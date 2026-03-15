package com.retailiq.api.service;

import com.retailiq.api.dto.LoginRequest;
import com.retailiq.api.dto.LoginResponse;
import com.retailiq.api.dto.RegisterRequest;
import com.retailiq.api.entity.Customer;
import com.retailiq.api.entity.User;
import com.retailiq.api.repository.CustomerRepository;
import com.retailiq.api.repository.UserRepository;
import com.retailiq.api.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private AuthenticationManager authenticationManager;
    @Mock private UserRepository userRepository;
    @Mock private CustomerRepository customerRepository;
    @Mock private JwtTokenProvider jwtTokenProvider;
    @Mock private UserDetailsService userDetailsService;
    @Mock private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    private User mockUser;
    private Customer mockCustomer;
    private UserDetails mockUserDetails;

    @BeforeEach
    void setUp() {
        mockUser = User.builder().userId(1L).email("test@example.com").passwordHash("hash").role("CUSTOMER").build();
        mockCustomer = Customer.builder().customerId(1L).user(mockUser).phone("123456").address("123 St").build();
        mockUserDetails = org.springframework.security.core.userdetails.User.builder()
                .username("test@example.com").password("hash").roles("CUSTOMER").build();
    }

    @Test
    void testLogin_Success() {
        LoginRequest request = new LoginRequest("test@example.com", "password123");
        Authentication auth = mock(Authentication.class);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(auth.getPrincipal()).thenReturn(mockUserDetails);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(mockUser));
        when(jwtTokenProvider.generateAccessToken(mockUserDetails)).thenReturn("access-token");
        when(jwtTokenProvider.generateRefreshToken(mockUserDetails)).thenReturn("refresh-token");
        when(customerRepository.findByUserUserId(1L)).thenReturn(Optional.of(mockCustomer));

        LoginResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("access-token", response.getAccessToken());
        assertEquals("test@example.com", response.getUser().getEmail());
        assertEquals("123456", response.getUser().getPhone());
        verify(userRepository, times(1)).save(mockUser); // Validates last login update
    }

    @Test
    void testRegister_Success() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("new@example.com");
        request.setPassword("pass");
        request.setFirstName("John");
        request.setLastName("Doe");

        when(userRepository.findByEmail("new@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("pass")).thenReturn("encoded");
        when(userRepository.save(any(User.class))).thenAnswer(i -> {
            User u = (User) i.getArguments()[0];
            u.setUserId(2L);
            return u;
        });
        when(userDetailsService.loadUserByUsername("new@example.com")).thenReturn(mockUserDetails);
        when(jwtTokenProvider.generateAccessToken(mockUserDetails)).thenReturn("access");
        when(jwtTokenProvider.generateRefreshToken(mockUserDetails)).thenReturn("refresh");

        LoginResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("access", response.getAccessToken());
        verify(customerRepository, times(1)).save(any(Customer.class));
    }

    @Test
    void testRegister_EmailAlreadyInUse() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@example.com");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(mockUser));

        Exception exception = assertThrows(RuntimeException.class, () -> authService.register(request));
        assertEquals("Email already in use", exception.getMessage());
    }
}
