package com.provider.service.repository;

import com.provider.service.entity.ServiceEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServiceRepository extends JpaRepository<ServiceEntity, Long> {
    List<ServiceEntity> findByServiceNameContainingIgnoreCase(String name);
    
    // find services where provider pincode exactly matches
    List<ServiceEntity> findByProvider_Pincode(String pincode);
    
    // combined search: service name contains AND provider pincode equals
    List<ServiceEntity> findByServiceNameContainingIgnoreCaseAndProvider_Pincode(String name, String pincode);
    
    // find services by provider id (nested property)
    List<ServiceEntity> findByProvider_Id(Long providerId);
    
    // find services where provider status is active
    List<ServiceEntity> findByProvider_Status(String status);
    
    // find services by name and provider status
    List<ServiceEntity> findByServiceNameContainingIgnoreCaseAndProvider_Status(String name, String status);
    
    // find services by pincode and provider status
    List<ServiceEntity> findByProvider_PincodeAndProvider_Status(String pincode, String status);
    
    // find services by name, pincode and provider status
    List<ServiceEntity> findByServiceNameContainingIgnoreCaseAndProvider_PincodeAndProvider_Status(String name, String pincode, String status);
}