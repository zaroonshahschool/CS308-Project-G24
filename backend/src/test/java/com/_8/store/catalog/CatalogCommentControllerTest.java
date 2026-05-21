package com._8.store.catalog;

import com._8.store.security.CustomUserDetailsService;
import com._8.store.security.JwtService;
import com._8.store.service.CommentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CatalogController.class)
@AutoConfigureMockMvc(addFilters = false)
class CatalogCommentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CatalogService catalogService;

    @MockitoBean
    private CommentService commentService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    void getApprovedComments_usesPublicCatalogEndpoint() throws Exception {
        given(commentService.getApprovedComments(7L)).willReturn(List.of());

        mockMvc.perform(get("/api/products/7/comments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }
}
