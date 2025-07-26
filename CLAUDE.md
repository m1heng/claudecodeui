# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Start development server (frontend + backend):**
```bash
npm run dev
```

**Run backend server only:**
```bash
npm run server
```

**Run frontend development server only:**
```bash
npm run client
```

**Build production assets:**
```bash
npm run build
```

**Start production server (build + serve):**
```bash
npm start
```

## Architecture Overview

This is a web UI for Claude Code CLI with a React frontend and Node.js/Express backend.

### Key Components

**Backend Architecture (server/):**
- `index.js` - Express server with WebSocket support, handles API routes and Claude CLI integration
- `claude-cli.js` - Spawns and manages Claude CLI processes, handles tool permissions and session management
- `projects.js` - Manages Claude projects discovery from ~/.claude/projects/
- `routes/` - API endpoints for auth, git operations, and MCP
- `database/` - SQLite database for user authentication

**Frontend Architecture (src/):**
- `App.jsx` - Main app with session protection system to prevent UI disruptions during active conversations
- `components/ChatInterface.jsx` - Primary chat UI that communicates with Claude
- `components/Shell.jsx` - Terminal interface using xterm.js for direct CLI access
- `components/FileTree.jsx` & `CodeEditor.jsx` - File browser and editor using CodeMirror
- `utils/websocket.js` - WebSocket client for real-time communication

### Communication Flow

1. Frontend sends messages via WebSocket to backend
2. Backend spawns Claude CLI process with appropriate flags and tool permissions
3. Claude responses stream back through WebSocket to frontend
4. File system changes trigger project updates via chokidar watcher

### Tool Permission System

Tools are disabled by default for security. Frontend sends `toolsSettings` with each request:
- `allowedTools` - Array of enabled tool names
- `skipPermissions` - Boolean to auto-approve tool use
- Settings persist in localStorage

### Session Management

- Sessions tracked by project in ~/.claude/projects/*/sessions/*.jsonl
- Active sessions protected from UI updates during conversations
- Supports resuming previous sessions with `--resume` flag
- Temporary session IDs converted to real IDs after Claude creates session