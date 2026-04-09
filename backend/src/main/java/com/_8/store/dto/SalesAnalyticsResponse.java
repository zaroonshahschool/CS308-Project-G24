package com._8.store.dto;

import java.math.BigDecimal;
import java.util.List;

public record SalesAnalyticsResponse(
        BigDecimal totalRevenue,
        BigDecimal totalCost,
        BigDecimal totalProfit,
        List<AnalyticsPointResponse> points
) {
}
