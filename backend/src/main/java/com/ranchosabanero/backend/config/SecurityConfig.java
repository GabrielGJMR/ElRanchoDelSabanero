package com.ranchosabanero.backend.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;

import java.security.SecureRandom;
import java.util.HexFormat;

/**
 * Por ahora solo existe el administrador (rutas /api/admin/**). El menú y la web son públicos.
 * Cuando se agregue registro de clientes: tabla de usuarios + UserDetailsService con base de datos,
 * y rutas nuevas (por ejemplo /api/auth/** y /api/me) que exijan rol CUSTOMER.
 */
@Slf4j
@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable) // API sin sesiones ni cookies: no aplica CSRF
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .anyRequest().permitAll())
                // 401 sin cabecera WWW-Authenticate para que el navegador no abra su propio cuadro de login
                .httpBasic(basic -> basic.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
                .formLogin(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable);
        return http.build();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

    @Bean
    UserDetailsService users(@Value("${app.admin.username}") String username,
                             @Value("${app.admin.password}") String password,
                             PasswordEncoder encoder) {
        if (password == null || password.isBlank()) {
            byte[] bytes = new byte[9];
            new SecureRandom().nextBytes(bytes);
            password = HexFormat.of().formatHex(bytes);
            log.warn("ADMIN_PASSWORD no está definido. Clave temporal del panel de administración: {}", password);
        }
        return new InMemoryUserDetailsManager(
                User.withUsername(username).password(encoder.encode(password)).roles("ADMIN").build());
    }
}
