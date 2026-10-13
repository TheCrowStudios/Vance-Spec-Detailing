package com.thecrowstudios.vance_spec_detailing.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Data
public class BookingRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Customer name is required")
    private String customerName;

    @NotBlank(message = "Phone number is required")
    private String phone;

    @NotBlank(message = "Postcode is required")
    private String postcode;

    @NotBlank(message = "Car model is required")
    private String carModel;

    @NotBlank(message = "Vehicle size is required")
    private String vehicleSize; // 'hatchback' or 'suv'

    @NotBlank(message = "Service package is required")
    private String servicePackage;

    private int estimatedPrice;

    private LocalDateTime createdAt = LocalDateTime.now();
}