
import { v4 as uuidv4 } from 'uuid';
import { MultiplayerSession, GameState, CityStateName } from '@shared/schema';
import { storage } from './storage';

const activeSessions: Record<string, MultiplayerSession> = {};
const TURN_TIME_LIMIT = 120; // 2 minutes per turn
const MAX_ACTIONS_PER_TURN = 3;

export const multiplayerManager = {
  // Create a new multiplayer session
  createSession(gameStateId: string, hostUserId: number, hostUsername: string, hostCityState: CityStateName): MultiplayerSession {
    const sessionId = uuidv4();
    const session: MultiplayerSession = {
      id: sessionId,
      gameStateId,
      players: [{
        id: hostUserId,
        username: hostUsername,
        cityState: hostCityState,
        isCurrentTurn: true,
        actionsRemaining: MAX_ACTIONS_PER_TURN,
        isConnected: true,
        lastActive: new Date()
      }],
      turnNumber: 1,
      turnTimeLimit: TURN_TIME_LIMIT,
      currentTurnStartedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    activeSessions[sessionId] = session;
    return session;
  },
  
  // Join an existing session
  joinSession(sessionId: string, userId: number, username: string, cityState: CityStateName): MultiplayerSession | null {
    const session = activeSessions[sessionId];
    if (!session) return null;
    
    // Check if player is already in the session
    const existingPlayer = session.players.find(p => p.id === userId);
    if (existingPlayer) {
      existingPlayer.isConnected = true;
      existingPlayer.lastActive = new Date();
      session.updatedAt = new Date();
      return session;
    }
    
    // Add new player to session
    session.players.push({
      id: userId,
      username,
      cityState,
      isCurrentTurn: false,
      actionsRemaining: MAX_ACTIONS_PER_TURN,
      isConnected: true,
      lastActive: new Date()
    });
    
    session.updatedAt = new Date();
    return session;
  },
  
  // End the current player's turn and move to next player
  endTurn(sessionId: string): MultiplayerSession | null {
    const session = activeSessions[sessionId];
    if (!session) return null;
    
    const currentPlayerIndex = session.players.findIndex(p => p.isCurrentTurn);
    if (currentPlayerIndex === -1) return null;
    
    // End current player's turn
    session.players[currentPlayerIndex].isCurrentTurn = false;
    session.players[currentPlayerIndex].actionsRemaining = MAX_ACTIONS_PER_TURN;
    
    // Find next connected player
    let nextPlayerIndex = currentPlayerIndex;
    let foundNextPlayer = false;
    
    for (let i = 1; i <= session.players.length; i++) {
      const checkIndex = (currentPlayerIndex + i) % session.players.length;
      if (session.players[checkIndex].isConnected) {
        nextPlayerIndex = checkIndex;
        foundNextPlayer = true;
        break;
      }
    }
    
    if (!foundNextPlayer) {
      // If no other connected players, keep current player's turn
      session.players[currentPlayerIndex].isCurrentTurn = true;
      return session;
    }
    
    // Start next player's turn
    session.players[nextPlayerIndex].isCurrentTurn = true;
    session.turnNumber++;
    session.currentTurnStartedAt = new Date();
    session.updatedAt = new Date();
    
    return session;
  },
  
  // Track action usage for the current player
  useAction(sessionId: string, userId: number): boolean {
    const session = activeSessions[sessionId];
    if (!session) return false;
    
    const playerIndex = session.players.findIndex(p => p.id === userId && p.isCurrentTurn);
    if (playerIndex === -1) return false;
    
    if (session.players[playerIndex].actionsRemaining <= 0) return false;
    
    session.players[playerIndex].actionsRemaining--;
    session.updatedAt = new Date();
    
    return true;
  },
  
  // Disconnect a player from the session
  disconnectPlayer(sessionId: string, userId: number): MultiplayerSession | null {
    const session = activeSessions[sessionId];
    if (!session) return null;
    
    const playerIndex = session.players.findIndex(p => p.id === userId);
    if (playerIndex === -1) return null;
    
    session.players[playerIndex].isConnected = false;
    
    // If disconnected player was current turn, move to next player
    if (session.players[playerIndex].isCurrentTurn) {
      return this.endTurn(sessionId);
    }
    
    return session;
  },
  
  // Get session by ID
  getSession(sessionId: string): MultiplayerSession | null {
    return activeSessions[sessionId] || null;
  },
  
  // Check if it's the player's turn
  isPlayerTurn(sessionId: string, userId: number): boolean {
    const session = activeSessions[sessionId];
    if (!session) return false;
    
    const player = session.players.find(p => p.id === userId);
    return player ? player.isCurrentTurn : false;
  },
  
  // Get the number of actions remaining for a player
  getActionsRemaining(sessionId: string, userId: number): number {
    const session = activeSessions[sessionId];
    if (!session) return 0;
    
    const player = session.players.find(p => p.id === userId);
    return player ? player.actionsRemaining : 0;
  },
  
  // Clean up stale sessions
  cleanupSessions(): void {
    const now = new Date();
    const sessionIds = Object.keys(activeSessions);
    
    sessionIds.forEach(sessionId => {
      const session = activeSessions[sessionId];
      const inactiveTime = now.getTime() - session.updatedAt.getTime();
      
      // Remove sessions inactive for more than 24 hours
      if (inactiveTime > 24 * 60 * 60 * 1000) {
        delete activeSessions[sessionId];
      }
    });
  }
};

// Run cleanup every hour
setInterval(() => {
  multiplayerManager.cleanupSessions();
}, 60 * 60 * 1000);
