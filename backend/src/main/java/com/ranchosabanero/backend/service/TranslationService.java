package com.ranchosabanero.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Traduce texto del español a inglés, francés y chino llamando a un servidor LibreTranslate propio
 * (self-hosted, ver el servicio "libretranslate" en docker-compose.yml; no requiere cuenta ni API key).
 * Si app.translate.url está vacío (como en desarrollo local y en las pruebas) o el servicio no responde,
 * se devuelven traducciones nulas: el menú público simplemente muestra el español como respaldo.
 */
@Service
public class TranslationService {

    private static final Logger log = LoggerFactory.getLogger(TranslationService.class);

    private final RestClient client;
    private final boolean enabled;

    public TranslationService(@Value("${app.translate.url:}") String baseUrl) {
        this.enabled = baseUrl != null && !baseUrl.isBlank();
        if (!enabled) {
            this.client = null;
            return;
        }
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(3_000);
        requestFactory.setReadTimeout(10_000);
        this.client = RestClient.builder().baseUrl(baseUrl).requestFactory(requestFactory).build();
    }

    public record Translations(String en, String fr, String zh) {
        static final Translations EMPTY = new Translations(null, null, null);
    }

    public boolean isEnabled() {
        return enabled;
    }

    /** Traduce a inglés, francés y chino. Si text es null/vacío o el servicio falla, devuelve todo en null. */
    public Translations translate(String text) {
        if (!enabled || text == null || text.isBlank()) {
            return Translations.EMPTY;
        }
        if (text.length() > 300) {
            throw new IllegalArgumentException("El texto para traducir excede el límite permitido");
        }
        return new Translations(translateTo(text, "en"), translateTo(text, "fr"), translateTo(text, "zh"));
    }

    private String translateTo(String text, String target) {
        try {
            Map<String, String> body = new LinkedHashMap<>();
            body.put("q", text);
            body.put("source", "es");
            body.put("target", target);
            body.put("format", "text");
            Map<?, ?> response = client.post()
                    .uri("/translate")
                    .body(body)
                    .retrieve()
                    .body(Map.class);
            Object translated = response == null ? null : response.get("translatedText");
            return translated == null ? null : translated.toString();
        } catch (Exception e) {
            log.warn("No se pudo traducir \"{}\" al idioma '{}': {}", text, target, e.getMessage());
            return null;
        }
    }
}
