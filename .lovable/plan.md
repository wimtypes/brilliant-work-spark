
# Kanban Board with AI Assistant

## Overview
A sleek, modern Kanban board with two columns (To-Do, In Progress), rich task cards, an integrated AI chatbot that can create tasks and provide productivity insights, and database persistence so you can come back anytime.

## Design Style
Inspired by your reference images — clean white cards with subtle shadows, colored category tags, a sidebar layout, and smooth drag-and-drop interactions. Modern, spacious, and professional.

---

## Features

### 1. Kanban Board
- **Two columns**: To-Do and In Progress
- **Drag and drop**: Move tasks between columns with smooth animations
- **Add Task button**: Quick-add tasks with a modal form
- **Column task counts**: Badge showing number of tasks per column

### 2. Rich Task Cards
Each card displays:
- **Title & Description**
- **Category tag** (colored badge, e.g. "Design", "Development", "Marketing")
- **Due date** with calendar icon
- **Time estimate** (e.g. "3h", "5h")
- Edit and delete actions via a dropdown menu

### 3. AI Chatbot (Sidebar Panel)
- Slide-out chat panel accessible from the main UI
- **Create tasks from chat**: Tell the AI "Add a task to design the homepage by Friday" and it creates it on the board
- **Productivity insights**: Ask "What's my workload?" or "Summarize my board" and get smart summaries
- Powered by Lovable AI (Gemini) via a Supabase edge function
- Streaming responses for a responsive feel

### 4. Database Persistence (Lovable Cloud + Supabase)
- Tasks stored in a Supabase database table
- Auto-saves when you add, edit, move, or delete tasks
- Data loads automatically when you return to the app
- No login required — single-user setup

### 5. Layout & Navigation
- Clean sidebar with app branding
- Top bar with board title
- Responsive design that works on desktop and tablet
