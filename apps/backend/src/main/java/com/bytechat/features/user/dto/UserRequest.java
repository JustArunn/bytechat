package com.bytechat.features.user.dto;

import lombok.Data;

@Data
public class UserRequest {
    private String fullName;
    private String title;
    private String email;
    private String password;
    private String workspaceId;
    private String mobile;
    private String imageUrl;
}
