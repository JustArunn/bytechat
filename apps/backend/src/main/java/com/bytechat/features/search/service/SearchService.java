package com.bytechat.features.search.service;

import com.bytechat.features.search.dto.SearchResponse;
import com.bytechat.features.conversation.repository.ConversationRepository;
import com.bytechat.features.message.repository.MessageRepository;
import com.bytechat.features.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SearchService {

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private ConversationRepository conversationRepository;

        @Autowired
        private MessageRepository messageRepository;

        @Autowired
        private com.bytechat.features.workspace.repository.WorkspaceRepository workspaceRepository;

        public SearchResponse search(String idOrSlug, String query) {
                if (query == null || query.trim().isEmpty()) {
                        return SearchResponse.builder()
                                        .users(List.of())
                                        .channels(List.of())
                                        .messages(List.of())
                                        .build();
                }

                // Resolve workspace ID from slug if needed
                String workspaceId = workspaceRepository.findById(idOrSlug)
                                .map(w -> w.getId())
                                .orElseGet(() -> workspaceRepository.findBySlug(idOrSlug)
                                                .map(w -> w.getId())
                                                .orElseThrow(() -> new com.bytechat.exception.ResourceNotFoundException("Workspace not found: " + idOrSlug)));

                String trimmedQuery = query.trim();

                List<SearchResponse.UserResult> users = userRepository.searchInWorkspace(workspaceId, trimmedQuery)
                                .stream()
                                .map(u -> SearchResponse.UserResult.builder()
                                                .id(u.getId())
                                                .fullName(u.getFullName())
                                                .email(u.getEmail())
                                                .imageUrl(u.getImageUrl())
                                                .build())
                                .collect(Collectors.toList());

                List<SearchResponse.ChannelResult> channels = conversationRepository
                                .searchChannels(workspaceId, trimmedQuery).stream()
                                .map(c -> SearchResponse.ChannelResult.builder()
                                                .id(c.getId())
                                                .name(c.getName())
                                                .type(c.getType().toString())
                                                .build())
                                .collect(Collectors.toList());

                List<SearchResponse.MessageResult> messages = messageRepository
                                .searchMessages(workspaceId, trimmedQuery).stream()
                                .map(m -> SearchResponse.MessageResult.builder()
                                                .id(m.getId())
                                                .content(m.getContent())
                                                .senderName(m.getSender().getFullName())
                                                .conversationId(m.getConversation().getId())
                                                .conversationName(m.getConversation().getName())
                                                .timestamp(m.getCreatedAt().toString())
                                                .build())
                                .collect(Collectors.toList());

                return SearchResponse.builder()
                                .users(users)
                                .channels(channels)
                                .messages(messages)
                                .build();
        }
}
