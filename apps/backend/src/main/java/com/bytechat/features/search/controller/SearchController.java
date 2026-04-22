package com.bytechat.features.search.controller;

import com.bytechat.features.search.dto.SearchResponse;
import com.bytechat.security.TenantContext;
import com.bytechat.features.search.service.SearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    @Autowired
    private SearchService searchService;

    @GetMapping
    public ResponseEntity<SearchResponse> search(
            @RequestParam(required = false) String workspaceId,
            @RequestParam String query) {
        String resolvedId = workspaceId != null ? workspaceId : TenantContext.getCurrentTenant();
        if (resolvedId == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(searchService.search(resolvedId, query));
    }
}
