import { 
  GameState, 
  Resources, 
  RelationshipStatus, 
  PolicyCategory,
  GovernmentType,
  GameEvent,
  EventType,
  EventSeverity
} from '@shared/schema';
import { v4 as uuidv4 } from 'uuid';

/**
 * The game engine responsible for processing turns and updating the game state
 */
export const gameEngine = {
  /**
   * Process a single turn in the game and update the game state accordingly
   */
  processTurn(gameState: GameState): GameState {
    const updatedState = { ...gameState };
    
    // Update basic properties
    updatedState.turn += 1;
    updatedState.year -= 1; // Going backwards as it's BCE
    updatedState.updatedAt = new Date();
    
    // Process resources based on government type, policies, etc.
    this.updateResources(updatedState);
    
    // Process relationships and diplomatic actions
    this.updateRelationships(updatedState);
    
    // Process government-specific mechanics
    this.processGovernmentEffects(updatedState);
    
    // Process wars and battles
    this.processWars(updatedState);
    
    return updatedState;
  },
  
  /**
   * Update resources based on policies, buildings, and government type
   */
  updateResources(gameState: GameState): void {
    const playerCity = gameState.playerCityState;
    const resources = playerCity.resources;
    
    // Base resource generation
    const baseGoldIncome = Math.floor(resources.population / 100);
    const baseFoodProduction = Math.floor(resources.population / 50);
    const basePopulationGrowth = Math.floor(resources.food / 100);
    const baseMilitaryRecruitment = Math.floor(resources.population / 200);
    
    // Calculate policy bonuses
    let goldModifier = 1.0;
    let foodModifier = 1.0;
    let populationModifier = 1.0;
    let militaryModifier = 1.0;
    let happinessModifier = 0;
    
    // Apply effects from active policies
    gameState.policies.forEach(policy => {
      if (policy.active) {
        if (policy.effects.gold) {
          resources.gold += policy.effects.gold;
        }
        if (policy.effects.food) {
          resources.food += policy.effects.food;
        }
        if (policy.effects.population) {
          resources.population += policy.effects.population;
        }
        if (policy.effects.military) {
          resources.military += policy.effects.military;
        }
        if (policy.effects.happiness) {
          resources.happiness += policy.effects.happiness;
        }
        
        // Apply category-specific modifiers
        if (policy.category === PolicyCategory.Economic) {
          goldModifier += 0.1;
          foodModifier += 0.05;
        } else if (policy.category === PolicyCategory.Military) {
          militaryModifier += 0.1;
          happinessModifier -= 5;
        } else if (policy.category === PolicyCategory.Cultural) {
          happinessModifier += 10;
          goldModifier -= 0.05;
        }
      }
    });
    
    // Apply government type effects
    if (playerCity.government === GovernmentType.Democracy) {
      happinessModifier += 10;
      goldModifier -= 0.1;
      militaryModifier -= 0.1;
    } else if (playerCity.government === GovernmentType.Oligarchy) {
      goldModifier += 0.2;
      happinessModifier -= 5;
    } else if (playerCity.government === GovernmentType.Tyranny) {
      militaryModifier += 0.2;
      happinessModifier -= 10;
    }
    
    // Apply trade agreement bonuses
    const tradePartners = gameState.relationships.filter(r => r.treaties.includes('Trade'));
    const tradeBonus = tradePartners.length * 50; // 50 gold per trade partner
    
    // Calculate final resource changes
    const goldIncome = Math.floor(baseGoldIncome * goldModifier) + tradeBonus;
    const foodProduction = Math.floor(baseFoodProduction * foodModifier);
    const populationGrowth = Math.floor(basePopulationGrowth * populationModifier);
    const militaryRecruitment = Math.floor(baseMilitaryRecruitment * militaryModifier);
    
    // Apply resource changes
    resources.gold += goldIncome;
    resources.food += foodProduction;
    resources.population += populationGrowth;
    resources.military += militaryRecruitment;
    resources.happiness += happinessModifier;
    
    // Apply resource consumption
    const foodConsumption = Math.floor(resources.population / 20);
    resources.food -= foodConsumption;
    
    // Military upkeep
    const militaryUpkeep = Math.floor(resources.military / 10);
    resources.gold -= militaryUpkeep;
    
    // Ensure resources don't go below 0 (except happiness)
    resources.gold = Math.max(0, resources.gold);
    resources.food = Math.max(0, resources.food);
    resources.military = Math.max(0, resources.military);
    
    // Population can't go below a minimum threshold
    resources.population = Math.max(1000, resources.population);
    
    // Happiness is capped between 0 and 100
    resources.happiness = Math.max(0, Math.min(100, resources.happiness));
    
    // Handle food shortages
    if (resources.food === 0) {
      // Create famine event
      const famineEvent: GameEvent = {
        id: uuidv4(),
        turn: gameState.turn,
        year: gameState.year,
        title: 'Food Shortage',
        description: 'Your city is experiencing a food shortage. Population growth has stopped, and happiness is decreasing.',
        type: EventType.Economic,
        severity: EventSeverity.Danger
      };
      
      gameState.events.unshift(famineEvent);
      resources.happiness -= 15;
      resources.population -= Math.floor(resources.population * 0.05); // 5% population decrease
    }
    
    // Handle very low happiness
    if (resources.happiness < 20) {
      // Chance of civil unrest
      const unrestChance = 0.2 + (0.01 * (20 - resources.happiness));
      
      if (Math.random() < unrestChance) {
        // Create civil unrest event
        const unrestEvent: GameEvent = {
          id: uuidv4(),
          turn: gameState.turn,
          year: gameState.year,
          title: 'Civil Unrest',
          description: 'Your citizens are unhappy and have taken to the streets. Production has decreased.',
          type: EventType.Political,
          severity: EventSeverity.Warning
        };
        
        gameState.events.unshift(unrestEvent);
        
        // Reduce production
        resources.gold -= Math.floor(resources.gold * 0.1);
        resources.food -= Math.floor(resources.food * 0.1);
      }
    }
    
    // Update AI-controlled city-states
    this.updateAICityStates(gameState);
  },
  
  /**
   * Update relationships between city-states
   */
  updateRelationships(gameState: GameState): void {
    // Process each relationship
    gameState.relationships.forEach(relationship => {
      // Wars slowly deteriorate relationships further
      if (relationship.status === RelationshipStatus.War) {
        // Check if there's a chance for peace offer
        const peaceChance = 0.1; // 10% chance per turn
        
        if (Math.random() < peaceChance) {
          // AI city offers peace
          const peaceEvent: GameEvent = {
            id: uuidv4(),
            turn: gameState.turn,
            year: gameState.year,
            title: 'Peace Offer',
            description: `${relationship.cityState} has offered a peace treaty.`,
            type: EventType.Military,
            severity: EventSeverity.Neutral,
            choices: [
              {
                text: 'Accept Peace',
                effects: { happiness: 5 }
              },
              {
                text: 'Reject Offer',
                effects: { military: 50 }
              }
            ]
          };
          
          gameState.events.unshift(peaceEvent);
        }
      }
      
      // Trade agreements improve relationships over time
      if (relationship.treaties.includes('Trade') && 
          relationship.status !== RelationshipStatus.Allied &&
          relationship.status !== RelationshipStatus.War) {
        
        // Small chance to improve relationship
        const improveChance = 0.1; // 10% chance per turn
        
        if (Math.random() < improveChance) {
          if (relationship.status === RelationshipStatus.Neutral) {
            relationship.status = RelationshipStatus.Friendly;
            
            // Create relationship improvement event
            const improvementEvent: GameEvent = {
              id: uuidv4(),
              turn: gameState.turn,
              year: gameState.year,
              title: 'Improved Relations',
              description: `Relations with ${relationship.cityState} have improved to Friendly.`,
              type: EventType.Political,
              severity: EventSeverity.Positive
            };
            
            gameState.events.unshift(improvementEvent);
          } else if (relationship.status === RelationshipStatus.Friendly) {
            // Chance to offer alliance
            const allianceChance = 0.2; // 20% chance if already friendly
            
            if (Math.random() < allianceChance) {
              // Offer alliance
              const allianceEvent: GameEvent = {
                id: uuidv4(),
                turn: gameState.turn,
                year: gameState.year,
                title: 'Alliance Offer',
                description: `${relationship.cityState} has offered an alliance.`,
                type: EventType.Political,
                severity: EventSeverity.Positive,
                choices: [
                  {
                    text: 'Accept Alliance',
                    effects: { happiness: 10 }
                  },
                  {
                    text: 'Decline Politely',
                    effects: {}
                  }
                ]
              };
              
              gameState.events.unshift(allianceEvent);
            }
          }
        }
      }
    });
  },
  
  /**
   * Process government-specific mechanics
   */
  processGovernmentEffects(gameState: GameState): void {
    const playerCity = gameState.playerCityState;
    
    if (playerCity.government === GovernmentType.Democracy) {
      // Democracies have regular elections
      if (gameState.turn % 5 === 0) { // Every 5 turns
        const electionEvent: GameEvent = {
          id: uuidv4(),
          turn: gameState.turn,
          year: gameState.year,
          title: 'Democratic Elections',
          description: 'It is time for elections in your democracy. The citizens are voting on new policies.',
          type: EventType.Political,
          severity: EventSeverity.Neutral,
          choices: [
            {
              text: 'Support economic policies',
              effects: { gold: 100, happiness: 5 }
            },
            {
              text: 'Support military policies',
              effects: { military: 50, happiness: -5 }
            },
            {
              text: 'Support cultural policies',
              effects: { happiness: 15, gold: -50 }
            }
          ]
        };
        
        gameState.events.unshift(electionEvent);
      }
    } else if (playerCity.government === GovernmentType.Oligarchy) {
      // Oligarchies have occasional corruption scandals
      const corruptionChance = 0.1; // 10% chance per turn
      
      if (Math.random() < corruptionChance) {
        const corruptionEvent: GameEvent = {
          id: uuidv4(),
          turn: gameState.turn,
          year: gameState.year,
          title: 'Corruption Scandal',
          description: 'A corruption scandal has been uncovered among the ruling elite.',
          type: EventType.Political,
          severity: EventSeverity.Warning,
          choices: [
            {
              text: 'Cover it up',
              effects: { gold: -100, happiness: -10 }
            },
            {
              text: 'Prosecute the corrupt officials',
              effects: { gold: -50, happiness: 5 }
            }
          ]
        };
        
        gameState.events.unshift(corruptionEvent);
      }
    } else if (playerCity.government === GovernmentType.Tyranny) {
      // Tyrannies face occasional rebellion attempts
      const rebellionChance = 0.05 + (0.01 * (100 - playerCity.resources.happiness)) / 10;
      
      if (Math.random() < rebellionChance) {
        const rebellionEvent: GameEvent = {
          id: uuidv4(),
          turn: gameState.turn,
          year: gameState.year,
          title: 'Rebellion Attempt',
          description: 'A group of citizens has attempted to overthrow your tyrannical rule.',
          type: EventType.Political,
          severity: EventSeverity.Danger,
          choices: [
            {
              text: 'Crush the rebellion with force',
              effects: { military: -50, happiness: -15 }
            },
            {
              text: 'Appease the people with concessions',
              effects: { gold: -200, happiness: 10 }
            }
          ]
        };
        
        gameState.events.unshift(rebellionEvent);
      }
    }
  },
  
  /**
   * Process wars and battles between city-states
   */
  processWars(gameState: GameState): void {
    const warRelationships = gameState.relationships.filter(r => r.status === RelationshipStatus.War);
    
    warRelationships.forEach(relationship => {
      const enemyCity = gameState.otherCityStates.find(city => city.name === relationship.cityState);
      
      if (enemyCity) {
        // Chance of battle
        const battleChance = 0.3; // 30% chance per turn
        
        if (Math.random() < battleChance) {
          // Determine battle outcome based on military strength
          const playerStrength = gameState.playerCityState.resources.military;
          const enemyStrength = enemyCity.resources.military;
          
          // Add some randomness to the outcome
          const playerEffectiveStrength = playerStrength * (0.8 + Math.random() * 0.4); // 80% to 120% of actual strength
          const enemyEffectiveStrength = enemyStrength * (0.8 + Math.random() * 0.4);
          
          let battleOutcome: GameEvent;
          
          if (playerEffectiveStrength > enemyEffectiveStrength) {
            // Player wins
            const strengthRatio = playerEffectiveStrength / enemyEffectiveStrength;
            const enemyLosses = Math.floor(enemyStrength * (0.1 + (strengthRatio * 0.1)));
            const playerLosses = Math.floor(playerStrength * 0.05);
            
            // Update resources
            gameState.playerCityState.resources.military -= playerLosses;
            enemyCity.resources.military -= enemyLosses;
            
            // Capture some gold
            const goldCaptured = Math.floor(enemyCity.resources.gold * 0.1);
            gameState.playerCityState.resources.gold += goldCaptured;
            enemyCity.resources.gold -= goldCaptured;
            
            // Create battle event
            battleOutcome = {
              id: uuidv4(),
              turn: gameState.turn,
              year: gameState.year,
              title: 'Victory in Battle',
              description: `Your forces have defeated ${enemyCity.name} in battle. You lost ${playerLosses} troops but the enemy lost ${enemyLosses}. You captured ${goldCaptured} gold.`,
              type: EventType.Military,
              severity: EventSeverity.Positive
            };
          } else {
            // Enemy wins
            const strengthRatio = enemyEffectiveStrength / playerEffectiveStrength;
            const playerLosses = Math.floor(playerStrength * (0.1 + (strengthRatio * 0.1)));
            const enemyLosses = Math.floor(enemyStrength * 0.05);
            
            // Update resources
            gameState.playerCityState.resources.military -= playerLosses;
            enemyCity.resources.military -= enemyLosses;
            
            // Lose some gold
            const goldLost = Math.floor(gameState.playerCityState.resources.gold * 0.05);
            gameState.playerCityState.resources.gold -= goldLost;
            
            // Create battle event
            battleOutcome = {
              id: uuidv4(),
              turn: gameState.turn,
              year: gameState.year,
              title: 'Defeat in Battle',
              description: `Your forces have been defeated by ${enemyCity.name} in battle. You lost ${playerLosses} troops while the enemy lost ${enemyLosses}. You lost ${goldLost} gold.`,
              type: EventType.Military,
              severity: EventSeverity.Danger
            };
          }
          
          gameState.events.unshift(battleOutcome);
          
          // Check if the war should end due to overwhelming victory/defeat
          if (gameState.playerCityState.resources.military < 100 || enemyCity.resources.military < 100) {
            relationship.status = RelationshipStatus.Hostile;
            
            const peaceEvent: GameEvent = {
              id: uuidv4(),
              turn: gameState.turn,
              year: gameState.year,
              title: 'War Ended',
              description: `The war with ${enemyCity.name} has ended due to one side's inability to continue fighting.`,
              type: EventType.Military,
              severity: EventSeverity.Positive
            };
            
            gameState.events.unshift(peaceEvent);
          }
        }
      }
    });
  },
  
  /**
   * Update AI-controlled city-states
   */
  updateAICityStates(gameState: GameState): void {
    gameState.otherCityStates.forEach(cityState => {
      // Basic resource growth for AI cities
      const resources = cityState.resources;
      
      // Base resource generation (simpler than for the player)
      resources.gold += Math.floor(resources.population / 100);
      resources.food += Math.floor(resources.population / 50);
      resources.population += Math.floor(resources.food / 100);
      resources.military += Math.floor(resources.population / 200);
      
      // Ensure resources don't go below minimums
      resources.gold = Math.max(0, resources.gold);
      resources.food = Math.max(0, resources.food);
      resources.military = Math.max(100, resources.military);
      resources.population = Math.max(1000, resources.population);
      
      // AI decision making - declare war or seek peace based on relative strength
      const relationship = gameState.relationships.find(r => r.cityState === cityState.name);
      
      if (relationship && relationship.status !== RelationshipStatus.War) {
        // Calculate relative strength
        const playerStrength = gameState.playerCityState.resources.military;
        const aiStrength = cityState.resources.military;
        
        // If AI is much stronger and relations are hostile, they might declare war
        if (aiStrength > playerStrength * 1.5 && 
            relationship.status === RelationshipStatus.Hostile && 
            Math.random() < 0.2) { // 20% chance per turn
          
          relationship.status = RelationshipStatus.War;
          
          const warEvent: GameEvent = {
            id: uuidv4(),
            turn: gameState.turn,
            year: gameState.year,
            title: 'War Declared',
            description: `${cityState.name} has declared war on your city-state.`,
            type: EventType.Military,
            severity: EventSeverity.Danger
          };
          
          gameState.events.unshift(warEvent);
        }
      }
    });
  }
};
