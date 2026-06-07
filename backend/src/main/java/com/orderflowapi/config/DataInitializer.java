package com.orderflowapi.config;

import com.orderflowapi.entity.Role;
import com.orderflowapi.entity.User;
import com.orderflowapi.repository.RoleRepository;
import com.orderflowapi.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashSet;
import java.util.Set;

/**
 * Configuration class responsible for seeding initial data into the database.
 * It ensures that the fundamental roles (ADMIN and CLIENTE) exist and creates
 * a default admin user on the first run.  Without this, registration would
 * fail because the required roles are missing.
 */
@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initRolesAndAdmin(RoleRepository roleRepository,
                                       UserRepository userRepository,
                                       PasswordEncoder passwordEncoder) {
        return args -> {
            // Ensure roles exist
            Role adminRole = roleRepository.findByName("ROLE_ADMIN").orElseGet(() -> {
                Role r = new Role();
                r.setName("ROLE_ADMIN");
                return roleRepository.save(r);
            });

            Role clientRole = roleRepository.findByName("ROLE_CLIENTE").orElseGet(() -> {
                Role r = new Role();
                r.setName("ROLE_CLIENTE");
                return roleRepository.save(r);
            });

            // Create default admin user if none exists
            if (!userRepository.existsByUsername("admin")) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setEmail("admin@orderflow.local");
                admin.setPassword(passwordEncoder.encode("admin123"));
                Set<Role> roles = new HashSet<>();
                roles.add(adminRole);
                admin.setRoles(roles);
                userRepository.save(admin);
            }
        };
    }
}