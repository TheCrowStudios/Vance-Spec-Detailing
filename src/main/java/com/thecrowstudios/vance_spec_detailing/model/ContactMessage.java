package com.thecrowstudios.vance_spec_detailing.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "contact_messages")
@Data
public class ContactMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Contact info is required")
    private String contact;

    @NotBlank(message = "Message is required")
    @Column(length = 1000)
    private String message;

    private LocalDateTime createdAt = LocalDateTime.now();
}