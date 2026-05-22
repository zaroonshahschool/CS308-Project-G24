package com._8.store.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RejectReturnRequestRequest {

    @NotBlank(message = "Rejection reason is required.")
    @Size(max = 1000, message = "Rejection reason must be 1000 characters or fewer.")
    private String reason;

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
