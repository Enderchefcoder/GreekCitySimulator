// This file creates properly typed values for enums for use in game-engine.ts and similar files
import { 
  GovernmentType, GovernmentTypeValues,
  PolicyCategory, PolicyCategoryValues, 
  EventType, EventTypeValues,
  EventSeverity, EventSeverityValues,
  RelationshipStatus, RelationshipStatusValues
} from '@shared/schema';

// Export enum values for use in other files
export const GovernmentTypes = {
  Democracy: GovernmentTypeValues.Democracy,
  Oligarchy: GovernmentTypeValues.Oligarchy,
  Tyranny: GovernmentTypeValues.Tyranny
};

export const PolicyCategories = {
  Economic: PolicyCategoryValues.Economic,
  Military: PolicyCategoryValues.Military,
  Cultural: PolicyCategoryValues.Cultural,
  Diplomatic: PolicyCategoryValues.Diplomatic
};

export const EventTypes = {
  Political: EventTypeValues.Political,
  Military: EventTypeValues.Military,
  Economic: EventTypeValues.Economic,
  Disaster: EventTypeValues.Disaster,
  Cultural: EventTypeValues.Cultural
};

export const EventSeverities = {
  Positive: EventSeverityValues.Positive,
  Neutral: EventSeverityValues.Neutral,
  Warning: EventSeverityValues.Warning,
  Danger: EventSeverityValues.Danger
};

export const RelationshipStatuses = {
  Neutral: RelationshipStatusValues.Neutral,
  Friendly: RelationshipStatusValues.Friendly,
  Allied: RelationshipStatusValues.Allied,
  Hostile: RelationshipStatusValues.Hostile,
  War: RelationshipStatusValues.War
};