import React from 'react';
import { useGame } from '@/contexts/GameContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RelationshipStatus } from '@shared/schema';

const MilitaryTab: React.FC = () => {
  const { game, trainUnits } = useGame();
  
  if (!game) return null;

  const militaryStrength = game.playerCityState.resources.military;

  // Calculate the relative strength of the player compared to other city-states
  const getRelativeStrength = (opponentStrength: number): string => {
    const ratio = militaryStrength / opponentStrength;
    
    if (ratio > 1.5) return 'Much Stronger';
    if (ratio > 1.1) return 'Stronger';
    if (ratio > 0.9) return 'Even';
    if (ratio > 0.6) return 'Weaker';
    return 'Much Weaker';
  };

  // Get color based on relative strength
  const getStrengthColor = (opponentStrength: number): string => {
    const ratio = militaryStrength / opponentStrength;
    
    if (ratio > 1.5) return 'text-[#4CAF50]';
    if (ratio > 1.1) return 'text-[#8BC34A]';
    if (ratio > 0.9) return 'text-[#FFC107]';
    if (ratio > 0.6) return 'text-[#FF9800]';
    return 'text-[#F44336]';
  };

  // Get progress value based on relative strength
  const getStrengthProgress = (opponentStrength: number): number => {
    const ratio = militaryStrength / opponentStrength;
    return Math.min(Math.round(ratio * 100), 100);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg cinzel font-bold text-[#8B4513] mb-3">Military Overview</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="p-3 border rounded">
              <h4 className="font-bold mb-1">Military Strength</h4>
              <div className="text-3xl font-bold text-[#8B4513]">{militaryStrength}</div>
              <div className="text-sm text-gray-600">Soldiers in your army</div>
            </div>
            
            <div className="p-3 border rounded">
              <h4 className="font-bold mb-1">Training Rate</h4>
              <div className="text-3xl font-bold text-[#8B4513]">+20</div>
              <div className="text-sm text-gray-600">New soldiers per turn</div>
            </div>
          </div>
          
          <div className="mb-4">
            <h4 className="font-bold mb-2">Active Conflicts</h4>
            {game.relationships.filter(r => r.status === RelationshipStatus.War).length > 0 ? (
              <div className="space-y-2">
                {game.relationships
                  .filter(r => r.status === RelationshipStatus.War)
                  .map(relationship => {
                    const enemyCity = game.otherCityStates.find(city => city.name === relationship.cityState);
                    if (!enemyCity) return null;
                    
                    return (
                      <div key={relationship.cityState} className="p-2 border-l-4 border-[#B71C1C] bg-red-50">
                        <div className="font-bold">War with {relationship.cityState}</div>
                        <div className="text-sm">Enemy strength: {enemyCity.resources.military}</div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="text-center py-3 text-gray-500 bg-gray-50 rounded">
                Not currently at war with any city-state.
              </div>
            )}
          </div>
          
          <div>
            <h4 className="font-bold mb-2">Military Training Options</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button 
                variant="outline"
                className="bg-[#D2B48C] hover:bg-amber-200 p-3 rounded flex items-center justify-start border-[#8B4513] h-auto"
                onClick={() => trainUnits(100, 200)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="text-[#8B4513] mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <div className="text-left">
                  <div className="cinzel font-bold">Train Infantry (200 gold)</div>
                  <div className="text-xs text-[#333333]">+100 military strength</div>
                </div>
              </Button>
              
              <Button 
                variant="outline"
                className="bg-[#D2B48C] hover:bg-amber-200 p-3 rounded flex items-center justify-start border-[#8B4513] h-auto"
                onClick={() => trainUnits(30, 150)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="text-[#8B4513] mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <div className="text-left">
                  <div className="cinzel font-bold">Train Cavalry (150 gold)</div>
                  <div className="text-xs text-[#333333]">+30 military strength, faster units</div>
                </div>
              </Button>
              
              <Button 
                variant="outline"
                className="bg-[#D2B48C] hover:bg-amber-200 p-3 rounded flex items-center justify-start border-[#8B4513] h-auto"
                onClick={() => trainUnits(50, 300)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="text-[#8B4513] mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <div className="text-left">
                  <div className="cinzel font-bold">Train Archers (300 gold)</div>
                  <div className="text-xs text-[#333333]">+50 military strength, ranged capability</div>
                </div>
              </Button>
              
              <Button 
                variant="outline"
                className="bg-[#D2B48C] hover:bg-amber-200 p-3 rounded flex items-center justify-start border-[#8B4513] h-auto"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="text-[#8B4513] mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                </svg>
                <div className="text-left">
                  <div className="cinzel font-bold">Upgrade Equipment</div>
                  <div className="text-xs text-[#333333]">Increase effectiveness of all units</div>
                </div>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg cinzel font-bold text-[#8B4513] mb-3">Military Comparison</h3>
          
          <div className="space-y-4">
            {game.otherCityStates.map(city => {
              const relationship = game.relationships.find(r => r.cityState === city.name);
              
              return (
                <div key={city.id} className="border rounded p-3">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold cinzel">{city.name}</h4>
                    <span className={`font-bold ${
                      relationship?.status === RelationshipStatus.War 
                        ? 'text-[#B71C1C]' 
                        : 'text-gray-500'
                    }`}>
                      {relationship?.status}
                    </span>
                  </div>
                  
                  <div className="mb-2">
                    <div className="flex justify-between">
                      <span>Military Strength: <b>{city.resources.military}</b></span>
                      <span className={getStrengthColor(city.resources.military)}>
                        {getRelativeStrength(city.resources.military)}
                      </span>
                    </div>
                    <Progress value={getStrengthProgress(city.resources.military)} className="h-2 mt-1" />
                  </div>
                  
                  <div className="flex space-x-2 mt-3">
                    {relationship?.status !== RelationshipStatus.War ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-[#B71C1C] border-[#B71C1C] hover:bg-red-100"
                      >
                        Declare War
                      </Button>
                    ) : (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-[#B71C1C] hover:bg-red-100"
                        >
                          Attack
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-[#4CAF50] border-[#4CAF50] hover:bg-green-100"
                        >
                          Sue for Peace
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MilitaryTab;
