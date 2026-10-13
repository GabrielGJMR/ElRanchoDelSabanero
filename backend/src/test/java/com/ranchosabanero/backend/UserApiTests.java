package com.ranchosabanero.backend;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Usuarios del panel (tabla app_users) y permisos por rol. El admin de pruebas viene de AdminBootstrapRunner. */
@SpringBootTest
@AutoConfigureMockMvc
class UserApiTests {

    @Autowired
    MockMvc mvc;

    private static final RequestPostProcessor ADMIN = httpBasic("admin", "clave-de-prueba");

    private String createEditor(String username) throws Exception {
        mvc.perform(post("/api/admin/users").with(ADMIN).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"" + username + "\",\"password\":\"clave-editor\",\"role\":\"EDITOR\"}"))
                .andExpect(status().isCreated());
        return username;
    }

    @Test
    void meReturnsLoggedInUserAndRole() throws Exception {
        mvc.perform(get("/api/admin/me").with(ADMIN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("admin"))
                .andExpect(jsonPath("$.role").value("ADMIN"));
    }

    @Test
    void adminCanCreateListAndDeleteUsers() throws Exception {
        createEditor("editor-crud");
        var editor = httpBasic("editor-crud", "clave-editor");

        mvc.perform(get("/api/admin/users").with(ADMIN))
                .andExpect(jsonPath("$[?(@.username=='editor-crud')].role").value("EDITOR"));

        String id = mvc.perform(get("/api/admin/users").with(ADMIN)).andReturn().getResponse().getContentAsString()
                .replaceAll("(?s).*\\{\"id\":(\\d+),\"username\":\"editor-crud\".*", "$1");

        mvc.perform(get("/api/admin/menus").with(editor)).andExpect(status().isOk());

        mvc.perform(delete("/api/admin/users/" + id).with(ADMIN)).andExpect(status().isNoContent());

        // el usuario borrado ya no puede entrar
        mvc.perform(get("/api/admin/menus").with(editor)).andExpect(status().isUnauthorized());
    }

    @Test
    void creatingDuplicateUsernameFails() throws Exception {
        createEditor("editor-dup");
        mvc.perform(post("/api/admin/users").with(ADMIN).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"editor-dup\",\"password\":\"otra-clave-valida\",\"role\":\"EDITOR\"}"))
                .andExpect(status().isConflict());
    }

    @Test
    void adminCannotDeleteOwnUser() throws Exception {
        String id = mvc.perform(get("/api/admin/users").with(ADMIN)).andReturn().getResponse().getContentAsString()
                .replaceAll("(?s).*\\{\"id\":(\\d+),\"username\":\"admin\".*", "$1");
        mvc.perform(delete("/api/admin/users/" + id).with(ADMIN)).andExpect(status().isBadRequest());
    }

    @Test
    void editorCanEditItemsButNotMenuStructureOrUsers() throws Exception {
        createEditor("editor-perms");
        var editor = httpBasic("editor-perms", "clave-editor");

        // estructura (menús/categorías) y usuarios: solo Admin
        mvc.perform(post("/api/admin/menus").with(editor).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Menú de editor\"}"))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/admin/users").with(editor)).andExpect(status().isForbidden());

        // contenido del día a día (platillos/fotos): Admin crea la categoría, Editor edita el platillo
        String menuId = mvc.perform(post("/api/admin/menus").with(ADMIN).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Menú para editor\"}"))
                .andReturn().getResponse().getContentAsString().replaceAll(".*\"id\":(\\d+).*", "$1");
        String catId = mvc.perform(post("/api/admin/categories").with(ADMIN).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"menuId\":" + menuId + ",\"name\":\"Para editar\"}"))
                .andReturn().getResponse().getContentAsString().replaceAll(".*\"id\":(\\d+).*", "$1");

        mvc.perform(delete("/api/admin/categories/" + catId).with(editor)).andExpect(status().isForbidden());

        String itemId = mvc.perform(post("/api/admin/items").with(editor).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"categoryId\":" + catId + ",\"name\":\"Plato del editor\",\"price\":1000}"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString().replaceAll(".*\"id\":(\\d+).*", "$1");

        mvc.perform(put("/api/admin/items/" + itemId).with(editor).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Plato del editor\",\"price\":1200,\"available\":false}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.price").value(1200));
    }
}
