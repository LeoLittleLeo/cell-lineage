import { primaryKey, sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const days = sqliteTable("days", {
  userId: text("user_id").notNull(),
  date: text("date").notNull(),
  payload: text("payload").notNull(),
  updatedAt: integer("updated_at").notNull(),
}, (table) => [primaryKey({ columns: [table.userId, table.date] })]);

export const plans = sqliteTable("plans", {
  userId: text("user_id").notNull(),
  date: text("date").notNull(),
  payload: text("payload").notNull(),
  updatedAt: integer("updated_at").notNull(),
}, (table) => [primaryKey({ columns: [table.userId, table.date] })]);

export const mutations = sqliteTable("mutations", {
  userId: text("user_id").notNull(),
  weekKey: text("week_key").notNull(),
  count: integer("count").notNull().default(0),
  updatedAt: integer("updated_at").notNull(),
}, (table) => [primaryKey({ columns: [table.userId, table.weekKey] })]);

export const userProfiles = sqliteTable("user_profiles", {
  userId: text("user_id").primaryKey(),
  currentDate: text("current_date").notNull(),
  preferences: text("preferences").notNull(),
  stateVersion: integer("state_version").notNull().default(2),
  updatedAt: integer("updated_at").notNull(),
});
