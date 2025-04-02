import React from 'react';
import { useGame } from '@/contexts/GameContext';
import { CityStateName } from '@shared/schema';
// Using string instead of importing RelationshipStatus type
type RelationshipStatus = 'Neutral' | 'Friendly' | 'Allied' | 'Hostile' | 'War';

// Values for accessing relationship statuses
const RelationshipStatusValues = {
  Neutral: 'Neutral' as RelationshipStatus,
  Friendly: 'Friendly' as RelationshipStatus,
  Allied: 'Allied' as RelationshipStatus,
  Hostile: 'Hostile' as RelationshipStatus,
  War: 'War' as RelationshipStatus
};

const CityMap: React.FC = () => {
  const { game } = useGame();

  if (!game) return null;

  const getCityColor = (cityName: CityStateName): string => {
    if (cityName === game.playerCityState.name) {
      return '#8B4513'; // Player's city is brown
    }

    const relationship = game.relationships.find(r => r.cityState === cityName);
    if (relationship) {
      switch (relationship.status) {
        case RelationshipStatusValues.Allied:
          return '#4CAF50'; // Green for allies
        case RelationshipStatusValues.Friendly:
          return '#2196F3'; // Blue for friendly
        case RelationshipStatusValues.Hostile:
          return '#FF9800'; // Orange for hostile
        case RelationshipStatusValues.War:
          return '#B71C1C'; // Red for war
        default:
          return '#555'; // Gray for neutral
      }
    }
    
    return '#555'; // Default gray
  };

  const getCitySize = (cityName: CityStateName): number => {
    return cityName === game.playerCityState.name ? 25 : 15;
  };

  // Draw trade routes between player's city and other cities with trade treaties
  const getTradeRoutes = () => {
    if (!game.playerCityState) return null;
    
    const playerCity = game.playerCityState;
    const tradingPartners = game.relationships
      .filter(r => r.treaties.includes('Trade'))
      .map(r => r.cityState);
    
    return (
      <>
        {tradingPartners.map(partnerName => {
          const partnerCity = game.otherCityStates.find(city => city.name === partnerName);
          if (!partnerCity) return null;
          
          return (
            <path
              key={`trade-${partnerName}`}
              d={`M${playerCity.location.x},${playerCity.location.y} L${partnerCity.location.x},${partnerCity.location.y}`}
              stroke="#B8860B"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          );
        })}
      </>
    );
  };

  return (
    <div className="relative w-full" style={{ paddingBottom: '75%' }}>
      <svg
        viewBox="0 0 800 600"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute top-0 left-0 w-full h-full"
      >
        {/* Map Background */}
        <rect x="0" y="0" width="800" height="600" fill="#e8e0cb" />
        
        {/* Seas and rivers */}
        <path d="M0,400 Q400,350 800,400 L800,600 L0,600 Z" fill="#b3cde0" />
        <path d="M350,0 Q300,300 350,600" stroke="#b3cde0" strokeWidth="15" fill="none" />
        
        {/* Land features */}
        <circle cx="200" cy="150" r="50" fill="#c5b358" stroke="#333" strokeWidth="1" />
        <text x="200" y="155" fontFamily="Cinzel" textAnchor="middle" fontSize="12">Mountains</text>
        
        <rect x="500" y="200" width="100" height="80" fill="#7d9f85" stroke="#333" strokeWidth="1" />
        <text x="550" y="245" fontFamily="Cinzel" textAnchor="middle" fontSize="12">Forest</text>
        
        {/* Trade routes */}
        {getTradeRoutes()}
        
        {/* Cities */}
        {/* Player's city */}
        <circle 
          cx={game.playerCityState.location.x} 
          cy={game.playerCityState.location.y} 
          r={getCitySize(game.playerCityState.name)} 
          fill={getCityColor(game.playerCityState.name)} 
          stroke="#000" 
          strokeWidth="2" 
        />
        <text 
          x={game.playerCityState.location.x} 
          y={game.playerCityState.location.y + 5} 
          fontFamily="Cinzel" 
          textAnchor="middle" 
          fill="white" 
          fontSize="12"
        >
          {game.playerCityState.name}
        </text>
        
        {/* Other cities */}
        {game.otherCityStates.map(city => (
          <React.Fragment key={city.id}>
            <circle 
              cx={city.location.x} 
              cy={city.location.y} 
              r={getCitySize(city.name)} 
              fill={getCityColor(city.name)} 
              stroke="#000" 
              strokeWidth="1" 
            />
            <text 
              x={city.location.x} 
              y={city.location.y + 30} 
              fontFamily="Cinzel" 
              textAnchor="middle" 
              fontSize="12"
            >
              {city.name}
            </text>
          </React.Fragment>
        ))}
      </svg>
    </div>
  );
};

export default CityMap;
