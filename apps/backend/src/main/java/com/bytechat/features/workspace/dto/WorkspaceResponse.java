package com.bytechat.features.workspace.dto;

import lombok.Builder;
import lombok.Data;
import java.util.Set;

@Data
@Builder
public class WorkspaceResponse {
    private String id;
    private String name;
    private String slug;
    private String joinCode;
    private String adminId;
    private Set<String> memberIds;
    private Set<String> coAdminIds;
}
