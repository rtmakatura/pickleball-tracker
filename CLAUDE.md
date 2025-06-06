# Pickleball Tracker - Claude Configuration

## Project Overview
This is a React-based pickleball tournament and league tracking platform with Firebase backend. The main application is in `src/App.js` with custom CSS utility classes in `src/index.css`.

## Architecture
- **Frontend**: React 18 with functional components and hooks
- **Backend**: Firebase Firestore for data persistence  
- **Styling**: Custom CSS utility classes (similar to Tailwind)
- **Icons**: Lucide React
- **Deployment**: GitHub Pages via GitHub Actions

## Code Standards

### React Patterns
- Use functional components with hooks (useState, useEffect)
- Keep components in App.js unless they become very large (500+ lines)
- Use descriptive state variable names
- Handle loading states and errors gracefully
- Prevent background scrolling when modals are open

### State Management
- Use local state for UI interactions
- Sync all data changes with Firebase immediately
- Use optimistic updates where appropriate
- Handle Firebase errors with user-friendly messages

### Styling Guidelines
- Use existing utility classes from `src/index.css`
- Follow the established color scheme (blue, emerald, purple, amber, gray)
- Maintain consistent spacing and border radius
- Use hover effects and transitions for interactive elements
- Mobile-first responsive design

### Data Structure
- Members: name, email, phone, skillLevel, venmo, notes
- Events (tournaments/leagues): name, location, dates, fees, team members, status
- Team members include payment tracking and role information
- Use proper Firebase Firestore patterns

### UI/UX Principles
- Clean, professional design with subtle gradients
- Clear visual hierarchy with proper spacing
- Accessible with good contrast ratios
- Loading states for async operations
- Confirmation dialogs for destructive actions
- Search functionality with debounced input

## Current Features
- Dashboard with metrics and upcoming events
- Tournament and league management
- Member management with contact info
- Payment tracking (pending, paid direct, paid coordinator)
- Results tracking with placing and notes
- Search functionality across all data

## When Making Changes
1. Make targeted, minimal changes to existing code
2. Preserve existing functionality unless specifically changing it
3. Follow established patterns and naming conventions
4. Test Firebase operations carefully
5. Maintain the existing visual design system
6. Add proper error handling for new features

## File Structure
- `src/App.js` - Main application component
- `src/index.css` - Utility classes and global styles
- `src/firebase.js` - Firebase configuration
- `public/index.html` - HTML template
- `.github/workflows/deploy.yml` - Deployment workflow

# Design System Update

## Visual Design Direction
We're implementing a modern, polished design with depth and visual hierarchy while maintaining professionalism.

### Color Palette (Updated)
- **Primary Blues**: #1e40af (blue-800), #3b82f6 (blue-500), #dbeafe (blue-100)
- **Success Greens**: #059669 (emerald-600), #10b981 (emerald-500), #d1fae5 (emerald-100)
- **Warning Ambers**: #d97706 (amber-600), #f59e0b (amber-500), #fef3c7 (amber-100)
- **Accent Purples**: #9333ea (purple-600), #a855f7 (purple-500), #f3e8ff (purple-100)
- **Neutrals**: #1f2937 (gray-800), #6b7280 (gray-500), #f9fafb (gray-50)

### Design Principles
- **Depth**: Use subtle shadows and gradients for layering
- **Contrast**: Ensure clear visual hierarchy with proper contrast ratios
- **Modern**: Clean, contemporary styling with subtle animations
- **Consistent**: Maintain design patterns across all components
- **Accessible**: Colors meet WCAG contrast requirements

### Component Styling Guidelines

#### Cards & Containers
- Use `box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`
- Subtle border radius: 12px for cards, 8px for buttons
- Gradient backgrounds where appropriate
- Colored accent borders (left border: 4px solid [accent-color])

#### Typography
- Use font weight hierarchy (400, 500, 600, 700)
- Proper spacing with margin-bottom for readability
- Color hierarchy: gray-900 for primary, gray-600 for secondary

#### Interactive Elements
- Hover transitions: `transition: all 0.2s ease-in-out`
- Active states with subtle shadows and color shifts
- Icons with colored circular backgrounds
- Button hover effects with deeper shadows

#### Header & Navigation
- Subtle gradient backgrounds
- Enhanced logo with soft glow effects
- Navigation tabs with distinct active states and hover effects
- Improved visual hierarchy with shadows and spacing
