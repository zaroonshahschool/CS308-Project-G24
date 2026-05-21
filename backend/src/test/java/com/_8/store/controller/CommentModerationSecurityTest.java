package com._8.store.controller;

import com._8.store.security.CustomUserDetailsService;
import com._8.store.security.JwtAuthenticationFilter;
import com._8.store.security.JwtService;
import com._8.store.service.CommentService;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.doAnswer;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CommentModerationController.class)
@Import(com._8.store.config.SecurityConfig.class)
class CommentModerationSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CommentService commentService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @BeforeEach
    void letJwtFilterContinue() throws Exception {
        doAnswer(invocation -> {
            FilterChain chain = invocation.getArgument(2);
            chain.doFilter(invocation.getArgument(0), invocation.getArgument(1));
            return null;
        }).when(jwtAuthenticationFilter).doFilter(any(), any(), any());
    }

    @Test
    @WithMockUser(username = "sales@aurelia.local", roles = "SALES_MANAGER")
    void approveComment_rejectsSalesManager() throws Exception {
        mockMvc.perform(patch("/api/comments/1/approve"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "manager@aurelia.local", roles = "PRODUCT_MANAGER")
    void approveComment_allowsProductManager() throws Exception {
        given(commentService.approveComment(1L)).willReturn(Map.of("message", "Comment approved."));

        mockMvc.perform(patch("/api/comments/1/approve"))
                .andExpect(status().isOk());
    }
}
