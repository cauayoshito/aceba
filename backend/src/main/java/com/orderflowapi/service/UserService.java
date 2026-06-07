package com.orderflowapi.service;

import com.orderflowapi.dto.RegisterRequest;
import com.orderflowapi.entity.Role;
import com.orderflowapi.entity.User;
import com.orderflowapi.repository.RoleRepository;
import com.orderflowapi.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

/**
 * Service containing business logic for creating new users.  It validates that
 * usernames and emails are unique, encrypts passwords and assigns roles.
 */
@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User registerUser(RegisterRequest request) {
        // Validate uniqueness
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered");
        }

        // Determine roles to assign
        Set<Role> roles = new HashSet<>();
        String requestedRole = Optional.ofNullable(request.getRole()).orElse("CLIENTE");
        Role role = roleRepository.findByName("ROLE_" + requestedRole.toUpperCase())
                .orElseThrow(() -> new IllegalArgumentException("Role not found: " + requestedRole));
        roles.add(role);

        // Create user entity
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRoles(roles);

        return userRepository.save(user);
    }
}