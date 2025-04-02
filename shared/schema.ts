import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema (extended from original)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Game specific schemas
export const ResourceType = z.enum(['gold', 'food', 'population', 'military', 'happiness']);
export type ResourceType = z.infer<typeof ResourceType>;

// For direct value access
export const ResourceTypeValues = {
  gold: 'gold' as const,
  food: 'food' as const,
  population: 'population' as const,
  military: 'military' as const,
  happiness: 'happiness' as const
};

export const GovernmentType = z.enum(['Democracy', 'Oligarchy', 'Tyranny']);
export type GovernmentType = z.infer<typeof GovernmentType>;

// For direct value access
export const GovernmentTypeValues = {
  Democracy: 'Democracy' as const,
  Oligarchy: 'Oligarchy' as const,
  Tyranny: 'Tyranny' as const
};

export const RelationshipStatus = z.enum(['Neutral', 'Friendly', 'Allied', 'Hostile', 'War']);
export type RelationshipStatus = z.infer<typeof RelationshipStatus>;

export const EventType = z.enum(['Political', 'Military', 'Economic', 'Disaster', 'Cultural']);
export type EventType = z.infer<typeof EventType>;

export const EventSeverity = z.enum(['Positive', 'Neutral', 'Warning', 'Danger']);
export type EventSeverity = z.infer<typeof EventSeverity>;

export const PolicyCategory = z.enum(['Economic', 'Military', 'Cultural', 'Diplomatic']);
export type PolicyCategory = z.infer<typeof PolicyCategory>;

export const CityStateName = z.enum(['Athens', 'Sparta', 'Thebes', 'Corinth']);
export type CityStateName = z.infer<typeof CityStateName>;

// Interfaces for the game
export interface Resources {
  gold: number;
  food: number;
  population: number;
  military: number;
  happiness: number;
}

export interface Policy {
  id: string;
  name: string;
  description: string;
  effects: { [key in ResourceType]?: number };
  category: PolicyCategory;
  active: boolean;
}

export interface Relationship {
  cityState: CityStateName;
  status: RelationshipStatus;
  treaties: string[];
}

export interface GameEvent {
  id: string;
  turn: number;
  year: number;
  title: string;
  description: string;
  type: EventType;
  severity: EventSeverity;
  effects?: { [key in ResourceType]?: number };
  choices?: {
    text: string;
    effects: { [key in ResourceType]?: number };
  }[];
}

export interface CityState {
  id: string;
  name: CityStateName;
  government: GovernmentType;
  resources: Resources;
  location: { x: number; y: number };
  isPlayerOwned: boolean;
}

export interface GameState {
  id: string;
  userId: number;
  turn: number;
  year: number;
  playerCityState: CityState;
  otherCityStates: CityState[];
  relationships: Relationship[];
  policies: Policy[];
  events: GameEvent[];
  createdAt: Date;
  updatedAt: Date;
}

// Game state table
export const gameStates = pgTable("game_states", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  gameState: jsonb("game_state").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertGameStateSchema = createInsertSchema(gameStates).pick({
  userId: true,
  gameState: true,
});

export type InsertGameState = z.infer<typeof insertGameStateSchema>;
export type GameStateRecord = typeof gameStates.$inferSelect;
