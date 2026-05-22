package com._8.store.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class SensitiveDataCryptoTest {

    private final EncryptedStringConverter converter = new EncryptedStringConverter();

    @BeforeEach
    void setUp() {
        SensitiveDataCrypto.configure("unit-test-data-encryption-secret-with-enough-length");
    }

    @Test
    void encryptStoresSensitiveValueAsCiphertext() {
        String encrypted = SensitiveDataCrypto.encrypt("1234567890");

        assertThat(encrypted).isNotEqualTo("1234567890");
        assertThat(SensitiveDataCrypto.isEncrypted(encrypted)).isTrue();
    }

    @Test
    void decryptReturnsOriginalSensitiveValue() {
        String encrypted = SensitiveDataCrypto.encrypt("123 Main Street");

        assertThat(SensitiveDataCrypto.decrypt(encrypted)).isEqualTo("123 Main Street");
    }

    @Test
    void encryptionIsDeterministicForQueryableUniqueFields() {
        String first = SensitiveDataCrypto.encrypt("1234567890");
        String second = SensitiveDataCrypto.encrypt("1234567890");

        assertThat(first).isEqualTo(second);
    }

    @Test
    void decryptLeavesLegacyPlaintextDatabaseValuesReadable() {
        assertThat(SensitiveDataCrypto.decrypt("legacy plaintext address")).isEqualTo("legacy plaintext address");
    }

    @Test
    void converterEncryptsDatabaseColumnAndDecryptsEntityValue() {
        String databaseValue = converter.convertToDatabaseColumn("Istanbul");

        assertThat(databaseValue).isNotEqualTo("Istanbul");
        assertThat(converter.convertToEntityAttribute(databaseValue)).isEqualTo("Istanbul");
    }
}
