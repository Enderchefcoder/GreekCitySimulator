import { 
  GameState, 
  GameEvent,
  ResourceType,
  Resources
} from '@shared/schema';
import {
  EventTypes,
  EventSeverities
} from './game-enums-fix';
import { v4 as uuidv4 } from 'uuid';

// Event templates for different event types
interface EventTemplate {
  title: string;
  description: string;
  type: string;
  severity: string;
  effects?: Partial<Record<ResourceType, number>>;
  choices?: {
    text: string;
    effects: Partial<Record<ResourceType, number>>;
  }[];
  condition?: (gameState: GameState) => boolean;
}

// Define event templates for different categories
const disasterEvents: EventTemplate[] = [
  {
    title: 'Earthquake',
    description: 'A powerful earthquake has struck your city-state, causing damage to buildings and infrastructure.',
    type: EventTypes.Disaster,
    severity: EventSeverities.Danger,
    effects: {
      gold: -200,
      population: -100,
      happiness: -10
    }
  },
  {
    title: 'Plague',
    description: 'A deadly plague is spreading through your city. Citizens are falling ill and dying.',
    type: EventTypes.Disaster,
    severity: EventSeverities.Danger,
    effects: {
      population: -300,
      happiness: -15
    },
    choices: [
      {
        text: 'Quarantine the sick',
        effects: { population: -100, happiness: -5 }
      },
      {
        text: 'Pray to the gods',
        effects: { gold: -100, happiness: 5 }
      },
      {
        text: 'Seek medical treatments',
        effects: { gold: -200 }
      }
    ]
  },
  {
    title: 'Drought',
    description: 'A severe drought has affected your farmlands. Food production is significantly reduced.',
    type: EventTypes.Disaster,
    severity: EventSeverities.Warning,
    effects: {
      food: -200,
      happiness: -5
    }
  },
  {
    title: 'Storm',
    description: 'A powerful storm has damaged your harbor and coastal buildings.',
    type: EventTypes.Disaster,
    severity: EventSeverities.Warning,
    effects: {
      gold: -150,
      food: -50
    }
  }
];

const politicalEvents: EventTemplate[] = [
  {
    title: 'Political Scandal',
    description: 'A scandal involving prominent politicians has erupted in your city-state.',
    type: EventTypes.Political,
    severity: EventSeverities.Warning,
    effects: {
      happiness: -10
    },
    choices: [
      {
        text: 'Cover it up',
        effects: { gold: -100 }
      },
      {
        text: 'Hold public trials',
        effects: { happiness: 5, gold: -50 }
      },
      {
        text: 'Ignore the scandal',
        effects: { happiness: -5 }
      }
    ]
  },
  {
    title: 'Foreign Delegates',
    description: 'Delegates from a distant land have arrived to establish diplomatic relations.',
    type: EventTypes.Political,
    severity: EventSeverities.Positive,
    choices: [
      {
        text: 'Welcome them warmly',
        effects: { gold: -50, happiness: 5 }
      },
      {
        text: 'Be cautious',
        effects: {}
      },
      {
        text: 'Turn them away',
        effects: { happiness: -5 }
      }
    ]
  },
  {
    title: 'Civil Unrest',
    description: 'Citizens are protesting against some of your policies.',
    type: EventTypes.Political,
    severity: EventSeverities.Warning,
    condition: (gameState) => gameState.playerCityState.resources.happiness < 40,
    effects: {
      happiness: -5
    },
    choices: [
      {
        text: 'Listen to their demands',
        effects: { gold: -100, happiness: 10 }
      },
      {
        text: 'Use force to disperse them',
        effects: { happiness: -10, military: -20 }
      },
      {
        text: 'Ignore the protests',
        effects: { happiness: -5 }
      }
    ]
  }
];

const militaryEvents: EventTemplate[] = [
  {
    title: 'Military Parade',
    description: 'Your generals suggest holding a military parade to boost morale.',
    type: EventTypes.Military,
    severity: EventSeverities.Positive,
    choices: [
      {
        text: 'Hold a grand parade',
        effects: { gold: -100, happiness: 10, military: 20 }
      },
      {
        text: 'Hold a modest display',
        effects: { gold: -50, happiness: 5, military: 10 }
      },
      {
        text: 'Decline',
        effects: { happiness: -5 }
      }
    ]
  },
  {
    title: 'Foreign Mercenaries',
    description: 'A group of skilled foreign mercenaries offers their services.',
    type: EventTypes.Military,
    severity: EventSeverities.Neutral,
    choices: [
      {
        text: 'Hire them',
        effects: { gold: -300, military: 100 }
      },
      {
        text: 'Decline politely',
        effects: {}
      },
      {
        text: 'Turn them away rudely',
        effects: { happiness: -5 }
      }
    ]
  },
  {
    title: 'Military Innovations',
    description: 'Your military commanders have developed new tactics and equipment.',
    type: EventTypes.Military,
    severity: EventSeverities.Positive,
    choices: [
      {
        text: 'Invest heavily',
        effects: { gold: -200, military: 150 }
      },
      {
        text: 'Implement gradually',
        effects: { gold: -100, military: 75 }
      }
    ]
  }
];

const economicEvents: EventTemplate[] = [
  {
    title: 'Economic Boom',
    description: 'Your economy is thriving due to favorable conditions.',
    type: EventTypes.Economic,
    severity: EventSeverities.Positive,
    effects: {
      gold: 200,
      happiness: 5
    }
  },
  {
    title: 'Trade Opportunity',
    description: 'Merchants propose a new trade venture that could be profitable.',
    type: EventTypes.Economic,
    severity: EventSeverities.Neutral,
    choices: [
      {
        text: 'Invest heavily',
        effects: { gold: -200 }
      },
      {
        text: 'Invest moderately',
        effects: { gold: -100 }
      },
      {
        text: 'Decline',
        effects: {}
      }
    ]
  },
  {
    title: 'Market Crash',
    description: 'The market for your main export has crashed, affecting your economy.',
    type: EventTypes.Economic,
    severity: EventSeverities.Warning,
    effects: {
      gold: -150,
      happiness: -5
    }
  }
];

const culturalEvents: EventTemplate[] = [
  {
    title: 'Olympic Games',
    description: 'Your athletes are preparing to compete in the Olympic Games.',
    type: EventTypes.Cultural,
    severity: EventSeverities.Positive,
    choices: [
      {
        text: 'Invest in training',
        effects: { gold: -100, happiness: 15 }
      },
      {
        text: 'Send them as is',
        effects: { happiness: 5 }
      },
      {
        text: 'Boycott the games',
        effects: { happiness: -10 }
      }
    ]
  },
  {
    title: 'Famous Philosopher',
    description: 'A famous philosopher wants to establish a school in your city.',
    type: EventTypes.Cultural,
    severity: EventSeverities.Positive,
    choices: [
      {
        text: 'Fund the school generously',
        effects: { gold: -150, happiness: 10 }
      },
      {
        text: 'Provide basic support',
        effects: { gold: -50, happiness: 5 }
      },
      {
        text: 'Decline politely',
        effects: {}
      }
    ]
  },
  {
    title: 'Cultural Festival',
    description: 'Your citizens want to hold a grand cultural festival.',
    type: EventTypes.Cultural,
    severity: EventSeverities.Positive,
    choices: [
      {
        text: 'Fund a magnificent festival',
        effects: { gold: -200, happiness: 20 }
      },
      {
        text: 'Organize a modest celebration',
        effects: { gold: -100, happiness: 10 }
      },
      {
        text: 'Let citizens organize it themselves',
        effects: { happiness: 5 }
      }
    ]
  }
];

// All event templates combined
const allEventTemplates = [
  ...disasterEvents,
  ...politicalEvents,
  ...militaryEvents,
  ...economicEvents,
  ...culturalEvents
];

/**
 * Generate a random event based on the current game state
 */
export function generateRandomEvent(gameState: GameState): GameEvent | null {
  // Base chance for an event to occur (50% per turn)
  const eventChance = 0.5;
  
  if (Math.random() > eventChance) {
    return null; // No event this turn
  }
  
  // Filter out events that have conditions and don't meet them
  const eligibleEvents = allEventTemplates.filter(template => 
    !template.condition || template.condition(gameState)
  );
  
  // Select a random event from the eligible templates
  const selectedTemplate = eligibleEvents[Math.floor(Math.random() * eligibleEvents.length)];
  
  // Create the event based on the template
  const event: GameEvent = {
    id: uuidv4(),
    turn: gameState.turn,
    year: gameState.year,
    title: selectedTemplate.title,
    description: selectedTemplate.description,
    type: selectedTemplate.type,
    severity: selectedTemplate.severity
  };
  
  // Add effects if the template has them
  if (selectedTemplate.effects) {
    event.effects = selectedTemplate.effects as Partial<Record<keyof Resources, number>>;
    
    // Apply immediate effects if there are no choices
    if (!selectedTemplate.choices) {
      applyEffects(gameState, selectedTemplate.effects);
    }
  }
  
  // Add choices if the template has them
  if (selectedTemplate.choices) {
    event.choices = selectedTemplate.choices;
  }
  
  return event;
}

/**
 * Apply event effects to the game state
 */
function applyEffects(gameState: GameState, effects: Partial<Record<ResourceType, number>>): void {
  const resources = gameState.playerCityState.resources;
  
  for (const [resource, value] of Object.entries(effects)) {
    if (resource in resources) {
      resources[resource as keyof Resources] += value as number;
    }
  }
  
  // Ensure resources don't go below 0 (except happiness)
  resources.gold = Math.max(0, resources.gold);
  resources.food = Math.max(0, resources.food);
  resources.military = Math.max(0, resources.military);
  resources.population = Math.max(1000, resources.population);
  
  // Happiness is capped between 0 and 100
  resources.happiness = Math.max(0, Math.min(100, resources.happiness));
}