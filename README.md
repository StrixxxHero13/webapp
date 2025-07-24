# FleetManager - Vehicle Management System

A comprehensive vehicle fleet management system built with React, Node.js, and PostgreSQL. This application helps manage vehicle fleets, track maintenance schedules, monitor parts inventory, and provides automated alerts for preventive maintenance.

## 🚗 Features

### Vehicle Management
- Track all vehicles in your fleet
- Monitor vehicle status (operational, maintenance due, in repair)
- Store detailed vehicle information (plate, model, make, year, mileage)
- Real-time status updates

### Maintenance Scheduling
- Schedule and track maintenance activities
- Complete maintenance history for each vehicle
- Cost and duration tracking
- Technician assignment
- Automated maintenance reminders

### Parts Inventory
- Comprehensive parts catalog
- Stock level monitoring
- Low stock alerts
- Part usage tracking across maintenance activities
- Cost management

### Smart Alerts
- Automated maintenance due notifications
- Overdue maintenance warnings
- Low stock alerts for parts
- Priority-based alert system

### Interactive Chat Assistant
- Ask questions about your fleet
- Get instant vehicle status updates
- Check maintenance schedules
- Query parts inventory
- Quick fleet statistics

### Dashboard Overview
- Fleet statistics at a glance
- Recent alerts and notifications
- Maintenance schedule overview
- Parts inventory summary

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Radix UI components
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Build Tools**: Vite for development and production
- **UI Framework**: shadcn/ui component library
- **State Management**: TanStack Query for server state

## 🚀 Quick Start

**Important**: This project requires some technical setup. Follow the complete guide in `SETUP_GUIDE.md` for detailed instructions.

### Prerequisites
- Node.js (LTS version)
- PostgreSQL database
- Git (optional)

### Installation
1. Download or clone this repository
2. Open the `SETUP_GUIDE.md` file
3. Follow the step-by-step instructions exactly
4. The guide covers everything from installing dependencies to running the application

## 📁 Project Structure

```
FleetManager/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── lib/           # Utilities and configurations
│   │   └── hooks/         # Custom React hooks
├── server/                # Express.js backend
│   ├── routes.ts          # API route definitions
│   ├── storage.ts         # Database operations
│   └── db.ts             # Database connection
├── shared/                # Shared TypeScript types
│   └── schema.ts          # Database schema and types
├── SETUP_GUIDE.md        # Complete setup instructions
└── package.json          # Dependencies and scripts
```

## 🎯 Usage

After setup, the application provides:

1. **Dashboard** - Overview of your entire fleet
2. **Vehicles** - Manage individual vehicles and their status
3. **Maintenance** - Schedule and track maintenance activities
4. **Parts** - Monitor inventory and stock levels
5. **History** - Complete maintenance history and reporting
6. **Chat** - Interactive assistant for quick queries

## 📊 Sample Data

The application includes sample data to demonstrate features:
- 3 sample vehicles (different makes and status)
- Parts inventory with various stock levels
- Maintenance records and history
- Active alerts and notifications

## 🔧 Configuration

The application uses environment variables for configuration. See `.env.example` for required settings:

- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV` - Environment (development/production)
- `PORT` - Application port (default: 5000)

## 📖 Documentation

- `SETUP_GUIDE.md` - Complete setup instructions for any computer
- `GITHUB_UPLOAD_GUIDE.md` - Instructions for sharing this project
- `replit.md` - Technical architecture documentation

## 🆘 Troubleshooting

Common issues and solutions are covered in the `SETUP_GUIDE.md` file. Most problems relate to:
- Database connection issues
- Missing dependencies
- Port conflicts
- Environment configuration

## 🎓 Learning Project

This project was created as a school assignment and demonstrates:
- Full-stack web development
- Database design and management
- RESTful API development
- Modern React patterns
- TypeScript usage throughout
- Professional code organization

Perfect for learning modern web development practices!

## 📄 License

This project is created for educational purposes.