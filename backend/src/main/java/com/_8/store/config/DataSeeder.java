package com._8.store.config;

import com._8.store.entity.Category;
import com._8.store.entity.Product;
import com._8.store.repository.CategoryRepository;
import com._8.store.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedDatabase(CategoryRepository categoryRepository, ProductRepository productRepository) {
        return args -> {
            if (productRepository.count() > 0) {
                return;
            }

            Category fiction = categoryRepository.save(new Category(
                    "Fiction",
                    "https://images.unsplash.com/photo-1589998059171-988d887df646?q=80&w=600&auto=format&fit=crop",
                    1
            ));

            Category scienceFiction = categoryRepository.save(new Category(
                    "Science Fiction",
                    "https://images.unsplash.com/photo-1518709766631-a6a7f4593b6e?q=80&w=600&auto=format&fit=crop",
                    2
            ));

            Category history = categoryRepository.save(new Category(
                    "History",
                    "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=600&auto=format&fit=crop",
                    3
            ));

            Category mystery = categoryRepository.save(new Category(
                    "Mystery",
                    "https://images.unsplash.com/photo-1543004629-1263ef214f36?q=80&w=600&auto=format&fit=crop",
                    4
            ));

            Category nonFiction = categoryRepository.save(new Category(
                    "Non-Fiction",
                    "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=600&auto=format&fit=crop",
                    5
            ));

            productRepository.save(new Product(
                    "The Midnight Library",
                    "Matt Haig",
                    "A luminous novel about regret, second chances, and the many lives a person might have lived.",
                    new BigDecimal("24.99"),
                    8,
                    "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400&auto=format&fit=crop",
                    true,
                    false,
                    true,
                    LocalDateTime.now().minusDays(12),
                    fiction
            ));

            productRepository.save(new Product(
                    "Dune",
                    "Frank Herbert",
                    "An iconic science fiction epic of power, prophecy, survival, and empire on the desert planet Arrakis.",
                    new BigDecimal("29.99"),
                    3,
                    "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=400&auto=format&fit=crop",
                    false,
                    false,
                    true,
                    LocalDateTime.now().minusDays(10),
                    scienceFiction
            ));

            productRepository.save(new Product(
                    "Sapiens",
                    "Yuval Noah Harari",
                    "A sweeping history of humankind, tracing how shared myths and systems shaped civilization.",
                    new BigDecimal("27.99"),
                    12,
                    "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=400&auto=format&fit=crop",
                    false,
                    false,
                    true,
                    LocalDateTime.now().minusDays(8),
                    nonFiction
            ));

            productRepository.save(new Product(
                    "The Name of the Rose",
                    "Umberto Eco",
                    "A scholarly mystery set in a medieval monastery, filled with intrigue, philosophy, and murder.",
                    new BigDecimal("32.99"),
                    5,
                    "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=400&auto=format&fit=crop",
                    false,
                    false,
                    true,
                    LocalDateTime.now().minusDays(6),
                    mystery
            ));

            productRepository.save(new Product(
                    "Guns, Germs & Steel",
                    "Jared Diamond",
                    "A landmark work explaining how geography and environment shaped the modern world.",
                    new BigDecimal("26.99"),
                    7,
                    "https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=400&auto=format&fit=crop",
                    false,
                    false,
                    true,
                    LocalDateTime.now().minusDays(5),
                    history
            ));

            productRepository.save(new Product(
                    "Foundation",
                    "Isaac Asimov",
                    "The classic saga of psychohistory, collapsing empires, and the long struggle to preserve knowledge.",
                    new BigDecimal("22.99"),
                    0,
                    "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?q=80&w=400&auto=format&fit=crop",
                    false,
                    false,
                    false,
                    LocalDateTime.now().minusDays(20),
                    scienceFiction
            ));

            productRepository.save(new Product(
                    "Crime and Punishment",
                    "Fyodor Dostoevsky",
                    "A psychological masterpiece exploring guilt, morality, justice, and redemption.",
                    new BigDecimal("19.99"),
                    15,
                    "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=400&auto=format&fit=crop",
                    false,
                    false,
                    false,
                    LocalDateTime.now().minusDays(30),
                    fiction
            ));

            productRepository.save(new Product(
                    "The Girl with the Dragon Tattoo",
                    "Stieg Larsson",
                    "A gripping modern thriller combining investigative journalism, family secrets, and cyber sleuthing.",
                    new BigDecimal("23.99"),
                    6,
                    "https://images.unsplash.com/photo-1495640388908-05fa85288e61?q=80&w=400&auto=format&fit=crop",
                    false,
                    false,
                    false,
                    LocalDateTime.now().minusDays(25),
                    mystery
            ));

            productRepository.save(new Product(
                    "A Brief History of Time",
                    "Stephen Hawking",
                    "A celebrated introduction to cosmology, black holes, and the structure of the universe.",
                    new BigDecimal("21.99"),
                    9,
                    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=400&auto=format&fit=crop",
                    false,
                    false,
                    false,
                    LocalDateTime.now().minusDays(18),
                    nonFiction
            ));

            productRepository.save(new Product(
                    "The Shadow of the Wind",
                    "Carlos Ruiz Zafón",
                    "A gothic literary mystery set in Barcelona, where books, memory, and obsession intertwine.",
                    new BigDecimal("28.99"),
                    4,
                    "https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=400&auto=format&fit=crop",
                    false,
                    false,
                    false,
                    LocalDateTime.now().minusDays(14),
                    mystery
            ));

            productRepository.save(new Product(
                    "One Hundred Years of Solitude",
                    "Gabriel García Márquez",
                    "A landmark of magical realism chronicling generations of the Buendía family in Macondo.",
                    new BigDecimal("18.99"),
                    11,
                    "https://images.unsplash.com/photo-1474932430478-367dbb6832c1?q=80&w=400&auto=format&fit=crop",
                    false,
                    false,
                    false,
                    LocalDateTime.now().minusDays(22),
                    fiction
            ));

            productRepository.save(new Product(
                    "SPQR: A History of Ancient Rome",
                    "Mary Beard",
                    "A vivid retelling of Roman political and cultural history by one of the field's leading scholars.",
                    new BigDecimal("34.99"),
                    2,
                    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=400&auto=format&fit=crop",
                    false,
                    true,
                    false,
                    LocalDateTime.now().minusDays(3),
                    history
            ));
        };
    }
}