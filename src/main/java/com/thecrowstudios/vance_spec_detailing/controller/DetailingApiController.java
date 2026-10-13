package com.thecrowstudios.vance_spec_detailing.controller;

import com.thecrowstudios.vance_spec_detailing.model.BookingRequest;
import com.thecrowstudios.vance_spec_detailing.model.ContactMessage;
import com.thecrowstudios.vance_spec_detailing.model.ServicePackage;
import com.thecrowstudios.vance_spec_detailing.repository.BookingRepository;
import com.thecrowstudios.vance_spec_detailing.repository.ContactRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class DetailingApiController {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ContactRepository contactRepository;

    /**
     * GET /api/services
     * Returns valeting packages dynamically rendered by main.js
     */
    @GetMapping("/services")
    public ResponseEntity<List<ServicePackage>> getServices() {
        List<ServicePackage> packages = Arrays.asList(
            new ServicePackage(
                "maintenance",
                "MAINTENANCE VALET",
                "Good for regular upkeep to keep the car clean and tidy.",
                Arrays.asList(
                    "Hand wash and dry",
                    "Wheels cleaned and tyres dressed",
                    "Door shuts wiped",
                    "Mats taken out and brushed/cleaned",
                    "Dash, console, and door plastics wiped down",
                    "Windows cleaned inside and out"
                ),
                45, 60
            ),
            new ServicePackage(
                "interior",
                "INTERIOR DEEP CLEAN",
                "Focuses entirely on getting the inside back to a clean, fresh standard.",
                Arrays.asList(
                    "Deep clean on seats, carpets, and floor mats",
                    "Stains and dirt scrubbed out of seats and carpets",
                    "All interior plastics and textured trim scrubbed and wiped matte",
                    "Vents, buttons, and tight gaps brushed out",
                    "Interior glass cleaned streak-free"
                ),
                70, 85
            ),
            new ServicePackage(
                "exterior",
                "EXTERIOR DEEP CLEAN & PAINT SEALANT",
                "For dirty exterior paint that needs extra attention and protection.",
                Arrays.asList(
                    "Full exterior wash and iron fallout remover",
                    "Tar spots removed",
                    "Hydrophobic spray ceramic sealant applied for water beading and paint protection",
                    "Wheels, arches, and tyres detailed",
                    "Exterior glass cleaned"
                ),
                80, 95
            ),
            new ServicePackage(
                "full",
                "THE FULL VALET",
                "Combines both interior and exterior deep cleans for a complete job.",
                Arrays.asList(
                    "Full Exterior Deep Clean + Ceramic Sealant",
                    "Full Interior Deep Clean"
                ),
                115, 135
            )
        );
        return ResponseEntity.ok(packages);
    }

    /**
     * POST /api/bookings
     * Receives booking inquiry from main.js
     */
    @PostMapping("/bookings")
    public ResponseEntity<?> createBooking(@Valid @RequestBody BookingRequest bookingRequest) {
        BookingRequest savedBooking = bookingRepository.save(bookingRequest);
        return ResponseEntity.ok(ApiResponse.success("Booking request received successfully!", savedBooking));
    }

    /**
     * POST /api/contact
     * Receives contact form submissions
     */
    @PostMapping("/contact")
    public ResponseEntity<?> submitContactMessage(@Valid @RequestBody ContactMessage contactMessage) {
        ContactMessage savedMessage = contactRepository.save(contactMessage);
        return ResponseEntity.ok(ApiResponse.success("Message received!", savedMessage));
    }

    /**
     * GET /api/bookings
     * Retrieve all saved bookings
     */
    @GetMapping("/bookings")
    public ResponseEntity<List<BookingRequest>> getAllBookings() {
        return ResponseEntity.ok(bookingRepository.findAll());
    }

    public record ApiResponse(boolean success, String message, Object data) {
        public static ApiResponse success(String message, Object data) {
            return new ApiResponse(true, message, data);
        }
    }
}