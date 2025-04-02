import { users, type User, type InsertUser, GameStateRecord, InsertGameState } from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Game state operations
  getGameState(id: number): Promise<GameStateRecord | undefined>;
  getAllGameStates(): Promise<GameStateRecord[]>;
  createGameState(gameState: InsertGameState): Promise<GameStateRecord>;
  updateGameState(id: number, gameState: InsertGameState): Promise<GameStateRecord | undefined>;
  deleteGameState(id: number): Promise<boolean>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private gameStates: Map<number, GameStateRecord>;
  private currentUserId: number;
  private currentGameStateId: number;

  constructor() {
    this.users = new Map();
    this.gameStates = new Map();
    this.currentUserId = 1;
    this.currentGameStateId = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Game state operations
  async getGameState(id: number): Promise<GameStateRecord | undefined> {
    return this.gameStates.get(id);
  }

  async getAllGameStates(): Promise<GameStateRecord[]> {
    return Array.from(this.gameStates.values());
  }

  async createGameState(insertGameState: InsertGameState): Promise<GameStateRecord> {
    const id = this.currentGameStateId++;
    const now = new Date();
    
    const gameState: GameStateRecord = {
      id,
      userId: insertGameState.userId,
      gameState: insertGameState.gameState,
      createdAt: now,
      updatedAt: now
    };
    
    this.gameStates.set(id, gameState);
    return gameState;
  }

  async updateGameState(id: number, insertGameState: InsertGameState): Promise<GameStateRecord | undefined> {
    const existingGameState = this.gameStates.get(id);
    
    if (!existingGameState) {
      return undefined;
    }
    
    const updatedGameState: GameStateRecord = {
      ...existingGameState,
      gameState: insertGameState.gameState,
      updatedAt: new Date()
    };
    
    this.gameStates.set(id, updatedGameState);
    return updatedGameState;
  }

  async deleteGameState(id: number): Promise<boolean> {
    if (!this.gameStates.has(id)) {
      return false;
    }
    
    return this.gameStates.delete(id);
  }
}

// Export a singleton instance of the storage
export const storage = new MemStorage();
