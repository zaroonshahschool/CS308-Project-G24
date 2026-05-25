package com._8.store.service;

import com._8.store.dto.WishlistItemResponse;
import com._8.store.entity.Product;
import com._8.store.entity.Role;
import com._8.store.entity.User;
import com._8.store.repository.ProductRepository;
import com._8.store.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class WishlistServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private ProductRepository productRepository;
    @Mock private Authentication authentication;
    @Mock private SecurityContext securityContext;

    @InjectMocks
    private WishlistService wishlistService;

    private User mockUser;
    private Product mockProductA;
    private Product mockProductB;

    @BeforeEach
    void setUp() {
        mockUser = new User("Alice", "alice@example.com", "hashed", Role.CUSTOMER, "1111111111");
        mockUser.setId(1L);

        mockProductA = new Product();
        mockProductA.setId(10L);

        mockProductB = new Product();
        mockProductB.setId(20L);

        given(securityContext.getAuthentication()).willReturn(authentication);
        lenient().when(authentication.getName()).thenReturn("alice@example.com");
        SecurityContextHolder.setContext(securityContext);
        lenient().when(userRepository.findByEmailIgnoreCase("alice@example.com")).thenReturn(Optional.of(mockUser));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void getCurrentUserWishlist_returnsEmptyList_whenWishlistIsEmpty() {
        List<WishlistItemResponse> result = wishlistService.getCurrentUserWishlist();

        assertThat(result).isEmpty();
    }

    @Test
    void getCurrentUserWishlist_returnsCorrectProductIds_whenWishlistHasItems() {
        mockUser.getWishlistProducts().add(mockProductA);
        mockUser.getWishlistProducts().add(mockProductB);

        List<WishlistItemResponse> result = wishlistService.getCurrentUserWishlist();

        assertThat(result).hasSize(2);
        assertThat(result).extracting(WishlistItemResponse::productId)
                .containsExactlyInAnyOrder(10L, 20L);
    }

    @Test
    void getCurrentUserWishlist_throwsIllegalStateException_whenAuthenticationIsNull() {
        given(securityContext.getAuthentication()).willReturn(null);

        assertThatThrownBy(() -> wishlistService.getCurrentUserWishlist())
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("No authenticated user found.");
    }

    @Test
    void getCurrentUserWishlist_throwsIllegalArgumentException_whenUserNotFoundInRepository() {
        given(userRepository.findByEmailIgnoreCase("alice@example.com")).willReturn(Optional.empty());

        assertThatThrownBy(() -> wishlistService.getCurrentUserWishlist())
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Authenticated user could not be found.");
    }

    @Test
    void addToWishlist_addsProductAndReturnsUpdatedList() {
        given(productRepository.findById(10L)).willReturn(Optional.of(mockProductA));
        given(userRepository.save(mockUser)).willReturn(mockUser);

        List<WishlistItemResponse> result = wishlistService.addToWishlist(10L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).productId()).isEqualTo(10L);
    }

    @Test
    void addToWishlist_throwsException_whenProductNotFound() {
        given(productRepository.findById(999L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> wishlistService.addToWishlist(999L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Product not found.");
    }

    @Test
    void addToWishlist_callsSaveOnUserRepository() {
        given(productRepository.findById(10L)).willReturn(Optional.of(mockProductA));
        given(userRepository.save(mockUser)).willReturn(mockUser);

        wishlistService.addToWishlist(10L);

        verify(userRepository).save(mockUser);
    }

    @Test
    void removeFromWishlist_removesProductAndReturnsRemainingItems() {
        mockUser.getWishlistProducts().add(mockProductA);
        mockUser.getWishlistProducts().add(mockProductB);
        given(userRepository.save(mockUser)).willReturn(mockUser);

        List<WishlistItemResponse> result = wishlistService.removeFromWishlist(10L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).productId()).isEqualTo(20L);
    }

    @Test
    void removeFromWishlist_isIdempotent_whenProductIsNotInWishlist() {
        given(userRepository.save(mockUser)).willReturn(mockUser);

        List<WishlistItemResponse> result = wishlistService.removeFromWishlist(999L);

        assertThat(result).isEmpty();
    }

    @Test
    void removeFromWishlist_callsSaveOnUserRepository() {
        given(userRepository.save(mockUser)).willReturn(mockUser);

        wishlistService.removeFromWishlist(10L);

        verify(userRepository).save(mockUser);
    }
}
