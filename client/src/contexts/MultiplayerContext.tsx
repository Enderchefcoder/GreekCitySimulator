
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MultiplayerSession, CityStateName } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface MultiplayerContextType {
  session: MultiplayerSession | null;
  loading: boolean;
  error: string | null;
  isHost: boolean;
  isMyTurn: boolean;
  actionsRemaining: number;
  createSession: (gameStateId: string, cityState: CityStateName) => Promise<string | null>;
  joinSession: (sessionId: string, cityState: CityStateName) => Promise<boolean>;
  endTurn: () => Promise<boolean>;
  useAction: () => Promise<boolean>;
  disconnectFromSession: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const MultiplayerContext = createContext<MultiplayerContextType | undefined>(undefined);

export const MultiplayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<MultiplayerSession | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userId] = useState<number>(1); // Placeholder - should come from auth context
  const [username] = useState<string>('Player'); // Placeholder - should come from auth context
  const { toast } = useToast();
  
  // Poll for session updates
  useEffect(() => {
    if (!session) return;
    
    const intervalId = setInterval(() => {
      refreshSession();
    }, 5000); // Poll every 5 seconds
    
    return () => clearInterval(intervalId);
  }, [session]);
  
  const refreshSession = useCallback(async () => {
    if (!session) return;
    
    try {
      const response = await apiRequest('GET', `/api/multiplayer/${session.id}`, undefined);
      const data = await response.json();
      setSession(data);
    } catch (err) {
      console.error('Error refreshing session:', err);
    }
  }, [session]);
  
  const createSession = useCallback(async (gameStateId: string, cityState: CityStateName): Promise<string | null> => {
    setLoading(true);
    try {
      const response = await apiRequest('POST', '/api/multiplayer/create', {
        gameStateId,
        userId,
        username,
        cityState
      });
      
      const data = await response.json();
      setSession(data);
      
      toast({
        title: "Multiplayer session created",
        description: `Share the session ID: ${data.id} with your friends to join.`,
      });
      
      return data.id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create multiplayer session';
      setError(errorMessage);
      toast({
        title: "Session creation failed",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId, username, toast]);
  
  const joinSession = useCallback(async (sessionId: string, cityState: CityStateName): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await apiRequest('POST', `/api/multiplayer/join/${sessionId}`, {
        userId,
        username,
        cityState
      });
      
      const data = await response.json();
      setSession(data);
      
      toast({
        title: "Joined multiplayer session",
        description: `You've joined a game with ${data.players.length} players.`,
      });
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join multiplayer session';
      setError(errorMessage);
      toast({
        title: "Join session failed",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [userId, username, toast]);
  
  const endTurn = useCallback(async (): Promise<boolean> => {
    if (!session) return false;
    
    setLoading(true);
    try {
      const response = await apiRequest('POST', `/api/multiplayer/${session.id}/end-turn`, undefined);
      const data = await response.json();
      setSession(data);
      
      toast({
        title: "Turn ended",
        description: "Waiting for next player's turn.",
      });
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to end turn';
      setError(errorMessage);
      toast({
        title: "End turn failed",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [session, toast]);
  
  const useAction = useCallback(async (): Promise<boolean> => {
    if (!session) return false;
    
    try {
      const response = await apiRequest('POST', `/api/multiplayer/${session.id}/use-action`, {
        userId
      });
      
      const data = await response.json();
      setSession(data);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to use action';
      setError(errorMessage);
      toast({
        title: "Action failed",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  }, [session, userId, toast]);
  
  const disconnectFromSession = useCallback(async (): Promise<void> => {
    if (!session) return;
    
    try {
      await apiRequest('POST', `/api/multiplayer/${session.id}/disconnect`, {
        userId
      });
      
      setSession(null);
      
      toast({
        title: "Disconnected",
        description: "You've left the multiplayer session.",
      });
    } catch (err) {
      console.error('Error disconnecting from session:', err);
    }
  }, [session, userId, toast]);
  
  // Calculate derived state
  const isHost = session ? session.players[0]?.id === userId : false;
  const currentPlayer = session?.players.find(p => p.id === userId);
  const isMyTurn = currentPlayer?.isCurrentTurn || false;
  const actionsRemaining = currentPlayer?.actionsRemaining || 0;
  
  return (
    <MultiplayerContext.Provider
      value={{
        session,
        loading,
        error,
        isHost,
        isMyTurn,
        actionsRemaining,
        createSession,
        joinSession,
        endTurn,
        useAction,
        disconnectFromSession,
        refreshSession
      }}
    >
      {children}
    </MultiplayerContext.Provider>
  );
};

export const useMultiplayer = (): MultiplayerContextType => {
  const context = useContext(MultiplayerContext);
  if (context === undefined) {
    throw new Error('useMultiplayer must be used within a MultiplayerProvider');
  }
  return context;
};
