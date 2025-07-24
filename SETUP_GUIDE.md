# FleetManager - Complete Setup Guide

This guide will help you set up the FleetManager vehicle management system on your computer from scratch. Follow each step carefully, and you'll have a working application at the end.

## What You'll Get

After following this guide, you'll have:
- A complete vehicle management system running on your computer
- A modern web interface to manage vehicles, parts, and maintenance
- Intelligent vehicle status validation system
- Advanced search and filtering capabilities  
- A chat assistant to help with fleet management
- A local database with sample data to get started

## Prerequisites

You need to have basic knowledge of:
- How to open a terminal/command prompt
- How to copy and paste commands
- How to download files from the internet

## Step 1: Install Node.js

Node.js is the runtime that powers this application.

### For Windows:
1. Go to https://nodejs.org/
2. Download the "LTS" version (recommended for most users)
3. Run the installer and follow the setup wizard
4. Accept all default options

### For Mac:
1. Go to https://nodejs.org/
2. Download the "LTS" version for macOS
3. Open the downloaded .pkg file and follow the installer
4. Accept all default options

### For Linux:
Open terminal and run:
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Verify Installation:
Open terminal/command prompt and type:
```bash
node --version
npm --version
```

You should see version numbers for both commands.

## Step 2: Install PostgreSQL Database

PostgreSQL is the database system that stores all your vehicle data.

### For Windows:
1. Go to https://www.postgresql.org/download/windows/
2. Download the installer for Windows
3. Run the installer
4. **IMPORTANT**: Remember the password you set for the "postgres" user
5. Accept default port (5432)
6. Accept default data directory
7. Complete the installation

### For Mac:
1. Go to https://postgresapp.com/
2. Download Postgres.app
3. Move it to Applications folder
4. Open Postgres.app
5. Click "Initialize" to create a new server

**Alternative for Mac using Homebrew:**
```bash
brew install postgresql
brew services start postgresql
```

### For Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Set Up Database:
After installation, open terminal and run:

**Windows:**
```bash
# Open psql (you'll be prompted for the password you set)
psql -U postgres -h localhost
```

**Mac/Linux:**
```bash
# Connect to PostgreSQL
sudo -u postgres psql
```

Once in PostgreSQL, run these commands:
```sql
-- Create a database for the application
CREATE DATABASE fleetmanager;

-- Create a user for the application
CREATE USER fleetuser WITH PASSWORD 'fleetpass123';

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE fleetmanager TO fleetuser;

-- Exit PostgreSQL
\q
```

## Step 3: Download the Project

You have two options:

### Option A: Download ZIP (Easier)
1. Go to your project's GitHub page
2. Click the green "Code" button
3. Select "Download ZIP"
4. Extract the ZIP file to a folder (e.g., Desktop/FleetManager)

### Option B: Clone with Git
If you have Git installed:
```bash
git clone [YOUR_PROJECT_URL]
cd [PROJECT_FOLDER_NAME]
```

## Step 4: Configure the Application

1. Open terminal/command prompt
2. Navigate to your project folder:
```bash
cd path/to/your/FleetManager/folder
```

3. Create a configuration file by copying the example:
```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

4. Open the `.env` file in a text editor and add:
```
DATABASE_URL=postgresql://fleetuser:fleetpass123@localhost:5432/fleetmanager
NODE_ENV=development
PORT=5000
```

**Note**: If you used different credentials in Step 2, update the DATABASE_URL accordingly.

## Step 5: Install Project Dependencies

In your terminal, make sure you're in the project folder and run:

```bash
npm install
```

This will download all the necessary packages. It might take a few minutes.

## Step 6: Set Up the Database Tables

Run this command to create all the necessary tables:

```bash
npm run db:push
```

You should see a success message saying "Changes applied".

## Step 7: Start the Application

Now you can start the application:

```bash
npm run dev
```

You should see messages like:
```
serving on port 5000
```

## Step 8: Access the Application

1. Open your web browser
2. Go to: http://localhost:5000
3. You should see the FleetManager dashboard

## What You Can Do

The application includes:

### Dashboard
- Overview of all vehicles and their status
- Recent maintenance alerts
- Parts inventory summary

### Vehicles Section
- View all vehicles in your fleet
- Add new vehicles
- Update vehicle information
- Track vehicle status (operational, maintenance due, in repair)

### Maintenance Section
- Schedule maintenance for vehicles
- View maintenance history
- Track costs and duration
- Assign technicians

### Parts Inventory
- Manage spare parts stock
- Track low stock items
- Add new parts to inventory
- Monitor part usage

### Validation System
- Intelligent vehicle status assessment
- Task-list interface - validated vehicles disappear
- Comprehensive status analysis based on maintenance history
- Bulk validation operations

### Chat Assistant
- Ask questions about your fleet
- Get quick vehicle status updates
- Check maintenance alerts
- Inquire about parts inventory
- Intelligent fallback responses

## Sample Data

The application comes with sample data:
- 3 sample vehicles (Renault Master, Peugeot Partner, Ford Transit)
- Parts inventory with different stock levels
- Maintenance records and alerts

## Troubleshooting

### "Database connection failed"
- Make sure PostgreSQL is running
- Check your DATABASE_URL in the .env file
- Verify your database credentials

### "Port 5000 is already in use"
- Change the PORT in your .env file to a different number (e.g., 3000)
- Or stop any other applications using port 5000

### "npm command not found"
- Make sure Node.js is properly installed
- Restart your terminal
- Try: `node --version` to verify installation

### Application won't start
- Make sure you're in the correct project folder
- Try: `npm install` again
- Check for any error messages

### Database tables don't exist
- Run: `npm run db:push` again
- Make sure your database connection is working

## Getting Help

If you encounter any issues:
1. Check the troubleshooting section above
2. Make sure all prerequisites are properly installed
3. Verify all commands were run in the correct order
4. Check that the database is running and accessible

## Stopping the Application

To stop the application:
- Press `Ctrl + C` in the terminal where it's running

To restart:
- Run `npm run dev` again

## Next Steps

Once everything is working:
1. Clear the sample data and add your own vehicles
2. Set up your parts inventory
3. Start scheduling maintenance for your fleet
4. Explore the chat assistant features

Your FleetManager is now ready to use!