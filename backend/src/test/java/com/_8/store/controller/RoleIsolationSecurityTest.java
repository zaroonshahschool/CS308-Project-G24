package com._8.store.controller;

import com._8.store.admin.AdminController;
import com._8.store.admin.AdminService;
import com._8.store.repository.RatingRepository;
import com._8.store.repository.UserRepository;
import com._8.store.security.CustomUserDetailsService;
import com._8.store.security.JwtAuthenticationFilter;
import com._8.store.security.JwtService;
import com._8.store.service.CommentService;
import com._8.store.service.OrderService;
import com._8.store.service.RatingService;
import com._8.store.service.SalesManagerService;
import com._8.store.service.WishlistService;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.doAnswer;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = {
        CustomerController.class,
        ProductManagerController.class,
        SalesManagerController.class,
        AdminController.class
})
@Import(com._8.store.config.SecurityConfig.class)
class RoleIsolationSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;
    @MockitoBean
    private UserRepository userRepository;
    @MockitoBean
    private RatingService ratingService;
    @MockitoBean
    private CommentService commentService;
    @MockitoBean
    private WishlistService wishlistService;
    @MockitoBean
    private OrderService orderService;
    @MockitoBean
    private SalesManagerService salesManagerService;
    @MockitoBean
    private RatingRepository ratingRepository;
    @MockitoBean
    private AdminService adminService;

    @BeforeEach
    void letJwtFilterContinue() throws Exception {
        doAnswer(invocation -> {
            FilterChain chain = invocation.getArgument(2);
            chain.doFilter(invocation.getArgument(0), invocation.getArgument(1));
            return null;
        }).when(jwtAuthenticationFilter).doFilter(any(), any(), any());
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void customerCanAccessCustomerEndpoints() throws Exception {
        mockMvc.perform(get("/api/customer/dashboard"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void customerCannotAccessSalesManagerEndpoints() throws Exception {
        mockMvc.perform(get("/api/sales-manager/sales"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void customerCannotAccessProductManagerEndpoints() throws Exception {
        mockMvc.perform(get("/api/product-manager/products"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "SALES_MANAGER")
    void salesManagerCanAccessSalesManagerEndpoints() throws Exception {
        mockMvc.perform(get("/api/sales-manager/sales"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "SALES_MANAGER")
    void salesManagerCannotAccessCustomerEndpoints() throws Exception {
        mockMvc.perform(get("/api/customer/dashboard"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "SALES_MANAGER")
    void salesManagerCannotAccessProductManagerEndpoints() throws Exception {
        mockMvc.perform(get("/api/product-manager/products"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "PRODUCT_MANAGER")
    void productManagerCanAccessProductManagerEndpoints() throws Exception {
        mockMvc.perform(get("/api/product-manager/products"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "PRODUCT_MANAGER")
    void productManagerCanAccessAdminEndpoints() throws Exception {
        given(adminService.getAllCollections()).willReturn(List.of());

        mockMvc.perform(get("/api/admin/collections"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "PRODUCT_MANAGER")
    void productManagerCannotAccessCustomerEndpoints() throws Exception {
        mockMvc.perform(get("/api/customer/dashboard"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "PRODUCT_MANAGER")
    void productManagerCannotAccessSalesManagerEndpoints() throws Exception {
        mockMvc.perform(get("/api/sales-manager/sales"))
                .andExpect(status().isForbidden());
    }
}
