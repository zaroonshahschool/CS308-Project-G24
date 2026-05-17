package com._8.store.config;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;

class SecurityConfigTest {

    @Test
    void passwordEncoderStoresPasswordsAsNonPlaintextHashes() {
        PasswordEncoder encoder = new SecurityConfig(null, null).passwordEncoder();

        String encodedPassword = encoder.encode("customer123");

        assertThat(encodedPassword).isNotEqualTo("customer123");
        assertThat(encoder.matches("customer123", encodedPassword)).isTrue();
    }

    @Test
    void passwordEncoderUsesSaltedHashesForTheSamePassword() {
        PasswordEncoder encoder = new SecurityConfig(null, null).passwordEncoder();

        String firstHash = encoder.encode("customer123");
        String secondHash = encoder.encode("customer123");

        assertThat(firstHash).isNotEqualTo(secondHash);
        assertThat(encoder.matches("customer123", firstHash)).isTrue();
        assertThat(encoder.matches("customer123", secondHash)).isTrue();
    }
}
