package com.thecrowstudios.vance_spec_detailing.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.thecrowstudios.vance_spec_detailing.model.BookingRequest;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
public class NotificationService {

    @Value("${discord.webhook.url:}")
    private String discordWebhookUrl;

    private final RestClient restClient = RestClient.create();

    public void sendBookingNotification(BookingRequest booking) {
        if (discordWebhookUrl == null || discordWebhookUrl.isBlank() || discordWebhookUrl.contains("YOUR_WEBHOOK")) {
            System.out.println("Discord webhook URL not configured. Skipping notification.");
            return;
        }

        // Construct a rich Discord Embed
        Map<String, Object> embed = Map.of(
            "title", "🚨 New Booking Received!",
            "color", 14222377, // Brand red hex #d90429 in decimal
            "fields", List.of(
                Map.of("name", "👤 Customer Name", "value", booking.getCustomerName(), "inline", true),
                Map.of("name", "📞 Phone", "value", booking.getPhone(), "inline", true),
                Map.of("name", "📍 Postcode", "value", booking.getPostcode(), "inline", true),
                Map.of("name", "🚗 Vehicle", "value", booking.getCarModel() + " (" + booking.getVehicleSize().toUpperCase() + ")", "inline", true),
                Map.of("name", "🧽 Package", "value", booking.getServicePackage().toUpperCase(), "inline", true),
                Map.of("name", "💰 Estimated Price", "value", "£" + booking.getEstimatedPrice(), "inline", true)
            ),
            "footer", Map.of("text", "Vance Spec Detailing Alert System"),
            "timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME)
        );

        Map<String, Object> payload = Map.of("embeds", List.of(embed));

        try {
            restClient.post()
                    .uri(discordWebhookUrl)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .toBodilessEntity();
            System.out.println("Discord notification sent successfully!");
        } catch (Exception e) {
            System.err.println("Failed to send Discord webhook alert: " + e.getMessage());
        }
    }
}