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
            // TEMPORARY DEV BEHAVIOR:
            // resets products/categories every backend start so you always see the same fresh catalogue.
            // remove these two lines later when you move beyond demo seeding.
            if (categoryRepository.count() > 0 || productRepository.count() > 0) {
                return;
            }

            Category fiction = categoryRepository.save(new Category(
                    "Fiction",
                    "https://images.unsplash.com/photo-1589998059171-988d887df646?q=80&w=600&auto=format&fit=crop",
                    1
            ));

            Category nonFiction = categoryRepository.save(new Category(
                    "Non-Fiction",
                    "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=600&auto=format&fit=crop",
                    2
            ));

            Category scienceFiction = categoryRepository.save(new Category(
                    "Science Fiction",
                    "https://images.unsplash.com/photo-1518709766631-a6a7f4593b6e?q=80&w=600&auto=format&fit=crop",
                    3
            ));

            Category mystery = categoryRepository.save(new Category(
                    "Mystery",
                    "https://images.unsplash.com/photo-1543004629-1263ef214f36?q=80&w=600&auto=format&fit=crop",
                    4
            ));

            Category history = categoryRepository.save(new Category(
                    "History",
                    "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=600&auto=format&fit=crop",
                    5
            ));

            productRepository.save(new Product(
                    "The Midnight Library",
                    "Matt Haig",
                    "A reflective contemporary novel in a linen-bound Aurelia edition, produced for readers who love intimate philosophical fiction.",
                    new BigDecimal("24.99"),
                    8,
                    "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400&auto=format&fit=crop",
                    "Canongate Books",
                    "Acid-Free",
                    304,
                    "21 x 13.5 cm",
                    "2020",
                    "978-1-78689-589-7",
                    "English",
                    "Hardcover",
                    true,
                    false,
                    true,
                    LocalDateTime.now().minusDays(15),
                    fiction
            ));

            productRepository.save(new Product(
                    "Dune",
                    "Frank Herbert",
                    "A premium desert-toned edition of the science-fiction classic with archival paper, foil details, and a durable sewn binding.",
                    new BigDecimal("29.99"),
                    3,
                    "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=400&auto=format&fit=crop",
                    "Chilton Books",
                    "Archival",
                    412,
                    "23 x 15 cm",
                    "1965",
                    "978-0-441-17271-9",
                    "English",
                    "Hardcover",
                    false,
                    false,
                    true,
                    LocalDateTime.now().minusDays(14),
                    scienceFiction
            ));

            productRepository.save(new Product(
                    "Sapiens",
                    "Yuval Noah Harari",
                    "An elegant non-fiction edition designed for long reading sessions, pairing clean typography with a richly textured cover.",
                    new BigDecimal("27.99"),
                    12,
                    "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=400&auto=format&fit=crop",
                    "Harper Collins",
                    "Standard",
                    443,
                    "23 x 15 cm",
                    "2011",
                    "978-0-06-231609-7",
                    "English",
                    "Paperback",
                    false,
                    false,
                    true,
                    LocalDateTime.now().minusDays(13),
                    nonFiction
            ));

            productRepository.save(new Product(
                    "The Name of the Rose",
                    "Umberto Eco",
                    "A richly atmospheric mystery edition with dark-gold accents and a substantial, library-grade feel.",
                    new BigDecimal("32.99"),
                    5,
                    "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=400&auto=format&fit=crop",
                    "Harcourt",
                    "Cream",
                    502,
                    "22 x 14 cm",
                    "1980",
                    "978-0-15-144647-6",
                    "English",
                    "Hardcover",
                    false,
                    false,
                    true,
                    LocalDateTime.now().minusDays(12),
                    mystery
            ));

            productRepository.save(new Product(
                    "Guns, Germs & Steel",
                    "Jared Diamond",
                    "A scholarly history volume in a handsome hardcover format, prepared for readers who want an enduring shelf copy.",
                    new BigDecimal("26.99"),
                    7,
                    "https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=400&auto=format&fit=crop",
                    "W. W. Norton",
                    "Standard",
                    480,
                    "23 x 15 cm",
                    "1997",
                    "978-0-393-31755-8",
                    "English",
                    "Hardcover",
                    false,
                    false,
                    true,
                    LocalDateTime.now().minusDays(11),
                    history
            ));

            productRepository.save(new Product(
                    "Foundation",
                    "Isaac Asimov",
                    "A minimalist science-fiction edition that emphasizes readability, durability, and a crisp modern presentation.",
                    new BigDecimal("22.99"),
                    0,
                    "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?q=80&w=400&auto=format&fit=crop",
                    "Gnome Press",
                    "Standard",
                    255,
                    "21 x 13 cm",
                    "1951",
                    "978-0-553-29335-7",
                    "English",
                    "Paperback",
                    false,
                    false,
                    false,
                    LocalDateTime.now().minusDays(10),
                    scienceFiction
            ));

            productRepository.save(new Product(
                    "Crime and Punishment",
                    "Fyodor Dostoevsky",
                    "A classic fiction edition with understated detailing and a durable format suited for repeat readings.",
                    new BigDecimal("19.99"),
                    15,
                    "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=400&auto=format&fit=crop",
                    "Penguin Classics",
                    "Cream",
                    671,
                    "20 x 13 cm",
                    "1866",
                    "978-0-14-044913-6",
                    "English",
                    "Paperback",
                    false,
                    false,
                    false,
                    LocalDateTime.now().minusDays(9),
                    fiction
            ));

            productRepository.save(new Product(
                    "The Girl with the Dragon Tattoo",
                    "Stieg Larsson",
                    "A sharp, moody mystery edition featuring tactile materials and a clean, contemporary layout.",
                    new BigDecimal("23.99"),
                    6,
                    "https://images.unsplash.com/photo-1495640388908-05fa85288e61?q=80&w=400&auto=format&fit=crop",
                    "Norstedts Förlag",
                    "Standard",
                    465,
                    "22 x 14 cm",
                    "2005",
                    "978-0-307-26975-1",
                    "English",
                    "Hardcover",
                    false,
                    false,
                    false,
                    LocalDateTime.now().minusDays(8),
                    mystery
            ));

            productRepository.save(new Product(
                    "A Brief History of Time",
                    "Stephen Hawking",
                    "A refined science writing edition balancing approachable layout, durable construction, and display-worthy design.",
                    new BigDecimal("21.99"),
                    9,
                    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=400&auto=format&fit=crop",
                    "Bantam Books",
                    "Standard",
                    212,
                    "23 x 15 cm",
                    "1988",
                    "978-0-553-38016-3",
                    "English",
                    "Hardcover",
                    false,
                    false,
                    false,
                    LocalDateTime.now().minusDays(7),
                    nonFiction
            ));

            productRepository.save(new Product(
                    "The Shadow of the Wind",
                    "Carlos Ruiz Zafon",
                    "A dramatic mystery edition with warm-toned cloth binding and decorative chapter openings.",
                    new BigDecimal("28.99"),
                    4,
                    "https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=400&auto=format&fit=crop",
                    "Editorial Planeta",
                    "Cream",
                    487,
                    "22 x 14 cm",
                    "2001",
                    "978-1-59420-010-0",
                    "English",
                    "Hardcover",
                    false,
                    false,
                    false,
                    LocalDateTime.now().minusDays(6),
                    mystery
            ));

            productRepository.save(new Product(
                    "One Hundred Years of Solitude",
                    "Gabriel Garcia Marquez",
                    "A warm, literary fiction edition that highlights the novel's lyrical quality through generous page design.",
                    new BigDecimal("18.99"),
                    11,
                    "https://images.unsplash.com/photo-1474932430478-367dbb6832c1?q=80&w=400&auto=format&fit=crop",
                    "Harper & Row",
                    "Acid-Free",
                    422,
                    "21 x 13.5 cm",
                    "1967",
                    "978-0-06-088328-7",
                    "English",
                    "Hardcover",
                    false,
                    false,
                    false,
                    LocalDateTime.now().minusDays(5),
                    fiction
            ));

            productRepository.save(new Product(
                    "SPQR: A History of Ancient Rome",
                    "Mary Beard",
                    "A substantial history edition with a robust hardcover profile intended for collectors and frequent reference use.",
                    new BigDecimal("34.99"),
                    2,
                    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=400&auto=format&fit=crop",
                    "Liveright Publishing",
                    "Standard",
                    606,
                    "24 x 16 cm",
                    "2015",
                    "978-0-87140-423-7",
                    "English",
                    "Hardcover",
                    false,
                    true,
                    false,
                    LocalDateTime.now().minusDays(4),
                    history
            ));

            productRepository.save(new Product(
                    "To Kill a Mockingbird",
                    "Harper Lee",
                    "A beautifully restrained modern-classic edition with cream paper and a quiet, elegant silhouette.",
                    new BigDecimal("17.99"),
                    10,
                    "https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=400&auto=format&fit=crop",
                    "J. B. Lippincott & Co.",
                    "Cream",
                    281,
                    "20 x 13 cm",
                    "1960",
                    "978-0-06-112008-4",
                    "English",
                    "Paperback",
                    false,
                    false,
                    false,
                    LocalDateTime.now().minusDays(3),
                    fiction
            ));

            productRepository.save(new Product(
                    "The Great Gatsby",
                    "F. Scott Fitzgerald",
                    "A compact classic edition with bright jacket contrast and refined typesetting for easy rereading.",
                    new BigDecimal("15.99"),
                    14,
                    "https://images.unsplash.com/photo-1476275466078-4007374efbbe?q=80&w=400&auto=format&fit=crop",
                    "Charles Scribner's Sons",
                    "Standard",
                    180,
                    "20 x 13 cm",
                    "1925",
                    "978-0-7432-7356-5",
                    "English",
                    "Paperback",
                    false,
                    false,
                    false,
                    LocalDateTime.now().minusDays(2),
                    fiction
            ));

            productRepository.save(new Product(
                    "Norwegian Wood",
                    "Haruki Murakami",
                    "A contemplative literary edition with soft-touch boards and a stripped-back cover treatment.",
                    new BigDecimal("21.99"),
                    6,
                    "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=400&auto=format&fit=crop",
                    "Kodansha",
                    "Standard",
                    296,
                    "21 x 14 cm",
                    "1987",
                    "978-0-375-70402-1",
                    "English",
                    "Paperback",
                    false,
                    false,
                    false,
                    LocalDateTime.now().minusDays(1),
                    fiction
            ));
        };
    }
}
