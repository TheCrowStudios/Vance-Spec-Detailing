package com.thecrowstudios.vance_spec_detailing.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.thecrowstudios.vance_spec_detailing.model.BookingRequest;

@Repository
public interface BookingRepository extends JpaRepository<BookingRequest, Long> {
}