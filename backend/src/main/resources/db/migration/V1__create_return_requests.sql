CREATE TABLE IF NOT EXISTS return_requests (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id),
    customer_id BIGINT NOT NULL REFERENCES users(id),
    order_item_id BIGINT NOT NULL REFERENCES order_items(id),
    product_id BIGINT NOT NULL REFERENCES products(id),
    reason VARCHAR(1000),
    status VARCHAR(30) NOT NULL CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    requested_at TIMESTAMP NOT NULL,
    resolved_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_return_requests_status_requested_at
    ON return_requests(status, requested_at DESC);

CREATE INDEX IF NOT EXISTS idx_return_requests_customer_id
    ON return_requests(customer_id);

CREATE INDEX IF NOT EXISTS idx_return_requests_order_id
    ON return_requests(order_id);

CREATE INDEX IF NOT EXISTS idx_return_requests_order_item_id
    ON return_requests(order_item_id);
