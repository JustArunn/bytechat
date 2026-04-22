# ByteChat — Modern Frontend

The frontend for **ByteChat**, a high-performance, real-time Slack alternative designed for seamless team collaboration. Built with a focus on speed, aesthetics, and a premium emerald-green design system.

## ✨ Features

- **Real-time Messaging**: Instant message delivery with STOMP/WebSockets.
- **Dynamic Workspaces**: Seamlessly switch between team environments.
- **Emerald Design System**: A cohesive, dark-themed UI built with **Tailwind CSS** and **shadcn/ui**.
- **Responsive Layout**: Optimized for desktop and mobile browsers.
- **Glassmorphism**: Modern, sleek interface with blur effects and smooth transitions.
- **Notifications**: Context-aware system alerts and push notifications.

## 🛠 Tech Stack

- **Framework**: [React 19](https://reactjs.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm or yarn

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment**:
   Create a `.env` file in this directory:
   ```bash
   cp .env.example .env
   ```
   Set `VITE_API_URL` to your backend endpoint (default: `http://localhost:8080`).

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

## 🏗 Project Structure

- `src/features`: Modular, domain-specific logic (Auth, Chat, Workspaces).
- `src/components/ui`: Base UI components from shadcn/ui.
- `src/hooks`: Shared global hooks.
- `src/lib`: Third-party library initializations (Axios, StompJS).
- `src/store`: Global Redux state configuration.
