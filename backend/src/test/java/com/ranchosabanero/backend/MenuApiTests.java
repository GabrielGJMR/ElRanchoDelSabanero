package com.ranchosabanero.backend;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
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

    @Test
    void adminCanUploadAndRemoveItemPhoto() throws Exception {
        var admin = httpBasic("admin", "clave-de-prueba");
        var png = new java.io.ByteArrayOutputStream();
        javax.imageio.ImageIO.write(new java.awt.image.BufferedImage(20, 20, java.awt.image.BufferedImage.TYPE_INT_RGB), "png", png);

        // el menú público no tiene foto al inicio
        mvc.perform(get("/api/menu")).andExpect(jsonPath("$[0].items[0].imageUrl").doesNotExist());

        String body = mvc.perform(multipart("/api/admin/items/1/image")
                        .file(new MockMultipartFile("file", "foto.png", "image/png", png.toByteArray()))
                        .with(admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.imageUrl").value(org.hamcrest.Matchers.startsWith("/uploads/")))
                .andReturn().getResponse().getContentAsString();
        String url = body.replaceAll(".*\"imageUrl\":\"([^\"]+)\".*", "$1");

        mvc.perform(get(url)).andExpect(status().isOk());
        mvc.perform(get("/api/menu")).andExpect(jsonPath("$[0].items[0].imageUrl").value(url));

        mvc.perform(delete("/api/admin/items/1/image").with(admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.imageUrl").doesNotExist());
        mvc.perform(get(url)).andExpect(status().isNotFound());
    }

    @Test
    void uploadRejectsFilesThatAreNotImagesAndRequiresLogin() throws Exception {
        var fake = new MockMultipartFile("file", "foto.png", "image/png", "esto no es una imagen".getBytes());

        mvc.perform(multipart("/api/admin/items/1/image").file(fake).with(httpBasic("admin", "clave-de-prueba")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists());
        mvc.perform(multipart("/api/admin/items/1/image").file(fake)).andExpect(status().isUnauthorized());
    }

    @Test
    void pageRoutesServeTheReactApp() throws Exception {
        for (String route : new String[] {"/menu", "/ubicacion", "/contacto", "/admin"}) {
            mvc.perform(get(route)).andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.forwardedUrl("/index.html"));
        }
    }
}
