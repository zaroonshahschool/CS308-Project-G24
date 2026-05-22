package com._8.store.controller;

import com._8.store.dto.CreateReturnRequestRequest;
import com._8.store.dto.RejectReturnRequestRequest;
import com._8.store.dto.ReturnRequestResponse;
import com._8.store.service.ReturnRequestService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/returns")
public class ReturnRequestController {

    private final ReturnRequestService returnRequestService;

    public ReturnRequestController(ReturnRequestService returnRequestService) {
        this.returnRequestService = returnRequestService;
    }

    @PostMapping
    public ResponseEntity<ReturnRequestResponse> createReturnRequest(
            @Valid @RequestBody CreateReturnRequestRequest request
    ) {
        return ResponseEntity.ok(returnRequestService.createReturnRequest(request));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<ReturnRequestResponse>> getPendingReturnRequests() {
        return ResponseEntity.ok(returnRequestService.getPendingReturnRequests());
    }

    @GetMapping
    public ResponseEntity<List<ReturnRequestResponse>> getAllReturnRequests() {
        return ResponseEntity.ok(returnRequestService.getAllReturnRequests());
    }

    @GetMapping("/my")
    public ResponseEntity<List<ReturnRequestResponse>> getCurrentUserReturnRequests() {
        return ResponseEntity.ok(returnRequestService.getCurrentUserReturnRequests());
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<ReturnRequestResponse> approveReturnRequest(@PathVariable Long id) {
        return ResponseEntity.ok(returnRequestService.approveReturnRequest(id));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<ReturnRequestResponse> rejectReturnRequest(
            @PathVariable Long id,
            @Valid @RequestBody RejectReturnRequestRequest request
    ) {
        return ResponseEntity.ok(returnRequestService.rejectReturnRequest(id, request.getReason()));
    }
}
