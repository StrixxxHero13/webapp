# FleetManager - Vehicle Management System

## Overview

FleetManager is a comprehensive vehicle management system designed for managing fleet vehicles, their maintenance, parts inventory, and generating alerts for preventive maintenance. The application features a modern web interface with an integrated chatbot assistant to help users manage their fleet operations efficiently.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with CSS variables for theming
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Build Tool**: Vite for development and bundling

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with JSON responses
- **Development**: Hot reload with Vite middleware integration
- **Error Handling**: Centralized error handling middleware

### Database Architecture
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: PostgreSQL (configured for Neon serverless)
- **Schema Management**: Drizzle migrations with schema versioning
- **Connection**: @neondatabase/serverless for serverless PostgreSQL

## Key Components

### Database Schema
- **Vehicles**: Core entity storing vehicle information (plate, model, make, year, type, mileage, status)
- **Parts**: Inventory management for spare parts with stock tracking
- **Maintenance Records**: Complete history of all maintenance activities
- **Part Usage**: Junction table linking parts to maintenance records
- **Alerts**: Automated alerts for maintenance scheduling and overdue items

### Frontend Pages
- **Dashboard**: Overview with statistics, recent alerts, and quick actions
- **Vehicles**: Vehicle fleet management with status tracking
- **Maintenance**: Maintenance scheduling and history management
- **Parts**: Inventory management with stock level monitoring
- **History**: Complete maintenance history with filtering capabilities
- **Validation**: Comprehensive vehicle status validation with detailed reporting and controls

### Chat Integration
- **Chat Page**: Integrated chat interface as a main navigation page
- **API Integration**: Connected to backend for real-time fleet data queries
- **Quick Actions**: Predefined actions for common fleet management tasks
- **Interactive Assistant**: Full-page chat interface with message history

## Data Flow

1. **User Interaction**: Users interact through React components
2. **API Calls**: TanStack Query manages API requests to Express backend
3. **Database Operations**: Drizzle ORM handles PostgreSQL operations
4. **Real-time Updates**: Query invalidation ensures fresh data display
5. **Chat Integration**: Chatbot queries fleet data through dedicated API endpoints

## External Dependencies

### UI Components
- Radix UI primitives for accessible components
- Lucide React for consistent iconography
- React Hook Form with Zod validation for form handling

### Backend Services
- PostgreSQL database (Neon serverless)
- Express.js for API routing
- Drizzle ORM for database operations

### Development Tools
- Vite for development server and bundling
- ESBuild for production builds
- TypeScript for type safety
- Tailwind CSS for styling

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds React app to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Database**: Drizzle migrations handle schema deployment

### Environment Configuration
- Database connection via `DATABASE_URL` environment variable
- Production/development mode switching via `NODE_ENV`
- Replit-specific optimizations for development environment

### Hosting Requirements
- Node.js runtime environment
- PostgreSQL database instance
- Static file serving capability for frontend assets
- Environment variable support for configuration

The system is designed as a monorepo with shared TypeScript definitions, ensuring type safety across the full stack while maintaining clear separation between frontend and backend concerns.

## Project Status: COMPLETED & REFINED ✅

**Date**: January 24, 2025

All requested functionality has been implemented, tested, and refined:

### Completed Features
- ✅ **Planifier Button**: Schedules maintenance and marks alerts as read
- ✅ **Enhanced Search System**: Intelligent vehicle search with navigation, detailed results, and clear visual cues
- ✅ **History Filtering**: Complete filtering system by vehicle, maintenance type, and date ranges
- ✅ **Voir Détails**: Comprehensive vehicle details modal with maintenance history, alerts, and statistics
- ✅ **Réinitialiser**: Reset filters functionality in history page
- ✅ **Notification System**: Full notification dropdown with priority badges and mark-as-read functionality
- ✅ **Enhanced AI Chat**: Intelligent fallback responses for better user experience
- ✅ **Vehicle Status Validation**: Intelligent system that automatically validates vehicle operational status
- ✅ **Full Validation Page**: Dedicated validation section with detailed status reporting and bulk operations
- ✅ **TypeScript Compliance**: All LSP errors resolved, full type safety

### Technical Implementation
- Modern React 18 with TypeScript
- PostgreSQL database with Drizzle ORM
- Responsive design with Tailwind CSS
- Real-time data updates with TanStack Query
- Accessible UI components with Radix UI
- Comprehensive error handling and loading states
- Intelligent vehicle status validation system
- Advanced API endpoints for status validation
- Clean, streamlined header interface
- Task-list validation behavior
- Enhanced search with clear navigation
- Professional documentation and setup guides

### Final Refinements (January 24, 2025)
- ✅ **LSP Compliance**: All TypeScript errors resolved across the codebase
- ✅ **Interface Cleanup**: Removed unnecessary user profile from header
- ✅ **Enhanced Documentation**: Updated README.md and SETUP_GUIDE.md with latest features
- ✅ **Validation System**: Fixed to properly update database and provide task-list behavior
- ✅ **Build Verification**: Application builds successfully without errors
- ✅ **Database Integration**: Confirmed proper data flow and recent maintenance records

The FleetManager system is now production-ready with all core functionality implemented, thoroughly tested, and comprehensively refined.