package com._8.store.service;

import com._8.store.dto.AuthResponse;
import com._8.store.dto.LoginRequest;
import com._8.store.dto.RegisterRequest;
import com._8.store.dto.UserResponse;
import com._8.store.entity.Role;
import com._8.store.entity.User;
import com._8.store.repository.UserRepository;
import com._8.store.security.JwtService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    @Test
    void register_createsCustomerWithNormalizedEmailEncodedPasswordAndTaxNumber() {
        RegisterRequest request = registerRequest("  Jane Doe  ", "  Jane@Example.COM  ", "secret");
        given(userRepository.existsByEmailIgnoreCase(request.getEmail())).willReturn(false);
        given(userRepository.existsByTaxNumber(any())).willReturn(false);
        given(passwordEncoder.encode("secret")).willReturn("encoded-secret");
        given(userRepository.save(any(User.class))).willAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(42L);
            return user;
        });

        UserResponse response = authService.register(request);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User savedUser = userCaptor.getValue();

        assertThat(savedUser.getName()).isEqualTo("Jane Doe");
        assertThat(savedUser.getEmail()).isEqualTo("jane@example.com");
        assertThat(savedUser.getPassword()).isEqualTo("encoded-secret");
        assertThat(savedUser.getRole()).isEqualTo(Role.CUSTOMER);
        assertThat(savedUser.getTaxNumber()).matches("\\d{10}");
        assertThat(response.getId()).isEqualTo(42L);
        assertThat(response.getEmail()).isEqualTo("jane@example.com");
        assertThat(response.getRole()).isEqualTo(Role.CUSTOMER);
    }

    @Test
    void register_duplicateEmailThrowsAndDoesNotSaveUser() {
        RegisterRequest request = registerRequest("Jane Doe", "jane@example.com", "secret");
        given(userRepository.existsByEmailIgnoreCase(request.getEmail())).willReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("A user with this email already exists.");

        verify(passwordEncoder, never()).encode(any());
        verify(userRepository, never()).save(any());
    }

    @Test
    void register_retriesTaxNumberUntilItFindsUniqueValue() {
        RegisterRequest request = registerRequest("Jane Doe", "jane@example.com", "secret");
        given(userRepository.existsByEmailIgnoreCase(request.getEmail())).willReturn(false);
        given(userRepository.existsByTaxNumber(any())).willReturn(true, false);
        given(passwordEncoder.encode("secret")).willReturn("encoded-secret");
        given(userRepository.save(any(User.class))).willAnswer(invocation -> invocation.getArgument(0));

        authService.register(request);

        verify(userRepository, times(2)).existsByTaxNumber(any());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void login_authenticatesNormalizedEmailAndReturnsGeneratedToken() {
        LoginRequest request = loginRequest("  Jane@Example.COM  ", "secret");
        User user = user("Jane Doe", "jane@example.com", Role.CUSTOMER);
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                new org.springframework.security.core.userdetails.User("jane@example.com", "secret", java.util.List.of()),
                "secret"
        );

        given(authenticationManager.authenticate(any(Authentication.class))).willReturn(authentication);
        given(userRepository.findByEmailIgnoreCase("jane@example.com")).willReturn(Optional.of(user));
        given(jwtService.generateToken(user)).willReturn("jwt-token");

        AuthResponse response = authService.login(request);

        ArgumentCaptor<Authentication> authenticationCaptor = ArgumentCaptor.forClass(Authentication.class);
        verify(authenticationManager).authenticate(authenticationCaptor.capture());
        assertThat(authenticationCaptor.getValue().getName()).isEqualTo("jane@example.com");
        assertThat(authenticationCaptor.getValue().getCredentials()).isEqualTo("secret");
        assertThat(response.getToken()).isEqualTo("jwt-token");
        assertThat(response.getName()).isEqualTo("Jane Doe");
        assertThat(response.getEmail()).isEqualTo("jane@example.com");
        assertThat(response.getRole()).isEqualTo(Role.CUSTOMER);
    }

    @Test
    void login_missingUserAfterAuthenticationThrows() {
        LoginRequest request = loginRequest("jane@example.com", "secret");
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                new org.springframework.security.core.userdetails.User("jane@example.com", "secret", java.util.List.of()),
                "secret"
        );

        given(authenticationManager.authenticate(any(Authentication.class))).willReturn(authentication);
        given(userRepository.findByEmailIgnoreCase("jane@example.com")).willReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("User not found.");

        verify(jwtService, never()).generateToken(any());
    }

    private RegisterRequest registerRequest(String name, String email, String password) {
        RegisterRequest request = new RegisterRequest();
        request.setName(name);
        request.setEmail(email);
        request.setPassword(password);
        return request;
    }

    private LoginRequest loginRequest(String email, String password) {
        LoginRequest request = new LoginRequest();
        request.setEmail(email);
        request.setPassword(password);
        return request;
    }

    private User user(String name, String email, Role role) {
        User user = new User(name, email, "encoded-secret", role, "1234567890");
        user.setId(7L);
        return user;
    }
}
