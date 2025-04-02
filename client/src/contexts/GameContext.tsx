import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  GameState, 
  CityState, 
  CityStateName, 
  Resources, 
  Policy, 
  Relationship,
  GameEvent
} from '@shared/schema';
import {
  EventTypes,
  EventSeverities,
  PolicyCategories,
  RelationshipStatuses,
  GovernmentType,
} from '@/lib/game-enums-fix';

// Add our own local types to avoid import issues
type RelationshipStatus = string; 
type MyGovernmentType = string;
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { gameEngine } from '@/lib/game-engine';
import { generateRandomEvent } from '@/lib/event-generator';
import { v4 as uuidv4 } from 'uuid';

interface GameContextType {
  game: GameState | null;
  loading: boolean;
  error: string | null;
  startNewGame: (cityName: CityStateName, government: GovernmentType) => Promise<void>;
  saveGame: () => Promise<void>;
  loadGame: (gameId: string) => Promise<void>;
  endTurn: () => void;
  changeGovernment: (government: GovernmentType) => void;
  addPolicy: (policy: Policy) => void;
  removePolicy: (policyId: string) => void;
  declareWar: (cityState: CityStateName) => void;
  makePeace: (cityState: CityStateName) => void;
  handleEventChoice: (eventId: string, choiceIndex: number) => void;
  buildStructure: (structureType: string, cost: Resources) => void;
  trainUnits: (amount: number, cost: number) => void;
  holdFestival: () => void;
  establishTrade: (cityState: CityStateName) => void;
  exportHistory: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [game, setGame] = useState<GameState | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const saveGame = useCallback(async () => {
    if (!game) return;

    setLoading(true);
    try {
      await apiRequest('POST', '/api/games', { gameState: game });
      toast({
        title: "Game saved",
        description: "Your progress has been saved successfully.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save the game';
      setError(errorMessage);
      toast({
        title: "Save failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [game, toast]);

  const loadGame = useCallback(async (gameId: string) => {
    setLoading(true);
    try {
      const response = await apiRequest('GET', `/api/games/${gameId}`, undefined);
      const data = await response.json();
      setGame(data.gameState);
      toast({
        title: "Game loaded",
        description: "Your game has been loaded successfully.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load the game';
      setError(errorMessage);
      toast({
        title: "Load failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const startNewGame = useCallback(async (cityName: CityStateName, government: GovernmentType) => {
    setLoading(true);
    try {
      // Initialize a new game state
      const startingYear = 450; // BCE
      const initialResources: Resources = {
        gold: 1000,
        food: 1000,
        population: 5000,
        military: 500,
        happiness: 70
      };

      const playerCity: CityState = {
        id: uuidv4(),
        name: cityName,
        government: government as GovernmentType,
        resources: initialResources,
        location: getLocationForCity(cityName),
        isPlayerOwned: true
      };

      // Initialize other city-states
      const otherCities: CityState[] = [
        'Athens' as CityStateName, 
        'Sparta' as CityStateName, 
        'Thebes' as CityStateName, 
        'Corinth' as CityStateName
      ]
        .filter(name => name !== cityName)
        .map(name => ({
          id: uuidv4(),
          name,
          government: randomGovernment(),
          resources: generateRandomResources(),
          location: getLocationForCity(name),
          isPlayerOwned: false
        }));

      // Initialize relationships
      const relationships: Relationship[] = otherCities.map(city => ({
        cityState: city.name,
        status: RelationshipStatuses.Neutral,
        treaties: []
      }));

      // Initialize with a welcome event
      const initialEvent: GameEvent = {
        id: uuidv4(),
        turn: 1,
        year: startingYear,
        title: 'City State Founded',
        description: `Your city-state of ${cityName} has been established under a ${government} government. May the gods favor your rule!`,
        type: EventTypes.Political,
        severity: EventSeverities.Positive
      };

      const newGameState: GameState = {
        id: uuidv4(),
        userId: 1, // This will be replaced with actual user ID when available
        turn: 1,
        year: startingYear,
        playerCityState: playerCity,
        otherCityStates: otherCities,
        relationships,
        policies: [],
        events: [initialEvent],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setGame(newGameState);
      toast({
        title: "Game started",
        description: `You are now the ruler of ${cityName}.`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start a new game';
      setError(errorMessage);
      toast({
        title: "Start failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const endTurn = useCallback(() => {
    if (!game) return;

    // Process turn
    const updatedGame = gameEngine.processTurn(game);
    
    // Generate random events
    const randomEvent = generateRandomEvent(updatedGame);
    if (randomEvent) {
      updatedGame.events.unshift(randomEvent);
    }

    // Update the game state
    setGame(updatedGame);
    
    toast({
      title: `Turn ${updatedGame.turn} completed`,
      description: `The year is now ${updatedGame.year} BCE.`,
    });
  }, [game, toast]);

  const changeGovernment = useCallback((government: GovernmentType) => {
    if (!game) return;

    const updatedGame = { ...game };
    updatedGame.playerCityState.government = government;

    // Create an event for this change
    const govChangeEvent: GameEvent = {
      id: uuidv4(),
      turn: game.turn,
      year: game.year,
      title: 'Government Changed',
      description: `Your city-state has transitioned to a ${government}.`,
      type: EventTypes.Political,
      severity: EventSeverities.Neutral
    };

    updatedGame.events.unshift(govChangeEvent);
    setGame(updatedGame);

    toast({
      title: "Government changed",
      description: `Your city-state is now a ${government}.`,
    });
  }, [game, toast]);

  const addPolicy = useCallback((policy: Policy) => {
    if (!game) return;

    const updatedGame = { ...game };
    updatedGame.policies.push(policy);

    // Create an event for this policy
    const policyEvent: GameEvent = {
      id: uuidv4(),
      turn: game.turn,
      year: game.year,
      title: 'New Policy Enacted',
      description: `You have enacted the ${policy.name} policy: ${policy.description}`,
      type: EventTypes.Political,
      severity: EventSeverities.Neutral
    };

    updatedGame.events.unshift(policyEvent);
    setGame(updatedGame);

    toast({
      title: "Policy enacted",
      description: `${policy.name} is now in effect.`,
    });
  }, [game, toast]);

  const removePolicy = useCallback((policyId: string) => {
    if (!game) return;

    const updatedGame = { ...game };
    const policyIndex = updatedGame.policies.findIndex(p => p.id === policyId);
    
    if (policyIndex !== -1) {
      const policy = updatedGame.policies[policyIndex];
      updatedGame.policies.splice(policyIndex, 1);

      // Create an event for this policy removal
      const policyEvent: GameEvent = {
        id: uuidv4(),
        turn: game.turn,
        year: game.year,
        title: 'Policy Repealed',
        description: `You have repealed the ${policy.name} policy.`,
        type: EventTypes.Political,
        severity: EventSeverities.Neutral
      };

      updatedGame.events.unshift(policyEvent);
      setGame(updatedGame);

      toast({
        title: "Policy repealed",
        description: `${policy.name} has been removed.`,
      });
    }
  }, [game, toast]);

  const declareWar = useCallback((cityState: CityStateName) => {
    if (!game) return;

    const updatedGame = { ...game };
    const relationshipIndex = updatedGame.relationships.findIndex(r => r.cityState === cityState);
    
    if (relationshipIndex !== -1) {
      updatedGame.relationships[relationshipIndex].status = RelationshipStatuses.War;

      // Create an event for the war declaration
      const warEvent: GameEvent = {
        id: uuidv4(),
        turn: game.turn,
        year: game.year,
        title: 'War Declared',
        description: `You have declared war on ${cityState}.`,
        type: EventTypes.Military,
        severity: EventSeverities.Danger
      };

      updatedGame.events.unshift(warEvent);
      setGame(updatedGame);

      toast({
        title: "War declared",
        description: `Your city-state is now at war with ${cityState}.`,
        variant: "destructive",
      });
    }
  }, [game, toast]);

  const makePeace = useCallback((cityState: CityStateName) => {
    if (!game) return;

    const updatedGame = { ...game };
    const relationshipIndex = updatedGame.relationships.findIndex(r => r.cityState === cityState);
    
    if (relationshipIndex !== -1) {
      updatedGame.relationships[relationshipIndex].status = RelationshipStatuses.Neutral;

      // Create an event for the peace declaration
      const peaceEvent: GameEvent = {
        id: uuidv4(),
        turn: game.turn,
        year: game.year,
        title: 'Peace Established',
        description: `You have made peace with ${cityState}.`,
        type: EventTypes.Military,
        severity: EventSeverities.Positive
      };

      updatedGame.events.unshift(peaceEvent);
      setGame(updatedGame);

      toast({
        title: "Peace established",
        description: `Your city-state is now at peace with ${cityState}.`,
      });
    }
  }, [game, toast]);

  const handleEventChoice = useCallback((eventId: string, choiceIndex: number) => {
    if (!game) return;

    const updatedGame = { ...game };
    const eventIndex = updatedGame.events.findIndex(e => e.id === eventId);
    
    if (eventIndex !== -1) {
      const event = updatedGame.events[eventIndex];
      
      if (event.choices && event.choices[choiceIndex]) {
        const choice = event.choices[choiceIndex];
        
        // Apply the effects of the choice
        if (choice.effects) {
          for (const [resource, value] of Object.entries(choice.effects)) {
            if (resource in updatedGame.playerCityState.resources) {
              updatedGame.playerCityState.resources[resource as keyof Resources] += value as number;
            }
          }
        }
        
        // Update the event description to include the choice
        updatedGame.events[eventIndex].description += ` You chose to ${choice.text}.`;
        
        // Remove the choices now that one has been selected
        delete updatedGame.events[eventIndex].choices;
        
        setGame(updatedGame);
        
        toast({
          title: "Decision made",
          description: `You have made your choice.`,
        });
      }
    }
  }, [game, toast]);

  const buildStructure = useCallback((structureType: string, cost: Resources) => {
    if (!game) return;

    const updatedGame = { ...game };
    
    // Check if player has enough resources
    for (const [resource, value] of Object.entries(cost)) {
      if (updatedGame.playerCityState.resources[resource as keyof Resources] < value) {
        toast({
          title: "Cannot build structure",
          description: `You don't have enough ${resource}.`,
          variant: "destructive",
        });
        return;
      }
    }
    
    // Deduct the costs
    for (const [resource, value] of Object.entries(cost)) {
      updatedGame.playerCityState.resources[resource as keyof Resources] -= value;
    }
    
    // Create an event for the building
    const buildEvent: GameEvent = {
      id: uuidv4(),
      turn: game.turn,
      year: game.year,
      title: 'Structure Built',
      description: `You have built a new ${structureType}.`,
      type: EventTypes.Economic,
      severity: EventSeverities.Positive
    };
    
    updatedGame.events.unshift(buildEvent);
    setGame(updatedGame);
    
    toast({
      title: "Structure built",
      description: `A new ${structureType} has been constructed.`,
    });
  }, [game, toast]);

  const trainUnits = useCallback((amount: number, cost: number) => {
    if (!game) return;

    const updatedGame = { ...game };
    
    // Check if player has enough gold
    if (updatedGame.playerCityState.resources.gold < cost) {
      toast({
        title: "Cannot train units",
        description: "You don't have enough gold.",
        variant: "destructive",
      });
      return;
    }
    
    // Deduct the cost
    updatedGame.playerCityState.resources.gold -= cost;
    
    // Add the units
    updatedGame.playerCityState.resources.military += amount;
    
    // Create an event for training
    const trainEvent: GameEvent = {
      id: uuidv4(),
      turn: game.turn,
      year: game.year,
      title: 'Military Training',
      description: `You have trained ${amount} new military units.`,
      type: EventTypes.Military,
      severity: EventSeverities.Positive
    };
    
    updatedGame.events.unshift(trainEvent);
    setGame(updatedGame);
    
    toast({
      title: "Units trained",
      description: `${amount} new military units have joined your forces.`,
    });
  }, [game, toast]);

  const holdFestival = useCallback(() => {
    if (!game) return;

    const festivalCost = 200; // Gold cost for festival
    const happinessBoost = 15; // Happiness boost
    
    const updatedGame = { ...game };
    
    // Check if player has enough gold
    if (updatedGame.playerCityState.resources.gold < festivalCost) {
      toast({
        title: "Cannot hold festival",
        description: "You don't have enough gold.",
        variant: "destructive",
      });
      return;
    }
    
    // Deduct the cost
    updatedGame.playerCityState.resources.gold -= festivalCost;
    
    // Add happiness
    updatedGame.playerCityState.resources.happiness += happinessBoost;
    
    // Create an event for the festival
    const festivalEvent: GameEvent = {
      id: uuidv4(),
      turn: game.turn,
      year: game.year,
      title: 'Festival Held',
      description: `You held a grand festival, boosting citizen happiness by ${happinessBoost}.`,
      type: EventTypes.Cultural,
      severity: EventSeverities.Positive
    };
    
    updatedGame.events.unshift(festivalEvent);
    setGame(updatedGame);
    
    toast({
      title: "Festival held",
      description: `The citizens are pleased with the celebrations.`,
    });
  }, [game, toast]);

  const establishTrade = useCallback((cityState: CityStateName) => {
    if (!game) return;

    const updatedGame = { ...game };
    const relationshipIndex = updatedGame.relationships.findIndex(r => r.cityState === cityState);
    
    if (relationshipIndex !== -1) {
      // Can't trade with enemies
      if (updatedGame.relationships[relationshipIndex].status === RelationshipStatuses.War) {
        toast({
          title: "Cannot establish trade",
          description: `You are at war with ${cityState}.`,
          variant: "destructive",
        });
        return;
      }
      
      // Add trade treaty if it doesn't exist
      if (!updatedGame.relationships[relationshipIndex].treaties.includes('Trade')) {
        updatedGame.relationships[relationshipIndex].treaties.push('Trade');
        
        // Improve relationship if it's neutral
        if (updatedGame.relationships[relationshipIndex].status === RelationshipStatuses.Neutral) {
          updatedGame.relationships[relationshipIndex].status = RelationshipStatuses.Friendly;
        }
        
        // Trade income boost (gold per turn will be handled by the game engine)
        const tradeBoost = 50;
        
        // Create an event for the trade route
        const tradeEvent: GameEvent = {
          id: uuidv4(),
          turn: game.turn,
          year: game.year,
          title: 'Trade Route Established',
          description: `You have established a trade route with ${cityState}, increasing income by ${tradeBoost} gold per turn.`,
          type: EventTypes.Economic,
          severity: EventSeverities.Positive
        };
        
        updatedGame.events.unshift(tradeEvent);
        setGame(updatedGame);
        
        toast({
          title: "Trade established",
          description: `A profitable trade route has been established with ${cityState}.`,
        });
      } else {
        toast({
          title: "Trade already exists",
          description: `You already have a trade agreement with ${cityState}.`,
          variant: "destructive",
        });
      }
    }
  }, [game, toast]);

  const exportHistory = useCallback(() => {
    if (!game) return;
    
    // Format the history as text
    let historyText = `HISTORY OF ${game.playerCityState.name.toUpperCase()}\n\n`;
    
    // Group events by year
    const eventsByYear: Record<number, GameEvent[]> = {};
    game.events.forEach(event => {
      if (!eventsByYear[event.year]) {
        eventsByYear[event.year] = [];
      }
      eventsByYear[event.year].push(event);
    });
    
    // Sort years in descending order (most recent first)
    const sortedYears = Object.keys(eventsByYear)
      .map(Number)
      .sort((a, b) => b - a);
    
    // Generate the text history
    sortedYears.forEach(year => {
      historyText += `--- ${year} BCE ---\n\n`;
      
      // Sort events within each year by turn (descending)
      const yearEvents = eventsByYear[year].sort((a, b) => b.turn - a.turn);
      
      yearEvents.forEach(event => {
        historyText += `[Turn ${event.turn}] ${event.title}\n${event.description}\n\n`;
      });
    });
    
    // Create a blob and trigger download
    const blob = new Blob([historyText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${game.playerCityState.name.toLowerCase()}_history.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "History exported",
      description: "Your city-state's history has been exported as a text file.",
    });
  }, [game, toast]);

  // Helper functions
  const getLocationForCity = (cityName: CityStateName): { x: number; y: number } => {
    switch (cityName) {
      case 'Athens':
        return { x: 400, y: 300 };
      case 'Sparta':
        return { x: 600, y: 400 };
      case 'Thebes':
        return { x: 500, y: 100 };
      case 'Corinth':
        return { x: 200, y: 400 };
      default:
        return { x: 300, y: 300 }; // Default position
    }
  };

  const randomGovernment = (): GovernmentType => {
    const governmentTypes = ['Democracy', 'Oligarchy', 'Tyranny'] as const;
    return governmentTypes[Math.floor(Math.random() * governmentTypes.length)] as GovernmentType;
  };

  const generateRandomResources = (): Resources => {
    return {
      gold: 500 + Math.floor(Math.random() * 1000),
      food: 500 + Math.floor(Math.random() * 1000),
      population: 3000 + Math.floor(Math.random() * 5000),
      military: 300 + Math.floor(Math.random() * 500),
      happiness: 50 + Math.floor(Math.random() * 30)
    };
  };

  return (
    <GameContext.Provider
      value={{
        game,
        loading,
        error,
        startNewGame,
        saveGame,
        loadGame,
        endTurn,
        changeGovernment,
        addPolicy,
        removePolicy,
        declareWar,
        makePeace,
        handleEventChoice,
        buildStructure,
        trainUnits,
        holdFestival,
        establishTrade,
        exportHistory
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
