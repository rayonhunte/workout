# Workout Tracker

A modern React-based workout tracking application built with Vite, Tailwind CSS, and pnpm.

## Features

- Track workouts with detailed information
- Mark workouts as completed
- View workout statistics
- Responsive mobile-first design
- Local storage persistence

## Tech Stack

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling framework
- **Headless UI** - Accessible UI components
- **React Icons** - Icon library
- **pnpm** - Package manager

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 9 (recommended to enable via Corepack)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd workout

# Enable pnpm via Corepack (recommended)
corepack enable
corepack prepare pnpm@9 --activate

# Install dependencies (pnpm is pinned in package.json)
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Run linting
pnpm lint

## UI Notes

- Dark mode is supported via Tailwind's `class` strategy. Use the sun/moon toggle in the header to switch themes. Preference persists to `localStorage`.
- Filter chips (All / Today's / Completed) help narrow the workout list.
```

## Development

This project uses:
- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) for Fast Refresh
- ESLint for code quality
- Tailwind CSS for styling
