package com.campus.lostfound.item.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Component
public class JwtTokenProvider {

    private final SecretKey key;

    public JwtTokenProvider(
            @Value("${jwt.secret:CampusLostAndFoundSecretKeyForJwtAuthenticationWhichIsVeryLongAndSecure2026!}") String secret) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public boolean validateToken(String token) {
        try {
            getClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public Long getUserIdFromToken(String token) {
        Claims claims = getClaims(token);
        Object userIdObj = claims.get("userId");
        if (userIdObj instanceof Number) {
            return ((Number) userIdObj).longValue();
        } else if (userIdObj instanceof String) {
            try {
                return Long.parseLong((String) userIdObj);
            } catch (NumberFormatException ignored) {}
        }
        return null;
    }

    public String getEmailFromToken(String token) {
        return getClaims(token).getSubject();
    }

    public String getNameFromToken(String token) {
        Claims claims = getClaims(token);
        return (String) claims.get("name");
    }

    public String getRoleFromToken(String token) {
        Claims claims = getClaims(token);
        return (String) claims.get("role");
    }
}
