package com.ranchosabanero.backend;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class MenuApiTests {

    @Autowired
    MockMvc mvc;

    @Test
    void publicMenuHasSeededCategoriesWithoutLogin() throws Exception {
        mvc.perform(get("/api/menu"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(org.hamcrest.Matchers.greaterThanOrEqualTo(5)))
                .andExpect(jsonPath("$[0].name").value("Pollo"))
                .andExpect(jsonPath("$[1].name").value("Menú de niños")) // acentos bien guardados (UTF-8)
                .andExpect(jsonPath("$[0].items[0].name").value("Gordon Blue"))
                .andExpect(jsonPath("$[0].items[0].price").value(7500));
    }

    @Test
    void adminRoutesRequireLogin() throws Exception {
        mvc.perform(get("/api/admin/menu")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/admin/menu").with(httpBasic("admin", "mala"))).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/admin/menu").with(httpBasic("admin", "clave-de-prueba"))).andExpect(status().isOk());
    }

    @Test
    void adminCanCreateEditHideAndDeleteItems() throws Exception {
        var admin = httpBasic("admin", "clave-de-prueba");

        mvc.perform(post("/api/admin/categories").with(admin).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Postres\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Postres"));

        String catId = mvc.perform(get("/api/admin/menu").with(admin)).andReturn().getResponse().getContentAsString()
                .replaceAll("(?s).*\\{\"id\":(\\d+),\"name\":\"Postres\".*", "$1");

        String body = mvc.perform(post("/api/admin/items").with(admin).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"categoryId\":" + catId + ",\"name\":\"Tres leches\",\"price\":2500}"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String itemId = body.replaceAll(".*\"id\":(\\d+).*", "$1");

        // oculto: no sale en el menú público
        mvc.perform(put("/api/admin/items/" + itemId).with(admin).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Tres leches\",\"price\":2800,\"available\":false}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.price").value(2800));
        mvc.perform(get("/api/menu")).andExpect(jsonPath("$[?(@.name=='Postres')].items.length()").value(0));

        mvc.perform(delete("/api/admin/items/" + itemId).with(admin)).andExpect(status().isNoContent());
        mvc.perform(delete("/api/admin/items/" + itemId).with(admin)).andExpect(status().isNotFound());
    }

    @Test
    void invalidItemIsRejectedWithMessage() throws Exception {
        mvc.perform(post("/api/admin/items").with(httpBasic("admin", "clave-de-prueba"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"categoryId\":1,\"name\":\"\",\"price\":-5}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists());
    }
}
