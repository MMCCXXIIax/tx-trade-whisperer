import { pgTable, varchar, text, timestamp, boolean, integer, real, serial, json } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
// App state table for storing configuration
export const appState = pgTable('app_state', {
    key: varchar('key').primaryKey(),
    value: json('value'),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});
// Detections table for pattern detection data
export const detections = pgTable('detections', {
    id: varchar('id').primaryKey().default(sql `gen_random_uuid()`),
    symbol: varchar('symbol').notNull(),
    pattern: varchar('pattern').notNull(),
    timestamp: timestamp('timestamp').defaultNow().notNull(),
    confidence: real('confidence'),
    price: real('price'),
    outcome: varchar('outcome'),
    verified: boolean('verified').default(false).notNull()
});
// Error logs table
export const errorLogs = pgTable('error_logs', {
    id: serial('id').primaryKey(),
    source: varchar('source').notNull(),
    message: text('message'),
    createdAt: timestamp('created_at').defaultNow().notNull()
});
// Portfolio table
export const portfolio = pgTable('portfolio', {
    id: varchar('id').primaryKey().default(sql `gen_random_uuid()`),
    userId: varchar('user_id').notNull(),
    asset: varchar('asset').notNull(),
    quantity: real('quantity').default(0).notNull(),
    avgPrice: real('avg_price'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});
// Profiles table
export const profiles = pgTable('profiles', {
    id: varchar('id').primaryKey(),
    username: varchar('username').notNull(),
    fullName: varchar('full_name'),
    name: varchar('name'),
    email: varchar('email'),
    avatarUrl: varchar('avatar_url'),
    isPublic: boolean('is_public').default(false).notNull(),
    mode: varchar('mode'),
    updatedAt: timestamp('updated_at').defaultNow()
});
// Security audit log table
export const securityAuditLog = pgTable('security_audit_log', {
    id: varchar('id').primaryKey().default(sql `gen_random_uuid()`),
    userId: varchar('user_id'),
    action: varchar('action').notNull(),
    tableName: varchar('table_name'),
    recordId: varchar('record_id'),
    ipHash: varchar('ip_hash'),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at').defaultNow()
});
// Users table
export const users = pgTable('users', {
    id: varchar('id').primaryKey(),
    createdAt: timestamp('created_at').defaultNow()
});
// Visitors table
export const visitors = pgTable('visitors', {
    id: varchar('id').primaryKey(),
    ip: varchar('ip'),
    ipHash: varchar('ip_hash'),
    userAgent: text('user_agent'),
    firstSeen: timestamp('first_seen').defaultNow().notNull(),
    lastSeen: timestamp('last_seen').defaultNow().notNull(),
    visitCount: integer('visit_count').default(1).notNull(),
    refreshInterval: integer('refresh_interval').default(30).notNull(),
    email: varchar('email'),
    name: varchar('name'),
    mode: varchar('mode')
});
