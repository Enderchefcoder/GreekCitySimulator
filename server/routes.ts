import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGameStateSchema } from '@shared/schema';
import { fromZodError } from 'zod-validation-error';

export async function registerRoutes(app: Express): Promise<Server> {
  // Game state endpoints
  app.get('/api/games', async (req, res) => {
    try {
      const games = await storage.getAllGameStates();
      res.json(games);
    } catch (error) {
      console.error('Error fetching game states:', error);
      res.status(500).json({ message: 'Failed to fetch game states' });
    }
  });

  app.get('/api/games/:id', async (req, res) => {
    try {
      const gameId = parseInt(req.params.id);
      const game = await storage.getGameState(gameId);
      
      if (!game) {
        return res.status(404).json({ message: 'Game not found' });
      }
      
      res.json(game);
    } catch (error) {
      console.error('Error fetching game state:', error);
      res.status(500).json({ message: 'Failed to fetch game state' });
    }
  });

  app.post('/api/games', async (req, res) => {
    try {
      const parseResult = insertGameStateSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        const validationError = fromZodError(parseResult.error);
        return res.status(400).json({ message: validationError.message });
      }
      
      const gameState = await storage.createGameState(parseResult.data);
      res.status(201).json(gameState);
    } catch (error) {
      console.error('Error creating game state:', error);
      res.status(500).json({ message: 'Failed to create game state' });
    }
  });

  app.put('/api/games/:id', async (req, res) => {
    try {
      const gameId = parseInt(req.params.id);
      const parseResult = insertGameStateSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        const validationError = fromZodError(parseResult.error);
        return res.status(400).json({ message: validationError.message });
      }
      
      const gameState = await storage.updateGameState(gameId, parseResult.data);
      
      if (!gameState) {
        return res.status(404).json({ message: 'Game not found' });
      }
      
      res.json(gameState);
    } catch (error) {
      console.error('Error updating game state:', error);
      res.status(500).json({ message: 'Failed to update game state' });
    }
  });

  app.delete('/api/games/:id', async (req, res) => {
    try {
      const gameId = parseInt(req.params.id);
      const success = await storage.deleteGameState(gameId);
      
      if (!success) {
        return res.status(404).json({ message: 'Game not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting game state:', error);
      res.status(500).json({ message: 'Failed to delete game state' });
    }
  });

  // Create HTTP server for the Express app
  const httpServer = createServer(app);

  return httpServer;
}
