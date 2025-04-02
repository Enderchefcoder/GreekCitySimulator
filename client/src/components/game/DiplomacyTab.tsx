import React from 'react';
import { useGame } from '@/contexts/GameContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// Using string instead of importing RelationshipStatus type
type RelationshipStatus = string;

const DiplomacyTab: React.FC = () => {
  const { game, declareWar, makePeace, establishTrade } = useGame();
  
  if (!game) return null;

  const getRelationshipColor = (status: RelationshipStatus): string => {
    switch (status) {
      case 'Allied':
        return 'text-[#4CAF50]';
      case 'Friendly':
        return 'text-[#2196F3]';
      case 'Hostile':
        return 'text-[#FF9800]';
      case 'War':
        return 'text-[#B71C1C]';
      default:
        return 'text-[#333333]';
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg cinzel font-bold text-[#8B4513] mb-3">Diplomatic Relations</h3>
          
          <p className="mb-4 text-sm">
            Manage your relationships with other city-states. Form alliances, declare war, or establish trade routes to increase your influence.
          </p>
          
          <div className="space-y-4">
            {game.relationships.map(relationship => {
              const cityState = game.otherCityStates.find(city => city.name === relationship.cityState);
              if (!cityState) return null;
              
              return (
                <div key={relationship.cityState} className="border rounded p-3">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold cinzel">{relationship.cityState}</h4>
                    <span className={`font-bold ${getRelationshipColor(relationship.status)}`}>
                      {relationship.status}
                    </span>
                  </div>
                  
                  {/* Government and strength indicators */}
                  <div className="mb-2 text-sm">
                    <p>Government: <span className="font-semibold">{cityState.government}</span></p>
                    <p>Military Strength: <span className="font-semibold">{cityState.resources.military}</span></p>
                  </div>
                  
                  {/* Active treaties */}
                  {relationship.treaties.length > 0 && (
                    <div className="mb-2">
                      <p className="text-sm font-semibold">Active Treaties:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {relationship.treaties.map(treaty => (
                          <span key={treaty} className="text-xs bg-[#D2B48C] px-2 py-1 rounded">
                            {treaty}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {relationship.status !== 'War' ? (
                      <Button 
                        variant="outline"
                        size="sm"
                        className="text-[#B71C1C] border-[#B71C1C] hover:bg-red-100"
                        onClick={() => declareWar(relationship.cityState)}
                      >
                        Declare War
                      </Button>
                    ) : (
                      <Button 
                        variant="outline"
                        size="sm"
                        className="text-[#4CAF50] border-[#4CAF50] hover:bg-green-100"
                        onClick={() => makePeace(relationship.cityState)}
                      >
                        Make Peace
                      </Button>
                    )}
                    
                    {relationship.status !== 'War' && (
                      <>
                        {!relationship.treaties.includes('Trade') && (
                          <Button 
                            variant="outline"
                            size="sm"
                            className="text-[#B8860B] border-[#B8860B] hover:bg-amber-100"
                            onClick={() => establishTrade(relationship.cityState)}
                          >
                            Establish Trade
                          </Button>
                        )}
                        
                        {relationship.status !== 'Allied' && (
                          <Button 
                            variant="outline"
                            size="sm"
                            className="text-[#2196F3] border-[#2196F3] hover:bg-blue-100"
                          >
                            Propose Alliance
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg cinzel font-bold text-[#8B4513] mb-3">Diplomatic Actions</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button 
              variant="outline"
              className="bg-[#D2B48C] hover:bg-amber-200 p-3 rounded flex items-center justify-start border-[#8B4513] h-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="text-[#8B4513] mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
              <div className="text-left">
                <div className="cinzel font-bold">Send Emissary</div>
                <div className="text-xs text-[#333333]">Improve relations with a city-state</div>
              </div>
            </Button>
            
            <Button 
              variant="outline"
              className="bg-[#D2B48C] hover:bg-amber-200 p-3 rounded flex items-center justify-start border-[#8B4513] h-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="text-[#8B4513] mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-left">
                <div className="cinzel font-bold">Gather Intelligence</div>
                <div className="text-xs text-[#333333]">Learn about other city-states</div>
              </div>
            </Button>
            
            <Button 
              variant="outline"
              className="bg-[#D2B48C] hover:bg-amber-200 p-3 rounded flex items-center justify-start border-[#8B4513] h-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="text-[#8B4513] mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 11V9a2 2 0 00-2-2m2 4v4a2 2 0 104 0v-1m-4-3H9m2 0h4m6 1a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-left">
                <div className="cinzel font-bold">Send Gift</div>
                <div className="text-xs text-[#333333]">Spend gold to improve relations</div>
              </div>
            </Button>
            
            <Button 
              variant="outline"
              className="bg-[#D2B48C] hover:bg-amber-200 p-3 rounded flex items-center justify-start border-[#8B4513] h-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="text-[#8B4513] mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <div className="text-left">
                <div className="cinzel font-bold">Threaten</div>
                <div className="text-xs text-[#333333]">Intimidate a weaker city-state</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DiplomacyTab;
