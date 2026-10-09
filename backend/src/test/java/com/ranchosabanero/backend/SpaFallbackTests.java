package com.ranchosabanero.backend;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.resttestclient.TestRestTemplate;
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureTestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * SpaController reenvía rutas desconocidas a index.html solo cuando el contenedor (Tomcat) despacha el error
 * 404 de verdad, algo que MockMvc no simula (usa un entorno "mock", sin servidor real). Por eso esta clase
 * arranca un servidor de verdad (RANDOM_PORT) en vez de usar MockMvc como el resto de las pruebas.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureTestRestTemplate
class SpaFallbackTests {

    @Autowired
    TestRestTemplate rest;

    @Test
    void knownReactRouteServesTheApp() {
        ResponseEntity<String> res = rest.getForEntity("/menu", String.class);
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(res.getBody()).contains("id=\"root\"");
    }

    @Test
    void unknownPageRouteAlsoFallsBackToTheApp() {
        // ej. alguien recarga en una ruta que ya no existe, o entra a un enlace viejo/mal escrito
        ResponseEntity<String> res = rest.getForEntity("/menu/algo-que-no-existe", String.class);
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(res.getBody()).contains("id=\"root\"");
    }

    @Test
    void unknownApiRouteStaysA404InsteadOfTheApp() {
        ResponseEntity<String> res = rest.getForEntity("/api/esto-no-existe", String.class);
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(res.getBody()).doesNotContain("id=\"root\"");
    }
}
