package com.provider.service.repository;

import com.provider.service.entity.BookingEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingRepository extends JpaRepository<BookingEntity, Long> {
    List<BookingEntity> findByUserId(Long userId);
    // find bookings where the service's provider has the given id
    List<BookingEntity> findByService_Provider_Id(Long providerId);
    // convenience method using stored providerId column
    List<BookingEntity> findByProviderId(Long providerId);
}
