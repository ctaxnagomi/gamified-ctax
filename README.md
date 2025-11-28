# Gamified CTAX Dashboard

## Overview

This project is a high-performance, gamified dashboard application built with React, TypeScript, and Vite. It features a unique circular navigation system, multiple immersive themes, and an integrated AI agent named Leandros. The application demonstrates advanced frontend techniques including 3D transitions, spatial awareness integration, and dynamic state management.

## Features

### Leandros AI Agent

The application includes a sophisticated AI agent, Leandros, which serves as the primary authentication and interaction interface.

- **Spatial Awareness**: Utilizes screen capture technology to provide the agent with visual context of the user's interface.
- **Voice Interaction**: Features continuous speech recognition and text-to-speech capabilities with a British male voice profile.
- **Client-Side Validation**: Implements secure, instant password validation logic with failure tracking and heresy protocols.
- **Interruptibility**: The agent supports full interruptibility, allowing users to cut off speech output by speaking.

### Dynamic Themes

The dashboard supports five distinct themes, each with unique visual styles and accompanying audio tracks:

1. **Default**: Standard modern interface.
2. **Doodle**: Hand-drawn aesthetic with pencil grid backgrounds.
3. **Console**: High-contrast terminal style with CRT scanline effects.
4. **Retro**: Neon-infused synthwave aesthetic with VHS bleed effects.
5. **Lofi**: Cozy, warm atmosphere with a study room background and chillhop audio.

### Core Modules

- **Dashboard**: System status and objective tracking.
- **Jobs**: Marketplace for contracts and bounties.
- **Quests**: Daily and weekly challenges.
- **Leaderboard**: Global rankings and competitive metrics.
- **Profile**: User configuration and skill tree management.
- **Map**: Geospatial visualization of nodes.

## Technical Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom configuration
- **AI Integration**: Google Gemini API
- **Audio**: Web Speech API and SoundCloud Widget API
- **Utilities**: html2canvas for screen capture, lucide-react for iconography

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env.local` file in the root directory and add your Gemini API key:

   ```env
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

4. **Development Server**
   Start the local development server:

   ```bash
   npm run dev
   ```

5. **Production Build**
   Build the application for production:

   ```bash
   npm run build
   ```

## Architecture

The application follows a modular architecture with a clear separation of concerns:

- `components/`: Reusable UI components (CircularNav, SchematicSidebar, LeandrosWelcome).
- `views/`: Feature-specific view components (Dashboard, Jobs, Quests).
- `types/`: TypeScript definitions for type safety.
- `public/`: Static assets including theme backgrounds.

## License

Proprietary software. All rights reserved.
