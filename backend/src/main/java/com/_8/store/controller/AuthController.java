package com._8.store.controller;

import com._8.store.dto.AuthResponse;
import com._8.store.dto.LoginRequest;
import com._8.store.dto.RegisterRequest;
import com._8.store.dto.UserResponse;
import com._8.store.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
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
    private final String secureCookieMode;

    public AuthController(
            AuthService authService,
            @Value("${app.auth.cookie-name:AUTH_TOKEN}") String authCookieName,
            @Value("${app.auth.cookie-secure:auto}") String secureCookieMode
    ) {
        this.authService = authService;
        this.authCookieName = authCookieName;
        this.secureCookieMode = secureCookieMode;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request, HttpServletRequest servletRequest) {
        AuthResponse response = authService.login(request);
        ResponseCookie authCookie = buildAuthCookie(response.getToken(), Duration.ofDays(1), servletRequest);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, authCookie.toString())
                .body(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest servletRequest) {
        ResponseCookie expiredCookie = buildAuthCookie("", Duration.ZERO, servletRequest);
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, expiredCookie.toString())
                .build();
    }

    private ResponseCookie buildAuthCookie(String token, Duration maxAge, HttpServletRequest request) {
        return ResponseCookie.from(authCookieName, token)
                .httpOnly(true)
                .secure(shouldUseSecureCookie(request))
                .sameSite("Strict")
                .path("/")
                .maxAge(maxAge)
                .build();
    }

    private boolean shouldUseSecureCookie(HttpServletRequest request) {
        if ("true".equalsIgnoreCase(secureCookieMode)) {
            return true;
        }

        if ("false".equalsIgnoreCase(secureCookieMode)) {
            return false;
        }

        return request.isSecure() || "https".equalsIgnoreCase(request.getHeader("X-Forwarded-Proto"));
    }
}
