package com.bytechat.security;

import com.bytechat.config.JwtConfig;

import io.jsonwebtoken.*;

import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.http.ResponseCookie;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.lang.NonNull;
import java.util.Objects;


import java.security.Key;
import java.util.Date;

@Component
public class JwtUtils {
    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);

    @Autowired
    private JwtConfig jwtConfig;


    public String getJwtFromCookies(@NonNull HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (Objects.requireNonNull(jwtConfig.getCookieName()).equals(cookie.getName())) {


                    String token = cookie.getValue();
                    // We return the first valid token found
                    if (validateJwtToken(token)) {
                        return token;
                    }
                }
            }
        }
        return null;
    }

    public ResponseCookie generateJwtCookie(UserDetails userPrincipal) {
        String jwt = generateTokenFromUsername(userPrincipal.getUsername());
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from(Objects.requireNonNull(jwtConfig.getCookieName()), Objects.requireNonNull(jwt))


                .path("/")
                .maxAge(24 * 60 * 60)
                .httpOnly(true)
                .secure(false); // Set to true in production with HTTPS

        if (jwtConfig.getCookieDomain() != null && !jwtConfig.getCookieDomain().trim().isEmpty()) {
            builder.domain(jwtConfig.getCookieDomain());
        }


        return builder.build();
    }

    public ResponseCookie getCleanJwtCookie() {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from(Objects.requireNonNull(jwtConfig.getCookieName()), null)


                .path("/")
                .maxAge(0)
                .httpOnly(true);

        if (jwtConfig.getCookieDomain() != null && !jwtConfig.getCookieDomain().trim().isEmpty()) {
            builder.domain(jwtConfig.getCookieDomain());
        }


        return builder.build();
    }

    public String getUserNameFromJwtToken(String token) {
        return Jwts.parserBuilder().setSigningKey(key()).build()
                .parseClaimsJws(token).getBody().getSubject();
    }

    private Key key() {
        return Keys.hmacShaKeyFor(jwtConfig.getSecret().getBytes());
    }


    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(key()).build().parse(authToken);
            return true;
        } catch (MalformedJwtException e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("JWT claims string is empty: {}", e.getMessage());
        }
        return false;
    }

    public String generateTokenFromUsername(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtConfig.getExpiration()))

                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();
    }
}
