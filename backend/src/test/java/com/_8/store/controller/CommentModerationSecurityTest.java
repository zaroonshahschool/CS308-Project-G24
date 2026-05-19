package com._8.store.controller;

import com._8.store.config.SecurityConfig;
import com._8.store.security.CustomUserDetailsService;
import com._8.store.security.JwtAuthenticationFilter;
import com._8.store.security.JwtService;
import com._8.store.service.CommentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CommentModerationController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
class CommentModerationSecurityTest {

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
    void approveComment_allowsProductManager() throws Exception {
        given(commentService.approveComment(1L)).willReturn(Map.of("message", "Comment approved."));

        mockMvc.perform(patch("/api/comments/1/approve"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Comment approved."));
    }

    @Test
    @WithMockUser(username = "sales@aurelia.local", roles = "SALES_MANAGER")
    void approveComment_rejectsSalesManager() throws Exception {
        mockMvc.perform(patch("/api/comments/1/approve"))
                .andExpect(status().isForbidden());

        verifyNoInteractions(commentService);
    }
}
