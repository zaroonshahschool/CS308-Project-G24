package com._8.store.config;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseConstraintConfigurer {

    private final JdbcTemplate jdbcTemplate;

    public DatabaseConstraintConfigurer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void refreshOrderStatusConstraint() {
        jdbcTemplate.execute("ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check");
        jdbcTemplate.execute("""
                ALTER TABLE orders
                ADD CONSTRAINT orders_status_check
                CHECK (status IN (
                    'PROCESSING',
                    'IN_TRANSIT',
                    'DELIVERED',
                    'CANCELLED',
                    'PARTIALLY_RETURNED',
                    'RETURNED'
                ))
                """);
    }
}
