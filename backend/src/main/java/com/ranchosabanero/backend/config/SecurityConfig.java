package com.ranchosabanero.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;

/**
 * Autenticación contra la tabla app_users (ver JpaUserDetailsService y AdminBootstrapRunner, que
 * crea el primer administrador desde ADMIN_USER/ADMIN_PASSWORD). Dos roles en /api/admin/**:
 * ADMIN (todo, incluida la gestión de usuarios y la estructura de menús/categorías) y EDITOR
 * (solo platillos, precios, disponibilidad y fotos; no borra categorías/menús ni gestiona usuarios).
 * El menú público y la web son accesibles sin login.
 * Cuando se agregue registro de clientes: rutas nuevas (por ejemplo /api/auth/**) con su propio rol.
 */
@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable) // API sin sesiones ni cookies: no aplica CSRF
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .headers(headers -> headers
                        .contentTypeOptions(Customizer.withDefaults())
                        .frameOptions(frame -> frame.deny())
                        .referrerPolicy(policy -> policy.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN)))
                .authorizeHttpRequests(auth -> auth
                        // Gestión de usuarios: solo Admin.
                        .requestMatchers("/api/admin/users/**").hasRole("ADMIN")
                        // Estructura de menús y categorías (crear/renombrar/borrar): solo Admin.
                        // (el GET de /menus y /menus/{id}/categories, de un solo segmento más, no matchea
                        // estos patrones y cae en la regla general de abajo, abierta a ambos roles)
                        .requestMatchers(HttpMethod.POST, "/api/admin/menus").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/admin/menus/*").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/admin/menus/*").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/admin/categories").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/admin/categories/*").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/admin/categories/*").hasRole("ADMIN")
                        // Secciones de fotos (crear/renombrar/borrar la sección en sí): solo Admin.
                        // (subir/borrar una foto dentro de una sección ya existente tiene más segmentos
                        // de ruta -gallery/sections/{id}/photos, gallery/photos/{id}- y no matchea esto)
                        .requestMatchers(HttpMethod.POST, "/api/admin/gallery/sections").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/admin/gallery/sections/*").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/admin/gallery/sections/*").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/admin/gallery/photos/*").hasAnyRole("ADMIN", "EDITOR")
                        .requestMatchers(HttpMethod.POST, "/api/admin/gallery/sections/*/photos").hasAnyRole("ADMIN", "EDITOR")
                        .requestMatchers(HttpMethod.POST, "/api/admin/items").hasAnyRole("ADMIN", "EDITOR")
                        .requestMatchers(HttpMethod.PUT, "/api/admin/items/*").hasAnyRole("ADMIN", "EDITOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/admin/items/*").hasAnyRole("ADMIN", "EDITOR")
                        .requestMatchers(HttpMethod.POST, "/api/admin/items/*/image").hasAnyRole("ADMIN", "EDITOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/admin/items/*/image").hasAnyRole("ADMIN", "EDITOR")
                        // Resto de /api/admin/** (platillos, fotos, galería, /me, GET de menús/categorías): ambos roles.
                        .requestMatchers("/api/admin/**").hasAnyRole("ADMIN", "EDITOR")
                        .anyRequest().permitAll())
                // 401 sin cabecera WWW-Authenticate para que el navegador no abra su propio cuadro de login
                .httpBasic(basic -> basic.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
                .exceptionHandling(exceptions -> exceptions.accessDeniedHandler((request, response, denied) -> {
                    response.setStatus(HttpStatus.FORBIDDEN.value());
                    response.setContentType("application/json");
                    response.setCharacterEncoding("UTF-8");
                    response.getWriter().write("{\"error\":\"No tiene permiso para realizar esta acción\"}");
                }))
                .formLogin(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable);
        return http.build();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }
}
