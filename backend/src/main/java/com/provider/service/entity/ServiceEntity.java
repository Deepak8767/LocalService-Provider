package com.provider.service.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity
@Table(name = "services")
public class ServiceEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String serviceName;
    @Column(length = 1000)
    private String description;
    private Double pricingPerHour;
    // status will be "AVAILABLE" or "NOT_AVAILABLE"
    private String status = "AVAILABLE";

    // provider who offers this service
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id")
    // ignore hibernate proxy properties and the user's password when serializing
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private UserEntity provider;

    // getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getServiceName() { return serviceName; }
    public void setServiceName(String serviceName) { this.serviceName = serviceName; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Double getPricingPerHour() { return pricingPerHour; }
    public void setPricingPerHour(Double pricingPerHour) { this.pricingPerHour = pricingPerHour; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public UserEntity getProvider() { return provider; }
    public void setProvider(UserEntity provider) { this.provider = provider; }
}
