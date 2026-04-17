package com._8.store.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record AnalyticsPointResponse(
        LocalDate date,
        BigDecimal revenue,
        BigDecimal cost,
        BigDecimal profit
) {
}
