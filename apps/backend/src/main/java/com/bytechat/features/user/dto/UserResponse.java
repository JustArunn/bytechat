package com.bytechat.features.user.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import com.bytechat.features.workspace.dto.WorkspaceResponse;

@Data
@Builder
public class UserResponse {
    private String id;
    private String email;
    private String fullName;
    private String imageUrl;
    private String title;
    private String mobile;
    private String joinedAt;
    private String primarySlug;
    private List<WorkspaceResponse> workspaces;
}
