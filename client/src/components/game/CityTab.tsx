import React, { useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import CityMap from '@/components/ui/city-map';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PolicyCategory } from '@shared/schema';
import { v4 as uuidv4 } from 'uuid';

interface CityTabProps {
  onOpenGovernmentModal: () => void;
}

const CityTab: React.FC<CityTabProps> = ({ onOpenGovernmentModal }) => {
  const { game, addPolicy, removePolicy, buildStructure, holdFestival, trainUnits, establishTrade } = useGame();
  const [buildMenuOpen, setBuildMenuOpen] = useState(false);
  
  if (!game) return null;

  const handleBuildStructure = (
    structureName: string, 
    category: PolicyCategory,
    goldCost: number, 
    effects: Record<string, number>
  ) => {
    // Create a new policy representing the structure
    const policy = {
      id: uuidv4(),
      name: structureName,
      description: `This structure provides various bonuses for ${category.toLowerCase()}.`,
      effects,
      category,
      active: true
    };
    
    // Build the structure (deduct costs)
    buildStructure(structureName, { 
      gold: goldCost, 
      food: 0, 
      population: 0, 
      military: 0, 
      happiness: 0 
    });
    
    // Add the policy
    addPolicy(policy);
    
    // Close the build menu
    setBuildMenuOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Map View */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg cinzel font-bold text-[#8B4513] mb-3">City Map</h3>
          <CityMap />
        </CardContent>
      </Card>
      
      {/* City Actions */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg cinzel font-bold text-[#8B4513] mb-3">City Management</h3>
          
          {/* Government Type Area */}
          <div className="mb-4 p-3 bg-[#D2B48C] bg-opacity-30 rounded">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="cinzel font-bold">Government: <span>{game.playerCityState.government}</span></h4>
                <p className="text-sm text-[#333333]">
                  {game.playerCityState.government === 'Democracy' 
                    ? 'In a democracy, citizens vote on new laws every few turns.'
                    : game.playerCityState.government === 'Oligarchy'
                    ? 'In an oligarchy, policies are made behind closed doors by the elite.'
                    : 'In a tyranny, the ruler enacts laws with absolute power.'}
                </p>
              </div>
              <Button 
                className="bg-[#8B4513] hover:bg-amber-800 text-white px-3 py-1 text-sm"
                onClick={onOpenGovernmentModal}
              >
                Change Government
              </Button>
            </div>
          </div>
          
          {/* Available Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button 
              variant="outline"
              className="bg-[#D2B48C] hover:bg-amber-200 p-3 rounded flex items-center justify-start border-[#8B4513]"
              onClick={() => setBuildMenuOpen(!buildMenuOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="text-[#8B4513] mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <div className="text-left">
                <div className="cinzel font-bold">Build Structure</div>
                <div className="text-xs text-[#333333]">Enhance your city with new buildings</div>
              </div>
            </Button>
            
            <Button 
              variant="outline"
              className="bg-[#D2B48C] hover:bg-amber-200 p-3 rounded flex items-center justify-start border-[#8B4513]"
              onClick={holdFestival}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="text-[#8B4513] mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-left">
                <div className="cinzel font-bold">Hold Festival</div>
                <div className="text-xs text-[#333333]">Boost citizen happiness (+15)</div>
              </div>
            </Button>
            
            <Button 
              variant="outline"
              className="bg-[#D2B48C] hover:bg-amber-200 p-3 rounded flex items-center justify-start border-[#8B4513]"
              onClick={() => trainUnits(100, 200)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="text-[#8B4513] mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div className="text-left">
                <div className="cinzel font-bold">Train Military Units</div>
                <div className="text-xs text-[#333333]">Strengthen your army</div>
              </div>
            </Button>
            
            <Button 
              variant="outline"
              className="bg-[#D2B48C] hover:bg-amber-200 p-3 rounded flex items-center justify-start border-[#8B4513]"
              onClick={() => {
                // Find a city-state to trade with that we're not already trading with
                const potentialTradePartner = game.relationships.find(r => 
                  !r.treaties.includes('Trade') && r.status !== 'War'
                );
                
                if (potentialTradePartner) {
                  establishTrade(potentialTradePartner.cityState);
                }
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="text-[#8B4513] mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <div className="text-left">
                <div className="cinzel font-bold">Establish Trade Route</div>
                <div className="text-xs text-[#333333]">Increase income from commerce</div>
              </div>
            </Button>
          </div>
          
          {/* Build Menu */}
          {buildMenuOpen && (
            <div className="mt-4 p-3 border border-[#D2B48C] rounded">
              <h4 className="cinzel font-bold text-[#8B4513] mb-2">Available Structures</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Button 
                  variant="outline"
                  className="justify-start border-[#8B4513] text-[#8B4513] hover:bg-[#D2B48C]"
                  onClick={() => handleBuildStructure(
                    'Agora', 
                    'Economic' as PolicyCategory, 
                    300, 
                    { gold: 20, happiness: 10 }
                  )}
                >
                  <div className="text-left">
                    <div className="font-bold">Agora (300 gold)</div>
                    <div className="text-xs">+20 gold/turn, +10 happiness</div>
                  </div>
                </Button>
                <Button 
                  variant="outline"
                  className="justify-start border-[#8B4513] text-[#8B4513] hover:bg-[#D2B48C]"
                  onClick={() => handleBuildStructure(
                    'Temple', 
                    'Cultural' as PolicyCategory, 
                    250, 
                    { happiness: 25 }
                  )}
                >
                  <div className="text-left">
                    <div className="font-bold">Temple (250 gold)</div>
                    <div className="text-xs">+25 happiness</div>
                  </div>
                </Button>
                <Button 
                  variant="outline"
                  className="justify-start border-[#8B4513] text-[#8B4513] hover:bg-[#D2B48C]"
                  onClick={() => handleBuildStructure(
                    'Barracks', 
                    'Military' as PolicyCategory, 
                    350, 
                    { military: 50 }
                  )}
                >
                  <div className="text-left">
                    <div className="font-bold">Barracks (350 gold)</div>
                    <div className="text-xs">+50 military strength</div>
                  </div>
                </Button>
                <Button 
                  variant="outline"
                  className="justify-start border-[#8B4513] text-[#8B4513] hover:bg-[#D2B48C]"
                  onClick={() => handleBuildStructure(
                    'Farm', 
                    'Economic' as PolicyCategory, 
                    200, 
                    { food: 30 }
                  )}
                >
                  <div className="text-left">
                    <div className="font-bold">Farm (200 gold)</div>
                    <div className="text-xs">+30 food/turn</div>
                  </div>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Current Policies */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg cinzel font-bold text-[#8B4513] mb-3">Active Policies</h3>
          <div className="space-y-2">
            {game.policies.length > 0 ? (
              game.policies.map(policy => (
                <div 
                  key={policy.id} 
                  className={`p-2 border-l-4 bg-[#D2B48C] bg-opacity-20 ${
                    policy.category === 'Economic' 
                      ? 'border-[#B8860B]' 
                      : policy.category === 'Military' 
                      ? 'border-[#FF9800]' 
                      : policy.category === 'Cultural' 
                      ? 'border-[#4CAF50]'
                      : 'border-[#8B4513]'
                  }`}
                >
                  <div className="flex justify-between">
                    <div className="font-bold">{policy.name}</div>
                    <Button 
                      variant="ghost" 
                      className="h-5 w-5 p-0 text-[#8B4513] hover:text-red-500"
                      onClick={() => removePolicy(policy.id)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </Button>
                  </div>
                  <div className="text-sm">{policy.description}</div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                No active policies. Build structures or enact laws to establish policies.
              </div>
            )}
            <Button 
              className="mt-3 w-full bg-[#8B4513] hover:bg-amber-800 text-white p-2 rounded"
              onClick={() => {
                // Open some policy management UI
                // For now just adds a sample policy
                addPolicy({
                  id: uuidv4(),
                  name: 'Fair Taxation',
                  description: 'Moderate income, high citizen happiness',
                  effects: { gold: 10, happiness: 5 },
                  category: 'Economic' as PolicyCategory,
                  active: true
                });
              }}
            >
              Manage Policies
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CityTab;
