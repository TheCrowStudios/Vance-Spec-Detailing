package com.thecrowstudios.vance_spec_detailing.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.thecrowstudios.vance_spec_detailing.model.BookingRequest;
import com.thecrowstudios.vance_spec_detailing.model.ContactMessage;

@Repository
public interface ContactRepository extends JpaRepository<ContactMessage, Long> {
}