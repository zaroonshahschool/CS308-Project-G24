package com._8.store.controller;

import com._8.store.security.CustomUserDetailsService;
import com._8.store.security.JwtService;
import com._8.store.service.CommentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.mockito.BDDMockito.given;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProductManagerController.class)
@AutoConfigureMockMvc(addFilters = false)
class ProductManagerCommentTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CommentService commentService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    @WithMockUser(username = "manager@aurelia.local", roles = "PRODUCT_MANAGER")
    void getPendingComments_returnsEmptyList_whenNoPendingComments() throws Exception {
        given(commentService.getPendingComments()).willReturn(List.of());

        mockMvc.perform(get("/api/product-manager/comments/pending"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    @WithMockUser(username = "manager@aurelia.local", roles = "PRODUCT_MANAGER")
    void getPendingComments_returnsList_whenPendingCommentsExist() throws Exception {
        given(commentService.getPendingComments()).willReturn(List.of());

        mockMvc.perform(get("/api/product-manager/comments/pending"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @WithMockUser(username = "manager@aurelia.local", roles = "PRODUCT_MANAGER")
    void approveComment_validId_returns200() throws Exception {
        given(commentService.approveComment(1L)).willReturn(Map.of("message", "Comment approved."));

        mockMvc.perform(put("/api/product-manager/comments/1/approve"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Comment approved."));
    }

    @Test
    @WithMockUser(username = "manager@aurelia.local", roles = "PRODUCT_MANAGER")
    void rejectComment_validId_returns200() throws Exception {
        given(commentService.rejectComment(1L)).willReturn(Map.of("message", "Comment rejected."));

        mockMvc.perform(put("/api/product-manager/comments/1/reject"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Comment rejected."));
    }

    @Test
    @WithMockUser(username = "manager@aurelia.local", roles = "PRODUCT_MANAGER")
    void approveComment_invalidId_returns400() throws Exception {
        given(commentService.approveComment(anyLong()))
                .willThrow(new IllegalArgumentException("Comment not found."));

        mockMvc.perform(put("/api/product-manager/comments/999/approve"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @WithMockUser(username = "manager@aurelia.local", roles = "PRODUCT_MANAGER")
    void rejectComment_invalidId_returns400() throws Exception {
        given(commentService.rejectComment(anyLong()))
                .willThrow(new IllegalArgumentException("Comment not found."));

        mockMvc.perform(put("/api/product-manager/comments/999/reject"))
                .andExpect(status().is4xxClientError());
    }
}
