package com.provider.service;

import com.provider.service.entity.ServiceEntity;
import com.provider.service.repository.ServiceRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataLoader {

    // Disable automatic seeding by default. Enable by setting app.seed.enabled=true in application.properties for development only.
    @Value("${app.seed.enabled:false}")
    private boolean seedEnabled;

    @Bean
    CommandLineRunner initServices(ServiceRepository serviceRepository) {
        return args -> {
            if (!seedEnabled) return; // do nothing unless explicitly enabled

            if (serviceRepository.count() == 0) {
                ServiceEntity s1 = new ServiceEntity();
                s1.setServiceName("Electrician");
                s1.setDescription("Qualified electricians for home and office.");
                s1.setPricingPerHour(400.0);
                serviceRepository.save(s1);

                ServiceEntity s2 = new ServiceEntity();
                s2.setServiceName("Plumber");
                s2.setDescription("Experienced plumbers for all plumbing needs.");
                s2.setPricingPerHour(350.0);
                serviceRepository.save(s2);

                ServiceEntity s3 = new ServiceEntity();
                s3.setServiceName("Cleaning");
                s3.setDescription("Home and office cleaning services.");
                s3.setPricingPerHour(200.0);
                serviceRepository.save(s3);

                ServiceEntity s4 = new ServiceEntity();
                s4.setServiceName("Carpenter");
                s4.setDescription("Skilled carpenters for furniture and repairs.");
                s4.setPricingPerHour(300.0);
                serviceRepository.save(s4);
            }
        };
    }
}
