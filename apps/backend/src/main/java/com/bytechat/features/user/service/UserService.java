package com.bytechat.features.user.service;

import com.bytechat.features.user.dto.UserResponse;
import com.bytechat.features.user.model.User;
import com.bytechat.features.user.repository.UserRepository;
import java.util.Objects;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.bytechat.features.workspace.repository.WorkspaceRepository workspaceRepository;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public UserResponse createUser(String email, String password, String fullName, String title, String workspaceId) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already exists");
        }

        User user = Objects.requireNonNull(User.builder()
                .email(email)
                .password(passwordEncoder.encode(password))
                .fullName(fullName)
                .title(title)
                .imageUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=" + fullName.replace(" ", ""))
                .build());

        if (workspaceId != null) {
            com.bytechat.features.workspace.model.Workspace workspace = workspaceRepository.findById(Objects.requireNonNull(workspaceId))
                    .orElseGet(() -> workspaceRepository.findBySlug(workspaceId)
                    .orElseThrow(() -> new RuntimeException("Workspace not found: " + workspaceId)));
            user.getWorkspaces().add(workspace);
            workspace.getMembers().add(user);
        }

        User savedUser = userRepository.save(user);
        return mapToResponse(Objects.requireNonNull(savedUser));
    }

    public UserResponse getUserById(String id) {
        User user = userRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return mapToResponse(user);
    }

    public UserResponse updateUser(String id, String fullName, String title, String mobile, String imageUrl) {
        User user = userRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (fullName != null) user.setFullName(fullName);
        if (title != null) user.setTitle(title);
        if (mobile != null) user.setMobile(mobile);
        if (imageUrl != null) user.setImageUrl(imageUrl);
        
        @SuppressWarnings("null")
        User savedUser = userRepository.save(user);
        return mapToResponse(Objects.requireNonNull(savedUser));
    }

    public void deleteUser(String id) {
        userRepository.deleteById(Objects.requireNonNull(id));
    }

    private UserResponse mapToResponse(User user) {
        return Objects.requireNonNull(UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .imageUrl(user.getImageUrl())
                .title(user.getTitle())
                .mobile(user.getMobile())
                .joinedAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null)
                .build());
    }
}
