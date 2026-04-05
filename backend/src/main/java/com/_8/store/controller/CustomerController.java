package com._8.store.controller;

import com._8.store.dto.AddressRequest;
import com._8.store.entity.User;
import com._8.store.repository.UserRepository;
import com._8.store.security.CustomUserDetailsService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/customer")
public class CustomerController {

    private final UserRepository userRepository;

    public CustomerController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/dashboard")
    public Map<String, String> dashboard() {
        return Map.of("message", "Customer access granted.");
    }

    @PutMapping("/address")
    public ResponseEntity<?> updateAddress(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody AddressRequest request) {

        User user = userRepository.findByEmailIgnoreCase(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        user.setStreet(request.getStreet());
        user.setCity(request.getCity());
        user.setPostalCode(request.getPostalCode());
        user.setCountry(request.getCountry());
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Address updated successfully."));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getProfile(
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userRepository.findByEmailIgnoreCase(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        return ResponseEntity.ok(Map.of(
                "name", user.getName(),
                "email", user.getEmail(),
                "taxNumber", user.getTaxNumber(),
                "street", user.getStreet() != null ? user.getStreet() : "",
                "city", user.getCity() != null ? user.getCity() : "",
                "postalCode", user.getPostalCode() != null ? user.getPostalCode() : "",
                "country", user.getCountry() != null ? user.getCountry() : ""
        ));
    }
}
