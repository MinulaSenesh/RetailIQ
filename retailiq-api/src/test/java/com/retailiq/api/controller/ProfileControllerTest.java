package com.retailiq.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.retailiq.api.dto.ProfileUpdateRequest;
import com.retailiq.api.dto.UserDto;
import com.retailiq.api.entity.User;
import com.retailiq.api.security.JwtTokenProvider;
import com.retailiq.api.service.ProfileService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProfileController.class)
class ProfileControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProfileService profileService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private UserDetailsService userDetailsService;

    @Autowired
    private ObjectMapper objectMapper;

    private UserDto mockUserDto;

    @BeforeEach
    void setUp() {
        mockUserDto = UserDto.builder()
                .userId(1L)
                .email("test@example.com")
                .username("test@example.com")
                .firstName("Test")
                .lastName("User")
                .role("CUSTOMER")
                .build();
    }

    @Test
    @WithMockUser(username = "test@example.com", roles = {"CUSTOMER"})
    void testGetProfile_Success() throws Exception {
        when(profileService.getProfile("test@example.com")).thenReturn(mockUserDto);

        mockMvc.perform(get("/api/v1/profile")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("test@example.com"))
                .andExpect(jsonPath("$.data.firstName").value("Test"));
    }

    @Test
    void testGetProfile_Unauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/profile")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "test@example.com", roles = {"CUSTOMER"})
    void testUpdateProfile_Success() throws Exception {
        ProfileUpdateRequest updateRequest = new ProfileUpdateRequest();
        updateRequest.setFirstName("Updated");
        updateRequest.setLastName("Name");

        UserDto updatedUserDto = UserDto.builder()
                .userId(1L)
                .email("test@example.com")
                .firstName("Updated")
                .lastName("Name")
                .build();

        when(profileService.updateProfile(eq("test@example.com"), any(ProfileUpdateRequest.class)))
                .thenReturn(updatedUserDto);

        mockMvc.perform(put("/api/v1/profile")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.firstName").value("Updated"))
                .andExpect(jsonPath("$.data.lastName").value("Name"));
    }
}
