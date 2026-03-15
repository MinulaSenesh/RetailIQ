package com.retailiq.api.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "suppliers")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Supplier {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long supplier_id;

    @Column(nullable = false)
    private String name;

    private String contact_email;

    private String phone;

    private String country;

    @CreationTimestamp
    private LocalDateTime created_at;
}
