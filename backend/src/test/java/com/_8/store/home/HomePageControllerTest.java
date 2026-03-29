package com._8.store.home;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com._8.store.config.SecurityConfig;

@WebMvcTest(HomePageController.class)
@Import(SecurityConfig.class)
class HomePageControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private HomePageService homePageService;

    @Test
    void returnsMainScreenPayload() throws Exception {
        HomePageResponse response = new HomePageResponse(
                new HomePageResponse.HeroSection(
                        "Masterpiece Edition",
                        "The Secret History",
                        "Collector's edition description",
                        new BigDecimal("39.99"),
                        "https://example.com/hero.jpg",
                        "Explore Edition",
                        "/catalogue"
                ),
                List.of(new HomePageResponse.LibraryCollection("Classic Fiction", "◌", "library-card-3")),
                List.of(new HomePageResponse.FeaturedBook(
                        1L,
                        "The Midnight Library",
                        "Matt Haig",
                        new BigDecimal("24.99"),
                        "https://example.com/book.jpg",
                        "Description"
                )),
                new HomePageResponse.EditorsChoice(
                        2L,
                        "Dune",
                        "Editor's pick",
                        new BigDecimal("29.99"),
                        "https://example.com/editor.jpg",
                        List.of("Premium paper"),
                        "/catalogue"
                ),
                List.of(new HomePageResponse.ValueProposition("Worldwide Delivery", "Trackable shipping.", "globe"))
        );

        given(homePageService.getHomePage()).willReturn(response);

        mockMvc.perform(get("/api/home"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.hero.title").value("The Secret History"))
                .andExpect(jsonPath("$.libraries[0].name").value("Classic Fiction"))
                .andExpect(jsonPath("$.notableBooks[0].author").value("Matt Haig"))
                .andExpect(jsonPath("$.editorsChoice.title").value("Dune"))
                .andExpect(jsonPath("$.valueProps[0].title").value("Worldwide Delivery"));
    }
}
