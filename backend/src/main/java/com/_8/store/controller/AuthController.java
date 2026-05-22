package com._8.store.controller;

import com._8.store.dto.AuthResponse;
import com._8.store.dto.LoginRequest;
import com._8.store.dto.RegisterRequest;
import com._8.store.dto.UserResponse;
import com._8.store.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final String authCookieName;
    private final boolean secureCookie;

    public AuthController(
            AuthService authService,
            @Value("${app.auth.cookie-name:AUTH_TOKEN}") String authCookieName,
            @Value("${app.auth.cookie-secure:true}") boolean secureCookie
    ) {
        this.authService = authService;
        this.authCookieName = authCookieName;
        this.secureCookie = secureCookie;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        ResponseCookie authCookie = buildAuthCookie(response.getToken(), Duration.ofDays(1));

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, authCookie.toString())
                .body(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        ResponseCookie expiredCookie = buildAuthCookie("", Duration.ZERO);
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, expiredCookie.toString())
                .build();
    }

    private ResponseCookie buildAuthCookie(String token, Duration maxAge) {
        return ResponseCookie.from(authCookieName, token)
                .httpOnly(true)
                .secure(secureCookie)
                .sameSite("Strict")
                .path("/")
                .maxAge(maxAge)
                .build();
    }
}
