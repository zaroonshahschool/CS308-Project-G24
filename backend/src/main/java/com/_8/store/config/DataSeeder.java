package com._8.store.config;

import com._8.store.entity.Category;
import com._8.store.entity.Order;
import com._8.store.entity.OrderItem;
import com._8.store.entity.OrderStatus;
import com._8.store.entity.Product;
import com._8.store.entity.Rating;
import com._8.store.entity.User;
import com._8.store.repository.CategoryRepository;
import com._8.store.repository.OrderRepository;
import com._8.store.repository.ProductRepository;
import com._8.store.repository.RatingRepository;
import com._8.store.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Configuration
public class DataSeeder {

    @Bean
    @org.springframework.core.annotation.Order(2)
    CommandLineRunner seedDatabase(
            CategoryRepository categoryRepository,
            ProductRepository productRepository,
            UserRepository userRepository,
            OrderRepository orderRepository,
            RatingRepository ratingRepository
    ) {
        return args -> {
            if (categoryRepository.count() > 0 || productRepository.count() > 0) {
                return;
            }

            Category fiction = categoryRepository.save(new Category(
                    "Fiction",
                    "https://m.media-amazon.com/images/I/81O7u0dGaWL._AC_UF1000,1000_QL80_.jpg",
                    1
            ));

            Category nonFiction = categoryRepository.save(new Category(
                    "Non-Fiction",
                    "https://cdn.kobo.com/book-images/4a153913-d291-4dcb-bb2f-7ff6fa65b614/1200/1200/False/sapiens-3.jpg",
                    2
            ));

            Category scienceFiction = categoryRepository.save(new Category(
                    "Science Fiction",
                    "https://m.media-amazon.com/images/I/71oO1E-XPuL.jpg",
                    3
            ));

            Category mystery = categoryRepository.save(new Category(
                    "Mystery",
                    "https://m.media-amazon.com/images/I/713e4Yk6brL._AC_UF894,1000_QL80_.jpg",
                    4
            ));

            Category history = categoryRepository.save(new Category(
                    "History",
                    "https://cdn.kobo.com/book-images/72ccdada-cc42-4baa-b0b4-7791e8a6cb0d/1200/1200/False/guns-germs-and-steel-the-fates-of-human-societies-20th-anniversary-edition.jpg",
                    5
            ));

            // ── Demo-critical products (A / B / C) ─────────────────────────────

            // Product A — out of stock
            productRepository.save(new Product(
                    "1984",
                    "George Orwell",
                    "Winston Smith struggles against the omnipresent surveillance of a totalitarian regime in this enduring dystopian classic that gave the modern world Big Brother and Newspeak.",
                    new BigDecimal("18.99"),
                    new BigDecimal("9.50"),
                    0,
                    "https://m.media-amazon.com/images/I/61HkdyBpKOL.jpg",
                    "Penguin Books",
                    "Cream",
                    328,
                    "20 x 13 cm",
                    "1949",
                    "978-0-452-28423-4",
                    "English",
                    "Paperback",
                    false,
                    true,
                    false,
                    LocalDateTime.now().minusDays(4),
                    fiction
            ));

            // Product B — last 1 unit
            productRepository.save(new Product(
                    "The Great Gatsby",
                    "F. Scott Fitzgerald",
                    "Jay Gatsby's relentless pursuit of a vanished love unfolds against the glittering excess of Long Island's Jazz Age in Fitzgerald's tightly drawn American tragedy.",
                    new BigDecimal("14.99"),
                    new BigDecimal("7.50"),
                    1,
                    "https://i0.wp.com/americanwritersmuseum.org/wp-content/uploads/2018/02/CK-3.jpg?resize=267%2C400&ssl=1",
                    "Scribner",
                    "Cream",
                    180,
                    "20 x 13 cm",
                    "1925",
                    "978-0-7432-7356-5",
                    "English",
                    "Paperback",
                    true,
                    false,
                    false,
                    LocalDateTime.now().minusDays(5),
                    fiction
            ));

            // Product C — high stock, description-searchable on "humankind"
            Product sapiens = productRepository.save(new Product(
                    "Sapiens: A Brief History of Humankind",
                    "Yuval Noah Harari",
                    "A sweeping tour through the cognitive, agricultural, and scientific revolutions that shaped humankind, from the savannas of Africa to the algorithm-driven present.",
                    new BigDecimal("24.99"),
                    new BigDecimal("12.50"),
                    80,
                    "https://cdn.kobo.com/book-images/4a153913-d291-4dcb-bb2f-7ff6fa65b614/1200/1200/False/sapiens-3.jpg",
                    "Harper Perennial",
                    "White",
                    464,
                    "23 x 15 cm",
                    "2014",
                    "978-0-06-231609-7",
                    "English",
                    "Paperback",
                    true,
                    false,
                    true,
                    LocalDateTime.now().minusDays(1),
                    nonFiction
            ));

            // ── Supporting Fiction ─────────────────────────────────────────────

            productRepository.save(new Product(
                    "The Midnight Library",
                    "Matt Haig",
                    "Between life and death stands a library of infinite alternate lives, each volume a chance for Nora Seed to undo her regrets and discover what truly makes a life worth living.",
                    new BigDecimal("24.99"),
                    new BigDecimal("12.50"),
                    25,
                    "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1602190253l/52578297.jpg",
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
                    LocalDateTime.now().minusDays(2),
                    fiction
            ));

            productRepository.save(new Product(
                    "To Kill a Mockingbird",
                    "Harper Lee",
                    "Through the eyes of young Scout Finch, a small Alabama town confronts prejudice, conscience, and courage when her father defends a Black man wrongfully accused.",
                    new BigDecimal("17.99"),
                    new BigDecimal("9.00"),
                    18,
                    "https://m.media-amazon.com/images/I/81O7u0dGaWL._AC_UF1000,1000_QL80_.jpg",
                    "J. B. Lippincott & Co.",
                    "Cream",
                    281,
                    "20 x 13 cm",
                    "1960",
                    "978-0-06-112008-4",
                    "English",
                    "Paperback",
                    false,
                    true,
                    false,
                    LocalDateTime.now().minusDays(6),
                    fiction
            ));

            // ── Supporting Non-Fiction ─────────────────────────────────────────

            Product educated = productRepository.save(new Product(
                    "Educated",
                    "Tara Westover",
                    "A survivalist family's youngest daughter sets foot in a classroom for the first time at seventeen and writes herself, page by page, into Cambridge and a new life.",
                    new BigDecimal("22.99"),
                    new BigDecimal("11.50"),
                    30,
                    "https://m.media-amazon.com/images/I/71-4MkLN5jL.jpg",
                    "Random House",
                    "White",
                    352,
                    "23 x 15 cm",
                    "2018",
                    "978-0-399-59050-4",
                    "English",
                    "Hardcover",
                    false,
                    false,
                    false,
                    LocalDateTime.now().minusDays(10),
                    nonFiction
            ));

            productRepository.save(new Product(
                    "Atomic Habits",
                    "James Clear",
                    "An evidence-led system for building tiny daily routines whose compounding effect quietly rewires identity, performance, and the trajectory of an ordinary life.",
                    new BigDecimal("19.99"),
                    new BigDecimal("10.00"),
                    40,
                    "https://cdn.kobo.com/book-images/3e453d1c-61a3-4ed6-b5fe-6232d6483c08/1200/1200/False/atomic-habits-tiny-changes-remarkable-results.jpg",
                    "Avery",
                    "White",
                    320,
                    "23 x 15 cm",
                    "2018",
                    "978-0-7352-1129-2",
                    "English",
                    "Hardcover",
                    false,
                    false,
                    true,
                    LocalDateTime.now().minusDays(3),
                    nonFiction
            ));

            // ── Supporting Science Fiction ────────────────────────────────────

            Product dune = productRepository.save(new Product(
                    "Dune",
                    "Frank Herbert",
                    "On the desert planet Arrakis, young Paul Atreides inherits a throne, a prophecy, and a war over the spice that powers interstellar civilization.",
                    new BigDecimal("21.99"),
                    new BigDecimal("11.00"),
                    22,
                    "https://m.media-amazon.com/images/I/71oO1E-XPuL.jpg",
                    "Ace Books",
                    "Cream",
                    688,
                    "21 x 14 cm",
                    "1965",
                    "978-0-441-17271-9",
                    "English",
                    "Paperback",
                    true,
                    true,
                    false,
                    LocalDateTime.now().minusDays(7),
                    scienceFiction
            ));

            productRepository.save(new Product(
                    "The Three-Body Problem",
                    "Liu Cixin",
                    "A secret military project, a mysterious online game, and a signal from across the galaxy entangle humanity in first contact with a civilization fleeing a dying sun.",
                    new BigDecimal("23.99"),
                    new BigDecimal("12.00"),
                    15,
                    "https://m.media-amazon.com/images/I/61s6hqLkRCL._AC_UF894,1000_QL80_.jpg",
                    "Tor Books",
                    "White",
                    416,
                    "21 x 14 cm",
                    "2014",
                    "978-0-7653-7706-7",
                    "English",
                    "Paperback",
                    false,
                    false,
                    false,
                    LocalDateTime.now().minusDays(9),
                    scienceFiction
            ));

            // ── Supporting Mystery ────────────────────────────────────────────

            productRepository.save(new Product(
                    "The Girl with the Dragon Tattoo",
                    "Stieg Larsson",
                    "Disgraced journalist Mikael Blomkvist and a fiercely guarded hacker chase a forty-year-old disappearance through the rotten heart of a Swedish dynasty.",
                    new BigDecimal("18.99"),
                    new BigDecimal("9.50"),
                    12,
                    "https://m.media-amazon.com/images/I/8133MFwkxOL._AC_UF894,1000_QL80_.jpg",
                    "Knopf",
                    "White",
                    672,
                    "21 x 14 cm",
                    "2008",
                    "978-0-307-26975-1",
                    "English",
                    "Paperback",
                    false,
                    false,
                    false,
                    LocalDateTime.now().minusDays(11),
                    mystery
            ));

            productRepository.save(new Product(
                    "Gone Girl",
                    "Gillian Flynn",
                    "On the morning of their fifth wedding anniversary, Amy Dunne vanishes — and what follows is a marriage retold from two unreliable angles, sharper than a paper cut.",
                    new BigDecimal("17.99"),
                    new BigDecimal("9.00"),
                    20,
                    "https://m.media-amazon.com/images/I/713e4Yk6brL._AC_UF894,1000_QL80_.jpg",
                    "Crown Publishing",
                    "White",
                    432,
                    "21 x 14 cm",
                    "2012",
                    "978-0-307-58836-4",
                    "English",
                    "Paperback",
                    false,
                    true,
                    false,
                    LocalDateTime.now().minusDays(8),
                    mystery
            ));

            // ── Supporting History ────────────────────────────────────────────

            productRepository.save(new Product(
                    "Guns, Germs, and Steel",
                    "Jared Diamond",
                    "Why did some societies forge empires while others fell to them? Diamond traces thirteen thousand years of human inequality back to geography, ecology, and chance.",
                    new BigDecimal("20.99"),
                    new BigDecimal("10.50"),
                    28,
                    "https://cdn.kobo.com/book-images/72ccdada-cc42-4baa-b0b4-7791e8a6cb0d/1200/1200/False/guns-germs-and-steel-the-fates-of-human-societies-20th-anniversary-edition.jpg",
                    "W. W. Norton & Company",
                    "White",
                    528,
                    "23 x 15 cm",
                    "1997",
                    "978-0-393-31755-8",
                    "English",
                    "Paperback",
                    false,
                    false,
                    false,
                    LocalDateTime.now().minusDays(12),
                    history
            ));

            productRepository.save(new Product(
                    "A People's History of the United States",
                    "Howard Zinn",
                    "American history retold from below — through the eyes of laborers, women, slaves, soldiers, and immigrants whose voices the official record kept off the page.",
                    new BigDecimal("22.99"),
                    new BigDecimal("11.50"),
                    16,
                    "https://m.media-amazon.com/images/I/71Zb-D8NaGL._AC_UF1000,1000_QL80_.jpg",
                    "Harper Perennial",
                    "White",
                    768,
                    "23 x 15 cm",
                    "1980",
                    "978-0-06-083865-2",
                    "English",
                    "Paperback",
                    false,
                    false,
                    false,
                    LocalDateTime.now().minusDays(13),
                    history
            ));

            // ── Pre-seeded delivered orders so popularity sort has signal ──────
            // Without these, all three popularity tiebreakers (purchase volume,
            // avg rating, high-rating count) resolve to 0 and the query falls
            // through to created_at, making "sort by popularity" visually
            // identical to the default catalogue order.

            User customer = userRepository.findByEmailIgnoreCase("customer@aurelia.local").orElse(null);

            if (customer != null) {
                orderRepository.save(buildDeliveredOrder(customer, sapiens, 5, LocalDateTime.now().minusDays(10)));
                sapiens.setStock(sapiens.getStock() - 5);
                productRepository.save(sapiens);

                orderRepository.save(buildDeliveredOrder(customer, dune, 3, LocalDateTime.now().minusDays(7)));
                dune.setStock(dune.getStock() - 3);
                productRepository.save(dune);

                orderRepository.save(buildDeliveredOrder(customer, educated, 2, LocalDateTime.now().minusDays(3)));
                educated.setStock(educated.getStock() - 2);
                productRepository.save(educated);

                ratingRepository.save(new Rating(customer, educated, 5, LocalDateTime.now().minusDays(2)));
            }
        };
    }

    private static Order buildDeliveredOrder(User user, Product product, int quantity, LocalDateTime placedAt) {
        Order order = new Order();
        order.setUser(user);
        order.setCreatedAt(placedAt);
        order.setStatus(OrderStatus.DELIVERED);
        order.setShippingStreet("1 Aurelia Lane");
        order.setShippingCity("Istanbul");
        order.setShippingPostalCode("34000");
        order.setShippingCountry("Türkiye");

        OrderItem item = new OrderItem();
        item.setProduct(product);
        item.setQuantity(quantity);
        item.setUnitPrice(product.getPrice());
        item.setPurchasedPrice(product.getPrice());
        item.setUnitCost(product.getCostPrice());
        BigDecimal lineTotal = product.getPrice().multiply(BigDecimal.valueOf(quantity));
        item.setLineTotal(lineTotal);
        order.addItem(item);
        order.setTotalPrice(lineTotal);

        return order;
    }
}
