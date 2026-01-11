package com.provider.service.controller;

import com.provider.service.entity.ServiceEntity;
import com.provider.service.repository.ServiceRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
public class ServiceController {

    private final ServiceRepository serviceRepository;

    public ServiceController(ServiceRepository serviceRepository) {
        this.serviceRepository = serviceRepository;
    }

    @GetMapping
    public List<ServiceEntity> listServices(@RequestParam(required = false) String q, @RequestParam(required = false) String pincode) {
        String activeStatus = "active"; // Only show services from active providers
        
        // If both q (service type) and pincode are provided, return intersection
        if (q != null && !q.isBlank() && pincode != null && !pincode.isBlank()) {
            return serviceRepository.findByServiceNameContainingIgnoreCaseAndProvider_PincodeAndProvider_Status(q, pincode, activeStatus);
        }
        // If only q provided, search by service name
        if (q != null && !q.isBlank()) {
            return serviceRepository.findByServiceNameContainingIgnoreCaseAndProvider_Status(q, activeStatus);
        }
        // If only pincode provided, search by provider pincode
        if (pincode != null && !pincode.isBlank()) {
            return serviceRepository.findByProvider_PincodeAndProvider_Status(pincode, activeStatus);
        }
        // default: return all from active providers
        return serviceRepository.findByProvider_Status(activeStatus);
    }

    // Allow filtering by providerId: /api/services?providerId=123
    @GetMapping(params = "providerId")
    public List<ServiceEntity> listByProvider(@RequestParam Long providerId) {
        return serviceRepository.findByProvider_Id(providerId);
    }

    // Update service fields (provider should already own the service in real app)
    @PutMapping("/{id}")
    public ServiceEntity updateService(@PathVariable Long id, @RequestBody ServiceEntity incoming) {
        return serviceRepository.findById(id).map(s -> {
            if (incoming.getDescription() != null) s.setDescription(incoming.getDescription());
            if (incoming.getPricingPerHour() != null) s.setPricingPerHour(incoming.getPricingPerHour());
            if (incoming.getStatus() != null) s.setStatus(incoming.getStatus());
            return serviceRepository.save(s);
        }).orElseThrow(() -> new RuntimeException("Service not found"));
    }
}
