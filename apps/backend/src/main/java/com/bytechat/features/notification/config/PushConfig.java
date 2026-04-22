package com.bytechat.features.notification.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "bytechat.vapid")
@Data
public class PushConfig {
    private String publicKey;
    private String privateKey;
    private String subject;
}
