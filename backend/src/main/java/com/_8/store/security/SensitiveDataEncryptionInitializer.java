package com._8.store.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class SensitiveDataEncryptionInitializer {

    public SensitiveDataEncryptionInitializer(@Value("${app.encryption.secret}") String secret) {
        SensitiveDataCrypto.configure(secret);
    }
}
