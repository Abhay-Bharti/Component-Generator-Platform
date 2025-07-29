# Component Structure

This directory contains modular React components for the ComponentGenerator application.

## Component Overview

### Core Components
- **Nav.tsx** - Global navigation bar with authentication status
- **Loader.tsx** - Custom loading component with "Coder" animation

### Modular Components

#### Sidebar
- **Sidebar/Sidebar.tsx** - Collapsible sidebar with user info, navigation, search, and session list
- Features:
  - Expand/collapse functionality
  - User profile and logout
  - Navigation links (Home, Dashboard, New Chat)
  - Session search and filtering
  - Session list with click handlers

#### ChatPanel
- **ChatPanel/ChatPanel.tsx** - AI chat interface for session pages
- Features:
  - Chat message display with user/AI avatars
  - Message deletion (individual and clear all)
  - Input form with send functionality
  - Auto-scroll to latest message
  - Loading states and saving indicators

#### LivePreview
- **LivePreview/LivePreview.tsx** - Live React component preview
- Features:
  - React-live integration for real-time preview
  - Error display for invalid code
  - Responsive preview container

#### CodeEditor
- **CodeEditor/CodeEditor.tsx** - Code editing and export interface
- Features:
  - JSX/TSX and CSS textarea editors
  - Copy to clipboard functionality
  - Clear code buttons for each editor
  - Download as ZIP file
  - Toast notifications for user feedback

## Usage

### Importing Components
```tsx
// Individual imports
import Sidebar from '../components/Sidebar/Sidebar';
import ChatPanel from '../components/ChatPanel/ChatPanel';

// Or use the index file
import { Sidebar, ChatPanel, CodeEditor } from '../components';
```

### Component Props

#### Sidebar
```tsx
interface SidebarProps {
  user: { email: string } | null;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  search: string;
  setSearch: (s: string) => void;
  sessions: Session[];
  onSessionClick: (id: string) => void;
  onLogout: () => void;
  onNewChat: () => void;
}
```

#### ChatPanel
```tsx
interface ChatPanelProps {
  chat: ChatMessage[];
  input: string;
  setInput: (input: string) => void;
  onSend: (e: React.FormEvent) => void;
  onDeleteMessage: (index: number) => void;
  onClearChat: () => void;
  sending: boolean;
  aiLoading: boolean;
  saving: boolean;
}
```

#### CodeEditor
```tsx
interface CodeEditorProps {
  code: { jsx: string; css: string };
  setCode: (code: { jsx: string; css: string }) => void;
}
```

## Benefits of Modular Structure

1. **Reusability** - Components can be used across different pages
2. **Maintainability** - Easier to update and debug individual components
3. **Testability** - Components can be tested in isolation
4. **Scalability** - New features can be added without affecting existing components
5. **Code Organization** - Clear separation of concerns and responsibilities

## Future Enhancements

- Add TypeScript interfaces for all component props
- Implement component testing with Jest/React Testing Library
- Add accessibility improvements (ARIA labels, keyboard navigation)
- Create additional utility components (modals, tooltips, etc.) 