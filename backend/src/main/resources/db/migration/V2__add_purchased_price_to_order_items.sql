ALTER TABLE order_items
    ADD COLUMN IF NOT EXISTS purchased_price NUMERIC(12, 2);

UPDATE order_items
SET purchased_price = unit_price
WHERE purchased_price IS NULL;

ALTER TABLE order_items
    ALTER COLUMN purchased_price SET NOT NULL;
