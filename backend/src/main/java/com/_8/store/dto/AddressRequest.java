package com._8.store.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class AddressRequest {

    @NotBlank(message = "Street must not be empty")
    private String street;

    @NotBlank(message = "City must not be empty")
    private String city;

    @NotBlank(message = "Postal code must not be empty")
    private String postalCode;

    @NotBlank(message = "Country must not be empty")
    private String country;

}
