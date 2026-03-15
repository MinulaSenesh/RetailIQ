package com.retailiq.api.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "customers")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "customer_id")
    private Long customerId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(unique = true, nullable = false)
    private String email;

    private String phone;
    private String city;
    private String address;
    
    @Column(name = "postal_code")
    private String postalCode;

    @Builder.Default
    private String country = "Sri Lanka";

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    private String segment;

    @Column(name = "rfm_score")
    private BigDecimal rfmScore;

    @Transient
    @JsonProperty("avatarUrl")
    public String getAvatarUrl() {
        return user != null ? user.getAvatarUrl() : null;
    }
}
