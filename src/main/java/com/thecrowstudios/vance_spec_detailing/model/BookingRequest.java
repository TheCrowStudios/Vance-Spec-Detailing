package com.thecrowstudios.vance_spec_detailing.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Data
public class BookingRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String customerName;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^\\+?[0-9\\s\\-\\(\\)]{7,20}$", message = "Please enter a valid phone number")
    private String phone;

    @NotBlank(message = "Postcode is required")
    @Pattern(regexp = "^(?i)(BT\\d{1,2}\\s?\\d[A-Z]{2})$", message = "Please enter a valid Northern Ireland postcode (e.g. BT28 1AA or BT9)")
    private String postcode;

    @NotBlank(message = "Car model is required")
    @Size(min = 2, max = 50, message = "Car model must be specified (e.g. VW Golf)")
    private String carModel;

    @NotBlank(message = "Vehicle size is required")
    @Pattern(regexp = "^(hatchback|suv)$", message = "Vehicle size must be hatchback or suv")
    private String vehicleSize;

    @NotBlank(message = "Service package is required")
    private String servicePackage;

    @Min(value = 30, message = "Estimated price must be at least £30")
    private int estimatedPrice;

    private LocalDateTime createdAt = LocalDateTime.now();
}