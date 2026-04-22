package com.bytechat.features.workspace.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class WorkspaceInviteResponse {
    private String inviteId;
    private String workspaceId;
    private String workspaceName;
    private String workspaceSlug;
}
