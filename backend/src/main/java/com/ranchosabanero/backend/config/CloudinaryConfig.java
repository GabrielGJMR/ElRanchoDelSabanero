package com.ranchosabanero.backend.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;

/**
 * Cliente de Cloudinary, donde se guardan las fotos de los platillos y de la galería del local.
 * Sin credenciales la aplicación igual arranca (para no bloquear el resto del panel en desarrollo),
 * pero subir o borrar una foto fallará con un mensaje claro hasta que se configuren.
 */
@Slf4j
@Configuration
@Profile("!test")
public class CloudinaryConfig {

    @Bean
    Cloudinary cloudinary(@Value("${cloudinary.cloud-name}") String cloudName,
                          @Value("${cloudinary.api-key}") String apiKey,
                          @Value("${cloudinary.api-secret}") String apiSecret,
                          Environment environment) {
        if (isBlank(cloudName) || isBlank(apiKey) || isBlank(apiSecret)) {
            if (environment.acceptsProfiles(Profiles.of("prod"))) {
                throw new IllegalStateException(
                        "En producción debe definir CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET");
            }
            log.warn("Faltan las credenciales de Cloudinary (CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET). "
                    + "El panel arranca igual, pero subir o borrar fotos fallará hasta que las configure "
                    + "(cree una cuenta gratis en cloudinary.com > Dashboard).");
        }
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", true));
    }

    private static boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}
