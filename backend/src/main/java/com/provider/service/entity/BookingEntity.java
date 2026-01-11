package com.provider.service.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
public class BookingEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // the user who made the booking
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private com.provider.service.entity.UserEntity user;

    // link to the service that was booked
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private ServiceEntity service;

    // store provider id redundantly so it's easy to query without joining
    @Column(name = "provider_id")
    private Long providerId;
    // optional note the provider adds to the booking (e.g. "I'll arrive in 2 hours")
    @Column(length = 1000)
    private String providerNote;

    // optional note the user adds when making the booking (e.g. "Please wear a mask")
    @Column(length = 1000)
    private String userNote;

    private LocalDateTime date;

    private String status; // BOOKED, IN_PROGRESS, COMPLETED, CANCELLED
    private String address;
    // amount set by provider when accepting a booking (in INR)
    private Double providerAmount;
    // razorpay order id created when provider accepts the booking and requests payment
    private String razorpayOrderId;
    // razorpay payment id after successful payment
    private String razorpayPaymentId;

    // getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public com.provider.service.entity.UserEntity getUser() { return user; }
    public void setUser(com.provider.service.entity.UserEntity user) { this.user = user; }
    public ServiceEntity getService() { return service; }
    public void setService(ServiceEntity service) { this.service = service; }
    public String getProviderNote() { return providerNote; }
    public void setProviderNote(String providerNote) { this.providerNote = providerNote; }
    public String getUserNote() { return userNote; }
    public void setUserNote(String userNote) { this.userNote = userNote; }
    public LocalDateTime getDate() { return date; }
    public void setDate(LocalDateTime date) { this.date = date; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public Double getProviderAmount() { return providerAmount; }
    public void setProviderAmount(Double providerAmount) { this.providerAmount = providerAmount; }
    public String getRazorpayOrderId() { return razorpayOrderId; }
    public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }
    public String getRazorpayPaymentId() { return razorpayPaymentId; }
    public void setRazorpayPaymentId(String razorpayPaymentId) { this.razorpayPaymentId = razorpayPaymentId; }
    public Long getProviderId() { return providerId; }
    public void setProviderId(Long providerId) { this.providerId = providerId; }
}
