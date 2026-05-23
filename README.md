# Browser-Based Coding Sandbox

A browser-based IDE and developer sandbox built with the MERN stack, featuring a virtual filesystem, Monaco editor integration, live preview runtime, project persistence, and an extensible runtime architecture designed for future React/npm execution support.

---

# Live Demo

Add your deployed URLs here:

```txt id="1w9ft6"
Frontend: https://your-vercel-url.vercel.app

Backend: https://your-render-url.onrender.com
```

---

# Video Walkthrough

Add your walkthrough link here:

```txt id="8xj0cn"
https://your-video-link.com
```

The walkthrough covers:

* Architecture decisions
* Runtime system design
* Virtual filesystem implementation
* Live preview execution
* Persistence strategy
* AI-assisted development workflow
* Tradeoffs and future improvements

---

# Project Overview

This project implements the foundation of a browser-based coding environment where users can:

* Create, edit, rename, and delete files
* Organize files into folders
* Open multiple tabs
* Edit code using Monaco Editor
* Run projects in a live browser sandbox
* Persist projects locally and in MongoDB
* Save/load/delete projects from cloud storage
* Experience near real-time preview updates

The project intentionally prioritizes:

* deterministic runtime behavior
* fast execution
* reliability
* low-latency live preview updates

over full package ecosystem support in the MVP phase.

---

# Tech Stack

## Frontend

* React
* Monaco Editor
* Zustand (state experimentation)
* Vite
* iframe runtime sandbox

## Backend

* Node.js
* Express
* MongoDB Atlas
* Mongoose

## Deployment

* Vercel (Frontend)
* Render (Backend)
* MongoDB Atlas (Database)

---

# Core Features

## Virtual Filesystem

Implemented a browser-based virtual filesystem using React state.

Features:

* Create files
* Rename files
* Delete files
* Folder grouping
* Expand/collapse folders
* Active file switching
* Multi-tab editing
* Multi-file runtime support

---

## Monaco Editor Integration

Integrated Monaco Editor for:

* syntax highlighting
* language detection
* IDE-like editing experience

Supported languages:

* HTML
* CSS
* JavaScript

---

## Browser Runtime Sandbox

Implemented a lightweight browser-native runtime using:

* iframe
* dynamic asset injection
* srcDoc execution

Architecture:

```txt id="hynz0m"
Monaco Editor
      ↓
React State
(Virtual Filesystem)
      ↓
Runtime Manager
      ↓
iframe Runtime
      ↓
Live Preview
```

The runtime dynamically:

* injects CSS
* injects JavaScript
* assembles HTML
* updates preview in near real-time

This approach was intentionally chosen for:

* runtime stability
* deterministic execution
* rapid iteration
* lower infrastructure complexity

---

# Runtime Architecture

The project uses a modular runtime abstraction layer:

```txt id="n0ny2u"
runtime/
 ├── iframeRuntime.js
 ├── webcontainerRuntime.js
 ├── runtimeManager.js
 └── fileSystemMapper.js
```

This separation allows:

* lightweight iframe execution
* future runtime expansion
* React/npm runtime support
* progressive enhancement architecture

---

# Persistence Strategy

## Local Persistence

Implemented using:

* localStorage

Purpose:

* instant session recovery
* offline continuity
* improved UX

---

## Cloud Persistence

Implemented using:

* MongoDB Atlas
* Express REST APIs

Supported operations:

* Save project
* Load project
* Update project
* Delete project

---

# Backend Architecture

The backend exposes CRUD APIs for project management.

Stack:

* Express
* MongoDB Atlas
* Mongoose schemas

Responsibilities:

* project persistence
* project retrieval
* update operations
* deletion handling

---

# AI Usage Strategy

AI tools were heavily leveraged to accelerate implementation while maintaining full understanding of the system architecture.

Tools used:

* ChatGPT
* Cursor AI

AI-assisted areas:

* runtime architecture brainstorming
* Monaco integration patterns
* filesystem abstraction approaches
* React state structuring
* iframe sandbox strategy
* WebContainer experimentation
* debugging workflow acceleration

Examples of AI-assisted workflows:

* generating runtime abstraction ideas
* identifying browser isolation requirements
* debugging WebContainer initialization
* refining project architecture
* improving separation of concerns

Critical engineering decisions and debugging were still performed manually, especially around:

* runtime design tradeoffs
* WebContainer integration limitations
* browser sandbox behavior
* persistence architecture
* execution pipeline design

---

# Key Engineering Decisions

## Why iframe Runtime Was Chosen

Initially explored:

* Sandpack
* CodeSandbox runtime approaches

These were intentionally removed because of:

* external runtime instability
* dependency resolution failures
* runtime unpredictability
* deadline reliability concerns

The final MVP uses:

* browser-native iframe runtime

Benefits:

* deterministic execution
* lower complexity
* stable live preview behavior
* simpler debugging
* better reliability for assessment deadlines

---

# WebContainer Experimentation

A progressive WebContainer-based runtime layer was implemented experimentally to support:

* npm install
* React runtime
* Vite dev server
* package execution

Implemented:

* WebContainer booting
* filesystem mounting
* runtime orchestration
* React template generation

However, package installation inside the browser runtime encountered external CDN/network restrictions in the execution environment.

Because of this, the lightweight iframe runtime remains the primary production runtime for the MVP.

This tradeoff was intentional and documented.

---

# Current Supported Features

## Fully Supported

* HTML execution
* CSS execution
* Vanilla JavaScript execution
* Multi-file runtime injection
* Live preview
* Session persistence
* Cloud persistence
* Monaco editing
* File management

---

# Current Limitations

## Not Yet Fully Supported

* npm package installation
* React execution in production runtime
* ES module resolution
* bundling/transpilation
* Webpack/Vite execution pipeline
* terminal emulation

These are planned for future runtime phases using:

* WebContainers
* browser bundler runtime systems

---

# Future Improvements

Planned next-phase features:

* React runtime execution
* npm install support
* terminal panel
* runtime console output
* collaborative editing
* interview session support
* assessment workflow engine
* WebSocket synchronization
* runtime error overlays
* package manager integration

---

# Project Structure

```txt id="wr6nuh"
client/
 ├── src/
 │    ├── runtime/
 │    ├── services/
 │    ├── App.jsx
 │    └── main.jsx
 │
 └── package.json

server/
 ├── routes/
 ├── models/
 ├── config/
 └── server.js
```

---

# Local Setup

## Frontend

```bash id="oydb86"
cd client
npm install
npm run dev
```

## Backend

```bash id="pdjlwm"
cd server
npm install
npm run start
```

---

# Environment Variables

Server `.env`

```env id="8vjlwm"
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

---

# Evaluation Notes

This project intentionally focuses on:

* runtime reliability
* architectural clarity
* execution determinism
* scalable runtime abstraction

instead of prematurely implementing a full browser bundler ecosystem.

The system was designed incrementally:

1. stable iframe runtime
2. runtime abstraction layer
3. experimental WebContainer integration
4. future React/npm runtime expansion

This approach allowed rapid MVP delivery while maintaining a clean extensible architecture.
