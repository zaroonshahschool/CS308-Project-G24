package com._8.store.service;

import com._8.store.dto.CommentRequest;
import com._8.store.dto.CommentResponse;
import com._8.store.entity.*;
import com._8.store.repository.CommentRepository;
import com._8.store.repository.OrderRepository;
import com._8.store.repository.ProductRepository;
import com._8.store.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class CommentServiceTest {

    @Mock
    private CommentRepository commentRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private OrderRepository orderRepository;

    @InjectMocks
    private CommentService commentService;

    private User mockUser;
    private Product mockProduct;

    @BeforeEach
    void setUp() {
        mockUser = new User("John", "john@example.com", "pass", Role.CUSTOMER, "1234567890");
        mockUser.setId(1L);

        mockProduct = new Product();
        mockProduct.setId(10L);
        mockProduct.setName("Test Book");
    }

    @Test
    void addComment_validRequest_returnsPendingMessage() {
        given(userRepository.findByEmailIgnoreCase("john@example.com")).willReturn(Optional.of(mockUser));
        given(productRepository.findById(10L)).willReturn(Optional.of(mockProduct));
        given(orderRepository.existsByUserIdAndProductIdAndStatusIn(eq(1L), eq(10L), anyCollection())).willReturn(true);
        given(commentRepository.save(any())).willReturn(new Comment());

        CommentRequest request = new CommentRequest();
        request.setContent("Great product!");

        Map<String, String> result = commentService.addComment("john@example.com", 10L, request);

        assertThat(result.get("message")).isEqualTo("Comment submitted and awaiting approval.");
    }

    @Test
    void addComment_userNotPurchased_throwsException() {
        given(userRepository.findByEmailIgnoreCase("john@example.com")).willReturn(Optional.of(mockUser));
        given(productRepository.findById(10L)).willReturn(Optional.of(mockProduct));
        given(orderRepository.existsByUserIdAndProductIdAndStatusIn(eq(1L), eq(10L), anyCollection())).willReturn(false);

        CommentRequest request = new CommentRequest();
        request.setContent("Nice!");

        assertThatThrownBy(() -> commentService.addComment("john@example.com", 10L, request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("You can only comment on products from delivered orders.");
    }

    @Test
    void approveComment_validId_returnsApprovedMessage() {
        Comment comment = new Comment(mockUser, mockProduct, "Good.", CommentStatus.PENDING, LocalDateTime.now());
        given(commentRepository.findById(1L)).willReturn(Optional.of(comment));
        given(commentRepository.save(any())).willReturn(comment);

        Map<String, String> result = commentService.approveComment(1L);

        assertThat(comment.getStatus()).isEqualTo(CommentStatus.APPROVED);
        assertThat(result.get("message")).isEqualTo("Comment approved.");
    }

    @Test
    void rejectComment_validId_returnsRejectedMessage() {
        Comment comment = new Comment(mockUser, mockProduct, "Bad.", CommentStatus.PENDING, LocalDateTime.now());
        given(commentRepository.findById(2L)).willReturn(Optional.of(comment));
        given(commentRepository.save(any())).willReturn(comment);

        Map<String, String> result = commentService.rejectComment(2L);

        assertThat(comment.getStatus()).isEqualTo(CommentStatus.REJECTED);
        assertThat(result.get("message")).isEqualTo("Comment rejected.");
    }

    @Test
    void approveComment_notFound_throwsException() {
        given(commentRepository.findById(99L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> commentService.approveComment(99L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Comment not found.");
    }

    @Test
    void getApprovedComments_returnsOnlyApproved() {
        Comment approved = new Comment(mockUser, mockProduct, "Approved comment.", CommentStatus.APPROVED, LocalDateTime.now());
        given(commentRepository.findByProductIdAndStatus(10L, CommentStatus.APPROVED))
                .willReturn(List.of(approved));

        List<CommentResponse> result = commentService.getApprovedComments(10L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getStatus()).isEqualTo(CommentStatus.APPROVED);
    }
}
