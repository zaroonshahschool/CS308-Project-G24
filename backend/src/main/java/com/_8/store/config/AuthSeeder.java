package com._8.store.config;

import com._8.store.entity.Role;
import com._8.store.entity.User;
import com._8.store.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AuthSeeder {

    @Bean
    CommandLineRunner seedAuthUsers(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            createUserIfMissing(
                    userRepository,
                    passwordEncoder,
                    "Customer Demo",
                    "customer@aurelia.local",
                    "customer123",
                    Role.CUSTOMER
            );

            createUserIfMissing(
                    userRepository,
                    passwordEncoder,
                    "Product Manager Demo",
                    "manager@aurelia.local",
                    "manager123",
                    Role.PRODUCT_MANAGER
            );

            createUserIfMissing(
                    userRepository,
                    passwordEncoder,
                    "Sales Manager Demo",
                    "sales@aurelia.local",
                    "sales123",
                    Role.SALES_MANAGER
            );
        };
    }

    private void createUserIfMissing(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            String name,
            String email,
            String rawPassword,
            Role role
    ) {
        if (userRepository.existsByEmailIgnoreCase(email)) {
            return;
        }

        userRepository.save(new User(
                name,
                email,
                passwordEncoder.encode(rawPassword),
                role
        ));
    }
}
