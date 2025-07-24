import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from "@shared/schema";

const sqlite = new Database('database.sqlite');
export const db = drizzle(sqlite, { schema });

// Initialize database tables
try {
  // Create tables if they don't exist
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plate TEXT NOT NULL UNIQUE,
      model TEXT NOT NULL,
      make TEXT NOT NULL,
      year INTEGER NOT NULL,
      type TEXT NOT NULL,
      mileage INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'operational',
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS parts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      reference TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      min_stock INTEGER NOT NULL DEFAULT 5,
      unit_price INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS maintenance_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicle_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      description TEXT NOT NULL,
      cost INTEGER NOT NULL,
      duration INTEGER NOT NULL,
      technician TEXT NOT NULL,
      completed_at INTEGER,
      next_due INTEGER,
      FOREIGN KEY (vehicle_id) REFERENCES vehicles (id)
    );

    CREATE TABLE IF NOT EXISTS part_usage (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      maintenance_id INTEGER NOT NULL,
      part_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (maintenance_id) REFERENCES maintenance_records (id),
      FOREIGN KEY (part_id) REFERENCES parts (id)
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicle_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'medium',
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (vehicle_id) REFERENCES vehicles (id)
    );
  `);
  console.log('Database tables initialized');
} catch (error) {
  console.error('Error initializing database:', error);
}