package com._8.store.security;

import javax.crypto.Cipher;
import javax.crypto.Mac;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Arrays;
import java.util.Base64;

public final class SensitiveDataCrypto {

    private static final String PREFIX = "enc:v1:";
    private static final int IV_LENGTH_BYTES = 12;
    private static final int GCM_TAG_BITS = 128;
    private static final String DEFAULT_LOCAL_SECRET = "change-me-to-a-long-random-data-encryption-secret-for-local-dev-only";

    private static volatile SecretKeySpec encryptionKey = deriveAesKey(DEFAULT_LOCAL_SECRET);
    private static volatile SecretKeySpec hmacKey = deriveHmacKey(DEFAULT_LOCAL_SECRET);

    private SensitiveDataCrypto() {
    }

    public static void configure(String secret) {
        String effectiveSecret = secret == null || secret.isBlank() ? DEFAULT_LOCAL_SECRET : secret;
        encryptionKey = deriveAesKey(effectiveSecret);
        hmacKey = deriveHmacKey(effectiveSecret);
    }

    public static String encrypt(String plainText) {
        if (plainText == null || plainText.startsWith(PREFIX)) {
            return plainText;
        }

        try {
            byte[] iv = deterministicIv(plainText);
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE, encryptionKey, new GCMParameterSpec(GCM_TAG_BITS, iv));
            byte[] cipherText = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));
            byte[] payload = ByteBuffer.allocate(iv.length + cipherText.length)
                    .put(iv)
                    .put(cipherText)
                    .array();
            return PREFIX + Base64.getEncoder().encodeToString(payload);
        } catch (GeneralSecurityException exception) {
            throw new IllegalStateException("Sensitive data could not be encrypted.", exception);
        }
    }

    public static String decrypt(String databaseValue) {
        if (databaseValue == null || !databaseValue.startsWith(PREFIX)) {
            return databaseValue;
        }

        try {
            byte[] payload = Base64.getDecoder().decode(databaseValue.substring(PREFIX.length()));
            if (payload.length <= IV_LENGTH_BYTES) {
                throw new IllegalArgumentException("Encrypted sensitive data payload is invalid.");
            }

            byte[] iv = Arrays.copyOfRange(payload, 0, IV_LENGTH_BYTES);
            byte[] cipherText = Arrays.copyOfRange(payload, IV_LENGTH_BYTES, payload.length);
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE, encryptionKey, new GCMParameterSpec(GCM_TAG_BITS, iv));
            return new String(cipher.doFinal(cipherText), StandardCharsets.UTF_8);
        } catch (GeneralSecurityException | IllegalArgumentException exception) {
            throw new IllegalStateException("Sensitive data could not be decrypted.", exception);
        }
    }

    public static boolean isEncrypted(String value) {
        return value != null && value.startsWith(PREFIX);
    }

    private static byte[] deterministicIv(String plainText) throws GeneralSecurityException {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(hmacKey);
        return Arrays.copyOf(mac.doFinal(plainText.getBytes(StandardCharsets.UTF_8)), IV_LENGTH_BYTES);
    }

    private static SecretKeySpec deriveAesKey(String secret) {
        return new SecretKeySpec(sha256(secret), "AES");
    }

    private static SecretKeySpec deriveHmacKey(String secret) {
        return new SecretKeySpec(sha256("hmac:" + secret), "HmacSHA256");
    }

    private static byte[] sha256(String value) {
        try {
            return MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is not available.", exception);
        }
    }
}
