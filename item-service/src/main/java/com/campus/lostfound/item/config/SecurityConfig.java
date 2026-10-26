package com.campus.lostfound.item.config;

import com.campus.lostfound.item.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public access
                        .requestMatchers(HttpMethod.GET, "/api/items").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/items/{id:[0-9]+}").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/items/images/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/items/stats").permitAll()
                        .requestMatchers(
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/actuator/**",
                                "/h2-console/**"
                        ).permitAll()

                        // Admin operations
                        .requestMatchers("/api/items/admin/**").hasAnyAuthority("ADMIN", "ROLE_ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/items/*/admin").hasAnyAuthority("ADMIN", "ROLE_ADMIN")

                        // Authenticated operations
                        .requestMatchers(HttpMethod.POST, "/api/items/upload-image").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/items/lost").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/items/found").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/items/my").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/items/{id:[0-9]+}").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/items/{id:[0-9]+}").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/items/{id:[0-9]+}/status").authenticated()

                        .anyRequest().authenticated()
                )
                .headers(headers -> headers.frameOptions(frame -> frame.disable()))
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With", "X-User-Id", "X-User-Role", "X-User-Name", "X-User-Email"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
