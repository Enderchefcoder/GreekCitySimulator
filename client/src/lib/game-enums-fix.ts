// Hard-coded enum values for use in the game
export const GovernmentTypes = {
  Democracy: 'Democracy',
  Oligarchy: 'Oligarchy',
  Tyranny: 'Tyranny'
};

export const PolicyCategories = {
  Economic: 'Economic',
  Military: 'Military',
  Cultural: 'Cultural',
  Diplomatic: 'Diplomatic'
};

export const EventTypes = {
  Political: 'Political',
  Military: 'Military',
  Economic: 'Economic',
  Disaster: 'Disaster',
  Cultural: 'Cultural'
};

export const EventSeverities = {
  Positive: 'Positive',
  Neutral: 'Neutral',
  Warning: 'Warning',
  Danger: 'Danger'
};

export const RelationshipStatuses = {
  Neutral: 'Neutral',
  Friendly: 'Friendly',
  Allied: 'Allied',
  Hostile: 'Hostile',
  War: 'War'
};

// Re-export the types for usage
export type GovernmentType = typeof GovernmentTypes[keyof typeof GovernmentTypes];
export type PolicyCategory = typeof PolicyCategories[keyof typeof PolicyCategories];
export type EventType = typeof EventTypes[keyof typeof EventTypes];
export type EventSeverity = typeof EventSeverities[keyof typeof EventSeverities];
export type RelationshipStatus = typeof RelationshipStatuses[keyof typeof RelationshipStatuses];