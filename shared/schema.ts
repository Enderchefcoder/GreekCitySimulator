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

// Define string literal type for government types
export type GovernmentType = 'Democracy' | 'Oligarchy' | 'Tyranny';

// Create Zod validator for GovernmentType
export const GovernmentTypeSchema = z.enum(['Democracy', 'Oligarchy', 'Tyranny']);

// For direct value access
export const GovernmentTypeValues = {
  Democracy: 'Democracy' as GovernmentType,
  Oligarchy: 'Oligarchy' as GovernmentType,
  Tyranny: 'Tyranny' as GovernmentType
};

// Not exporting this relationship status, only using it locally
type RelationshipStatusType = 'Neutral' | 'Friendly' | 'Allied' | 'Hostile' | 'War';
export const RelationshipStatusSchema = z.enum(['Neutral', 'Friendly', 'Allied', 'Hostile', 'War']);
export const RelationshipStatusValues = {
  Neutral: 'Neutral',
  Friendly: 'Friendly',
  Allied: 'Allied',
  Hostile: 'Hostile',
  War: 'War'
};

export type EventType = 'Political' | 'Military' | 'Economic' | 'Disaster' | 'Cultural';
export const EventTypeSchema = z.enum(['Political', 'Military', 'Economic', 'Disaster', 'Cultural']);
export const EventTypeValues = {
  Political: 'Political' as EventType,
  Military: 'Military' as EventType,
  Economic: 'Economic' as EventType,
  Disaster: 'Disaster' as EventType,
  Cultural: 'Cultural' as EventType
};

export type EventSeverity = 'Positive' | 'Neutral' | 'Warning' | 'Danger';
export const EventSeveritySchema = z.enum(['Positive', 'Neutral', 'Warning', 'Danger']);
export const EventSeverityValues = {
  Positive: 'Positive' as EventSeverity,
  Neutral: 'Neutral' as EventSeverity,
  Warning: 'Warning' as EventSeverity,
  Danger: 'Danger' as EventSeverity
};

export type PolicyCategory = 'Economic' | 'Military' | 'Cultural' | 'Diplomatic';
export const PolicyCategorySchema = z.enum(['Economic', 'Military', 'Cultural', 'Diplomatic']);
export const PolicyCategoryValues = {
  Economic: 'Economic' as PolicyCategory,
  Military: 'Military' as PolicyCategory,
  Cultural: 'Cultural' as PolicyCategory,
  Diplomatic: 'Diplomatic' as PolicyCategory
};

export type CityStateName = 'Athens' | 'Sparta' | 'Thebes' | 'Corinth';
export const CityStateNameSchema = z.enum(['Athens', 'Sparta', 'Thebes', 'Corinth']);
export const CityStateNameValues = {
  Athens: 'Athens' as CityStateName,
  Sparta: 'Sparta' as CityStateName,
  Thebes: 'Thebes' as CityStateName,
  Corinth: 'Corinth' as CityStateName
};

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
  status: string; // Using string to avoid type issues
  treaties: string[];
}

export interface GameEvent {
  id: string;
  turn: number;
  year: number;
  title: string;
  description: string;
  type: string;
  severity: string;
  effects?: { [key in ResourceType]?: number };
  choices?: {
    text: string;
    effects: { [key in ResourceType]?: number };
  }[];
}

export interface CityState {
  id: string;
  name: CityStateName;
  government: string; // Using string to avoid type issues with GovernmentType
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
