package com._8.store.service;

import com._8.store.dto.NotificationResponse;
import com._8.store.entity.Notification;
import com._8.store.entity.Role;
import com._8.store.entity.User;
import com._8.store.repository.NotificationRepository;
import com._8.store.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock private NotificationRepository notificationRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks
    private NotificationService notificationService;

    private User mockUser;

    @BeforeEach
    void setUp() {
        mockUser = new User("Bob", "bob@example.com", "hashed", Role.CUSTOMER, "2222222222");
        mockUser.setId(2L);
    }

    @Test
    void createNotification_savesNotificationToRepository() {
        notificationService.createNotification(mockUser, "Your order has shipped.");

        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void createNotification_savedNotificationHasCorrectUserAndMessage() {
        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);

        notificationService.createNotification(mockUser, "Your order has shipped.");

        verify(notificationRepository).save(captor.capture());
        Notification saved = captor.getValue();
        assertThat(saved.getUser()).isEqualTo(mockUser);
        assertThat(saved.getMessage()).isEqualTo("Your order has shipped.");
        assertThat(saved.isRead()).isFalse();
    }

    @Test
    void getNotificationsForUser_throwsException_whenUserNotFound() {
        given(userRepository.findByEmailIgnoreCase("unknown@example.com")).willReturn(Optional.empty());

        assertThatThrownBy(() -> notificationService.getNotificationsForUser("unknown@example.com"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("User not found.");
    }

    @Test
    void getNotificationsForUser_returnsEmptyList_whenUserHasNoNotifications() {
        given(userRepository.findByEmailIgnoreCase("bob@example.com")).willReturn(Optional.of(mockUser));
        given(notificationRepository.findByUserOrderByCreatedAtDesc(mockUser)).willReturn(List.of());

        List<NotificationResponse> result = notificationService.getNotificationsForUser("bob@example.com");

        assertThat(result).isEmpty();
    }

    @Test
    void getNotificationsForUser_mapsMessageCorrectly() {
        Notification notification = buildMockNotification(1L, "Order delivered!", false, LocalDateTime.now());
        given(userRepository.findByEmailIgnoreCase("bob@example.com")).willReturn(Optional.of(mockUser));
        given(notificationRepository.findByUserOrderByCreatedAtDesc(mockUser)).willReturn(List.of(notification));

        List<NotificationResponse> result = notificationService.getNotificationsForUser("bob@example.com");

        assertThat(result.get(0).message()).isEqualTo("Order delivered!");
    }

    @Test
    void getNotificationsForUser_mapsReadStatusCorrectly() {
        Notification notification = buildMockNotification(2L, "Discount applied.", true, LocalDateTime.now());
        given(userRepository.findByEmailIgnoreCase("bob@example.com")).willReturn(Optional.of(mockUser));
        given(notificationRepository.findByUserOrderByCreatedAtDesc(mockUser)).willReturn(List.of(notification));

        List<NotificationResponse> result = notificationService.getNotificationsForUser("bob@example.com");

        assertThat(result.get(0).read()).isTrue();
    }

    @Test
    void getNotificationsForUser_mapsNotificationIdCorrectly() {
        Notification notification = buildMockNotification(42L, "Hello", false, LocalDateTime.now());
        given(userRepository.findByEmailIgnoreCase("bob@example.com")).willReturn(Optional.of(mockUser));
        given(notificationRepository.findByUserOrderByCreatedAtDesc(mockUser)).willReturn(List.of(notification));

        List<NotificationResponse> result = notificationService.getNotificationsForUser("bob@example.com");

        assertThat(result.get(0).id()).isEqualTo(42L);
    }

    @Test
    void getNotificationsForUser_returnsAllNotifications_whenMultipleExist() {
        Notification n1 = buildMockNotification(1L, "Message 1", false, LocalDateTime.now());
        Notification n2 = buildMockNotification(2L, "Message 2", true, LocalDateTime.now());
        given(userRepository.findByEmailIgnoreCase("bob@example.com")).willReturn(Optional.of(mockUser));
        given(notificationRepository.findByUserOrderByCreatedAtDesc(mockUser)).willReturn(List.of(n1, n2));

        List<NotificationResponse> result = notificationService.getNotificationsForUser("bob@example.com");

        assertThat(result).hasSize(2);
        assertThat(result).extracting(NotificationResponse::message)
                .containsExactly("Message 1", "Message 2");
    }

    @Test
    void markAllRead_throwsException_whenUserNotFound() {
        given(userRepository.findByEmailIgnoreCase("ghost@example.com")).willReturn(Optional.empty());

        assertThatThrownBy(() -> notificationService.markAllRead("ghost@example.com"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("User not found.");
    }

    @Test
    void markAllRead_delegatesToRepositoryWithCorrectUser() {
        given(userRepository.findByEmailIgnoreCase("bob@example.com")).willReturn(Optional.of(mockUser));

        notificationService.markAllRead("bob@example.com");

        verify(notificationRepository).markAllReadByUser(mockUser);
    }

    private Notification buildMockNotification(Long id, String message, boolean read, LocalDateTime createdAt) {
        Notification notification = mock(Notification.class);
        given(notification.getId()).willReturn(id);
        given(notification.getMessage()).willReturn(message);
        given(notification.isRead()).willReturn(read);
        given(notification.getCreatedAt()).willReturn(createdAt);
        return notification;
    }
}
