package com.bytechat.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "bytechat.jwt")
@Data
public class JwtConfig {
    private String secret;
    private int expiration;
    private String cookieName;
    private String cookieDomain;
}
