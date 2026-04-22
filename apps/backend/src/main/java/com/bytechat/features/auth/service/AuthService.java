package com.bytechat.features.auth.service;

import com.bytechat.features.auth.dto.LoginRequest;
import com.bytechat.features.auth.dto.RegisterRequest;
import com.bytechat.features.user.dto.UserResponse;
import com.bytechat.features.workspace.dto.WorkspaceResponse;
import com.bytechat.features.user.model.User;
import com.bytechat.features.user.repository.UserRepository;
import com.bytechat.security.JwtUtils;
import java.util.Objects;
import java.util.stream.Collectors;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    public UserResponse register(RegisterRequest request, HttpServletResponse response) {
        if (!Objects.equals(request.getPassword(), request.getConfirmPassword())) {
            throw new RuntimeException("Passwords do not match");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = User.builder()
                .email(request.getEmail().toLowerCase().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .imageUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=" + request.getFullName().replace(" ", ""))
                .build();

        @SuppressWarnings("null")
        User savedUser = userRepository.save(user);

        // Auto-login
        ResponseCookie jwtCookie = jwtUtils.generateJwtCookie(savedUser);
        response.addHeader(HttpHeaders.SET_COOKIE, jwtCookie.toString());

        return mapToResponse(savedUser);
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public UserResponse login(LoginRequest request, HttpServletResponse response) {
        String normalizedEmail = request.getEmail().toLowerCase().trim();
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(normalizedEmail, request.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        User authUser = Objects.requireNonNull((User) authentication.getPrincipal());
        
        User user = userRepository.findById(Objects.requireNonNull(authUser.getId()))
                .orElseThrow(() -> new RuntimeException("User not found"));

        ResponseCookie jwtCookie = jwtUtils.generateJwtCookie(user);
        response.addHeader(HttpHeaders.SET_COOKIE, jwtCookie.toString());

        return mapToResponse(user);
    }

    public void logout(HttpServletResponse response) {
        ResponseCookie cookie = jwtUtils.getCleanJwtCookie();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public UserResponse getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || authentication.getPrincipal().equals("anonymousUser")) {
            return null;
        }
        User authUser = (User) authentication.getPrincipal();
        User user = userRepository.findById(Objects.requireNonNull(authUser.getId()))
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToResponse(user);
    }

    private UserResponse mapToResponse(User user) {
        return Objects.requireNonNull(UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .imageUrl(user.getImageUrl())
                .workspaces(user.getWorkspaces().stream()
                        .map(w -> WorkspaceResponse.builder()
                                .id(w.getId())
                                .name(w.getName())
                                .slug(w.getSlug())
                                .joinCode(w.getJoinCode())
                                .adminId(w.getAdminId())
                                .build())
                        .collect(Collectors.toList()))
                .primarySlug(user.getWorkspaces().isEmpty() ? null : user.getWorkspaces().iterator().next().getSlug())
                .build());
    }
}
