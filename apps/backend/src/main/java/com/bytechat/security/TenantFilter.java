package com.bytechat.security;

import com.bytechat.features.workspace.model.Workspace;
import com.bytechat.features.workspace.repository.WorkspaceRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

@Component
public class TenantFilter extends OncePerRequestFilter {

    @Autowired
    private WorkspaceRepository workspaceRepository;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain)
            throws ServletException, IOException {
        
        String tenantSlug = extractTenantSlug(request);

        if (tenantSlug != null) {
            Optional<Workspace> workspace = workspaceRepository.findBySlug(tenantSlug);
            workspace.ifPresent(value -> TenantContext.setCurrentTenant(value.getId()));
        }

        try {
            filterChain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }

    private String extractTenantSlug(HttpServletRequest request) {
        // 1. Check Header (Preferred for API calls)
        String slug = request.getHeader("X-Tenant-Slug");
        if (slug != null && !slug.isEmpty()) {
            return slug;
        }

        // 2. Check Host (for subdomain support e.g. cloud.localhost)
        String host = request.getHeader("Host");
        if (host != null) {
            String domain = host.split(":")[0];
            String[] parts = domain.split("\\.");
            if (domain.endsWith("localhost") && parts.length > 1) {
                return parts[0];
            }
            if (parts.length > 2) {
                String firstPart = parts[0];
                if (!firstPart.equalsIgnoreCase("www") && !firstPart.equalsIgnoreCase("api")) {
                    return firstPart;
                }
            }
        }

        // 3. Check Path (for http://bytechat.com/{workspace-slug}/)
        String uri = request.getRequestURI();
        if (uri != null && uri.startsWith("/")) {
            String[] parts = uri.split("/");
            if (parts.length > 1) {
                String firstPart = parts[1];
                // Ignore common prefixes that are not workspaces
                if (!firstPart.isEmpty() && 
                    !firstPart.equalsIgnoreCase("api") && 
                    !firstPart.equalsIgnoreCase("auth") && 
                    !firstPart.equalsIgnoreCase("ws") && 
                    !firstPart.equalsIgnoreCase("error") &&
                    !firstPart.equalsIgnoreCase("static") &&
                    !firstPart.equalsIgnoreCase("favicon.ico")) {
                    return firstPart;
                }
            }
        }

        return null;
    }
}
