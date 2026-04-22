# 🚀 ByteChat Backend - Spring Boot

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.13-31c653)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-21-2ea44f)](https://www.oracle.com/java/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-latest-44cc11)](https://www.postgresql.org/)
[![JWT](https://img.shields.io/badge/JWT-Secure-success)](https://jwt.io/)
[![WebSocket](https://img.shields.io/badge/WebSocket-Real--time-brightgreen)](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)

A powerful, production-ready backend for ByteChat built with Spring Boot. This application provides a robust API for real-time messaging, workspace management, and user notifications.

---

## 🌟 Comprehensive Feature Roadmap

### 💬 Messaging & Communication

- **Real-time Messaging**: Instant message delivery using WebSockets (STOMP).
- **Threads & Replies**: Keep conversations organized with message threading.
- **Rich Text Formatting**: Support for markdown, code blocks, and styled text.
- **Emoji Ecosystem**: React to messages with emojis and support for custom emojis.
- **Mentions & Alerts**: Notify specific users or groups using <code style="color: #2ea44f;">@username</code>, <code style="color: #2ea44f;">@here</code>, or <code style="color: #2ea44f;">@channel</code>.
- **Message Management**: Edit, delete, pin, and save (bookmark) important messages.
- **Drafts**: Automatically save unsent messages for later.

### 🏢 Workspace & Organization

- **Multi-Workspace Support**: Seamlessly switch between different organizations.
- **Channels**: Organize by topic with Public, Private, and Archived channels.
- **Direct Messages**: One-on-one and multi-person group conversations.
- **Workspace Browser**: Easily find and join public channels within your workspace.
- **User Roles**: Granular permissions for Owners, Admins, Members, and Guests.
- **Invitations**: Invite new members via secure email links or unique join codes.

### 🤝 Collaboration & Files

- **File Sharing**: Upload, preview, and share documents, images, and videos.
- **File Browser**: Centralized view of all files shared within a workspace or channel.
- **Shared Canvases**: Collaborate on internal documents and notes (Planned).
- **Audio/Video Clips**: Send quick voice or video messages to your team.
- **Huddles**: Instant, lightweight audio/video calls for quick syncs.

### 🔍 Search & Discovery

- **Global Search**: Advanced search for messages, files, and people across the workspace.
- **Search Filters**: Narrow down results using <code style="color: #2ea44f;">from:</code>, <code style="color: #2ea44f;">in:</code>, <code style="color: #2ea44f;">has:link</code>, and date filters.
- **Member Directory**: Browse and search for team members and their profiles.

### ⚙️ Personalization & Settings

- **Custom Profiles**: Detailed user profiles with status, timezone, and contact info.
- **Presence Tracking**: Real-time "Online", "Away", and "Do Not Disturb" states.
- **Granular Notifications**: Customize alerts per channel, keyword, or schedule.
- **Dark Mode**: A beautiful, high-contrast dark interface (Standard).
- **Internal Slash Commands**: Speed up workflows with <code style="color: #2ea44f;">/remind</code>, <code style="color: #2ea44f;">/invite</code>, and <code style="color: #2ea44f;">/mute</code>.
- **User Groups**: Create custom sub-groups for team-wide mentions (e.g., <code style="color: #2ea44f;">@dev-team</code>).
- **Reminders**: Schedule personal or channel-wide alerts for important tasks.

### 🌐 Multi-Tenancy & Subdomains

- **Subdomain Identification**: Workspaces are identified by a unique <code style="color: #2ea44f;">slug</code> (e.g., <code style="color: #2ea44f;">cloud.bytechat.app</code>).
- **Dynamic Routing**: The backend automatically resolves the workspace context from the <code style="color: #2ea44f;">Host</code> header.
- **Simplified URLs**: No need to pass <code style="color: #2ea44f;">workspaceId</code> in every API request; the tenant is resolved implicitly.
- **Local Development**: Supports <code style="color: #2ea44f;">*.localhost</code> for local multi-tenant testing.

> **Note**: This roadmap focuses exclusively on core ByteChat functionality and internal features. External 3rd-party app integrations are not included in the current implementation plan.

---

## 🛠 Tech Stack

- **Core Framework**: Spring Boot 3.5.13
- **Language**: Java 21
- **Database**: PostgreSQL (JPA/Hibernate)
- **Security**: Spring Security & JWT (Json Web Token)
- **Real-time**: Spring WebSocket with STOMP
- **Data Handling**: Lombok, Jakarta Validation
- **Build Tool**: Maven

---

## 🛰 API Documentation

### 🔐 Authentication (<code style="color: #2ea44f;">/api/auth</code>)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| <code style="color: #2ea44f;">POST</code> | <code style="color: #2ea44f;">/register</code> | Register a new user |
| <code style="color: #2ea44f;">POST</code> | <code style="color: #2ea44f;">/login</code> | Login and receive JWT cookie |
| <code style="color: #2ea44f;">POST</code> | <code style="color: #2ea44f;">/logout</code> | Clear session and cookies |
| <code style="color: #2ea44f;">GET</code> | <code style="color: #2ea44f;">/me</code> | Get current authenticated user details |

### 🏢 Workspaces (<code style="color: #2ea44f;">/api/workspaces</code>)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| <code style="color: #2ea44f;">POST</code> | <code style="color: #2ea44f;">/</code> | Create a new workspace |
| <code style="color: #2ea44f;">GET</code> | <code style="color: #2ea44f;">/</code> | List all workspaces for the current user |
| <code style="color: #2ea44f;">GET</code> | <code style="color: #2ea44f;">/{id}</code> | Get workspace details by ID |
| <code style="color: #2ea44f;">POST</code> | <code style="color: #2ea44f;">/{id}/invite</code> | Invite a user via email |
| <code style="color: #2ea44f;">POST</code> | <code style="color: #2ea44f;">/join/{joinCode}</code> | Join a workspace using a code |
| <code style="color: #2ea44f;">GET</code> | <code style="color: #2ea44f;">/{id}/members</code> | List all members of a workspace |
| <code style="color: #2ea44f;">POST</code> | <code style="color: #2ea44f;">/{id}/co-admins/{userId}</code> | Promote a member to co-admin |

### 💬 Conversations (<code style="color: #2ea44f;">/api/conversations</code>)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| <code style="color: #2ea44f;">POST</code> | <code style="color: #2ea44f;">/</code> | Create a new channel |
| <code style="color: #2ea44f;">GET</code> | <code style="color: #2ea44f;">/workspace/{workspaceId}</code>| List all channels in a workspace |
| <code style="color: #2ea44f;">POST</code> | <code style="color: #2ea44f;">/direct</code> | Get or create a DM with another user |
| <code style="color: #2ea44f;">POST</code> | <code style="color: #2ea44f;">/{id}/hide</code> | Hide a conversation from the sidebar |
| <code style="color: #2ea44f;">DELETE</code> | <code style="color: #2ea44f;">/{id}</code> | Delete a channel |

### ✉️ Messages (<code style="color: #2ea44f;">/api/messages</code>)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| <code style="color: #2ea44f;">POST</code> | <code style="color: #2ea44f;">/</code> | Send a text message |
| <code style="color: #2ea44f;">POST</code> | <code style="color: #2ea44f;">/upload</code> | Send a message with file attachments |
| <code style="color: #2ea44f;">GET</code> | <code style="color: #2ea44f;">/conversation/{id}</code> | Get paginated message history |
| <code style="color: #2ea44f;">PUT</code> | <code style="color: #2ea44f;">/{id}</code> | Edit a message |
| <code style="color: #2ea44f;">DELETE</code> | <code style="color: #2ea44f;">/{id}</code> | Delete a message |
| <code style="color: #2ea44f;">POST</code> | <code style="color: #2ea44f;">/{id}/react</code> | Toggle an emoji reaction |

### 🔔 Notifications (<code style="color: #2ea44f;">/api/notifications</code>)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| <code style="color: #2ea44f;">GET</code> | <code style="color: #2ea44f;">/</code> | Get all user notifications |
| <code style="color: #2ea44f;">PUT</code> | <code style="color: #2ea44f;">/{id}/read</code> | Mark a specific notification as read |
| <code style="color: #2ea44f;">PUT</code> | <code style="color: #2ea44f;">/read-all</code> | Mark all notifications as read |
| <code style="color: #2ea44f;">DELETE</code> | <code style="color: #2ea44f;">/clear-all</code> | Clear all notification history |

---

## 🚀 Getting Started

### Prerequisites

- JDK 21
- PostgreSQL
- Maven

### Installation

1. Clone the repository
2. Configure <code style="color: #2ea44f;">src/main/resources/application.properties</code> with your PostgreSQL credentials:

   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/bytechat_db
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```

3. Run the application:

   ```bash
   mvn spring-boot:run
   ```

### WebSocket Endpoint

The WebSocket connection is available at <code style="color: #2ea44f;">/ws</code>. Use STOMP client to connect and subscribe to:

- <code style="color: #2ea44f;">/topic/messages/{conversationId}</code> for real-time messages.
- <code style="color: #2ea44f;">/topic/notifications/{userId}</code> for real-time alerts.

---

## 📁 Project Structure

```text
src/main/java/com/bytechat/
├── config/       # WebSocket, JPA, and Web Security configs
├── controller/   # REST API Controllers
├── dto/          # Data Transfer Objects (Requests/Responses)
├── model/        # JPA Entities (User, Message, Workspace, etc.)
├── repository/   # Spring Data JPA Repositories
├── security/     # JWT and Custom UserDetailsService
└── service/      # Business Logic Layer
```

---

## 📝 License

This project is for educational purposes as a part of the Slack Clone project.
