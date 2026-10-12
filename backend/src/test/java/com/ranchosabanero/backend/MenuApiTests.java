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
        mvc.perform(get("/api/admin/menus")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/admin/menus").with(httpBasic("admin", "mala"))).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/admin/menus").with(httpBasic("admin", "clave-de-prueba"))).andExpect(status().isOk());
    }

    @Test
    void adminCanCreateEditHideAndDeleteItems() throws Exception {
        var admin = httpBasic("admin", "clave-de-prueba");

        // Menú propio para esta prueba: no depende del orden de /api/admin/menus (que ya trae
        // los menús sembrados, incluido "Eventos", que no sale en la carta pública).
        String menuId = mvc.perform(post("/api/admin/menus").with(admin).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Menú de prueba\"}"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString()
                .replaceAll(".*\"id\":(\\d+).*", "$1");

        mvc.perform(post("/api/admin/categories").with(admin).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"menuId\":" + menuId + ",\"name\":\"Postres\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Postres"));

        String catId = mvc.perform(get("/api/admin/menus/" + menuId + "/categories").with(admin))
                .andReturn().getResponse().getContentAsString()
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
    void eventsMenuHasOwnPublicPageAndIsHiddenFromMainMenu() throws Exception {
        var admin = httpBasic("admin", "clave-de-prueba");

        String eventsId = mvc.perform(get("/api/admin/menus").with(admin)).andReturn().getResponse().getContentAsString()
                .replaceAll("(?s).*\\{\"id\":(\\d+),\"name\":\"Eventos\"\\}.*", "$1");

        mvc.perform(post("/api/admin/categories").with(admin).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"menuId\":" + eventsId + ",\"name\":\"Paquetes de cumpleaños\"}"))
                .andExpect(status().isCreated());

        mvc.perform(get("/api/menu"))
                .andExpect(jsonPath("$[?(@.name=='Paquetes de cumpleaños')]").isEmpty());
        mvc.perform(get("/api/menu/eventos"))
                .andExpect(jsonPath("$[?(@.name=='Paquetes de cumpleaños')]").exists());
        mvc.perform(get("/api/menu/no-existe")).andExpect(status().isNotFound());
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

        mvc.perform(get("/api/menu")).andExpect(jsonPath("$[0].items[0].imageUrl").value(url));

        mvc.perform(delete("/api/admin/items/1/image").with(admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.imageUrl").doesNotExist());
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
    void adminCanManageGalleryPhotos() throws Exception {
        var admin = httpBasic("admin", "clave-de-prueba");
        var png = new java.io.ByteArrayOutputStream();
        javax.imageio.ImageIO.write(new java.awt.image.BufferedImage(10, 10, java.awt.image.BufferedImage.TYPE_INT_RGB), "png", png);

        mvc.perform(get("/api/gallery")).andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(0));

        mvc.perform(multipart("/api/admin/gallery")
                        .file(new MockMultipartFile("file", "local.png", "image/png", png.toByteArray())))
                .andExpect(status().isUnauthorized());

        String body = mvc.perform(multipart("/api/admin/gallery")
                        .file(new MockMultipartFile("file", "local.png", "image/png", png.toByteArray()))
                        .with(admin))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.url").value(org.hamcrest.Matchers.startsWith("/uploads/")))
                .andReturn().getResponse().getContentAsString();
        String id = body.replaceAll(".*\"id\":(\\d+).*", "$1");

        mvc.perform(get("/api/gallery")).andExpect(jsonPath("$.length()").value(1));

        mvc.perform(delete("/api/admin/gallery/" + id).with(admin)).andExpect(status().isNoContent());
        mvc.perform(get("/api/gallery")).andExpect(jsonPath("$.length()").value(0));
    }
}
