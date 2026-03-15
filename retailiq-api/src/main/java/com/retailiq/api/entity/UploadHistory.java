package com.retailiq.api.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "upload_history")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UploadHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String filename;

    @Column(nullable = false)
    private String originalName;

    private Long fileSize;

    @Builder.Default
    @Column(nullable = false)
    private String status = "PENDING";

    @Builder.Default
    private Integer totalRows = 0;

    @Builder.Default
    private Integer insertedRows = 0;

    @Builder.Default
    private Integer skippedRows = 0;

    @Builder.Default
    private Integer errorRows = 0;

    @Column(columnDefinition = "TEXT")
    private String errorDetails;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "uploaded_by")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({ "hibernateLazyInitializer", "handler", "passwordHash" })
    private User uploadedBy;

    @CreationTimestamp
    private LocalDateTime startedAt;

    private LocalDateTime completedAt;
}
