package com._8.store.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.util.ArrayList;
import java.util.List;

public class CartSyncRequest {

    @Valid
    @NotNull(message = "Cart items are required")
    private List<CartSyncItemRequest> items = new ArrayList<>();

    public List<CartSyncItemRequest> getItems() {
        return items;
    }

    public void setItems(List<CartSyncItemRequest> items) {
        this.items = items;
    }
}
