package com._8.store.security;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class EncryptedStringConverter implements AttributeConverter<String, String> {

    @Override
    public String convertToDatabaseColumn(String attribute) {
        return SensitiveDataCrypto.encrypt(attribute);
    }

    @Override
    public String convertToEntityAttribute(String databaseValue) {
        return SensitiveDataCrypto.decrypt(databaseValue);
    }
}
