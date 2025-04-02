import React, { useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
// Local type definition instead of import
type PolicyCategory = 'Economic' | 'Military' | 'Cultural' | 'Diplomatic';

// Values for accessing policy categories
const PolicyCategoryValues = {
  Economic: 'Economic' as PolicyCategory,
  Military: 'Military' as PolicyCategory,
  Cultural: 'Cultural' as PolicyCategory,
  Diplomatic: 'Diplomatic' as PolicyCategory
};
import { v4 as uuidv4 } from 'uuid';

const EconomyTab: React.FC = () => {
  const { game, addPolicy, removePolicy } = useGame();
  const [taxRate, setTaxRate] = useState<number>(10); // Default 10% tax rate
  
  if (!game) return null;

  const calculateIncome = () => {
    const baseIncome = Math.floor(game.playerCityState.resources.population / 10);
    const taxMultiplier = taxRate / 100;
    return Math.floor(baseIncome * taxMultiplier);
  };

  const calculateFoodProduction = () => {
    // Base food production is population / 10 * some multiplier
    const baseProduction = Math.floor(game.playerCityState.resources.population / 20);
    
    // Add bonuses from policies
    const farmPolicies = game.policies.filter(
      p => p.category === PolicyCategoryValues.Economic && p.effects.food
    );
    
    const policyBonus = farmPolicies.reduce(
      (total, policy) => total + (policy.effects.food || 0), 
      0
    );
    
    return baseProduction + policyBonus;
  };

  const calculateHappinessEffect = () => {
    if (taxRate <= 5) return 5; // Very low taxes make people happy
    if (taxRate <= 10) return 0; // Standard tax rate, neutral effect
    if (taxRate <= 15) return -5; // Higher taxes slightly reduce happiness
    if (taxRate <= 25) return -10; // High taxes reduce happiness more
    return -20; // Very high taxes cause significant unhappiness
  };

  const applyTaxPolicy = () => {
    // Remove any existing tax policies
    const existingTaxPolicy = game.policies.find(p => 
      p.name.includes('Taxation') && p.category === PolicyCategoryValues.Economic
    );
    
    if (existingTaxPolicy) {
      removePolicy(existingTaxPolicy.id);
    }
    
    // Determine tax policy name based on rate
    let policyName: string;
    let policyDescription: string;
    
    if (taxRate <= 5) {
      policyName = 'Minimal Taxation';
      policyDescription = 'Very low taxes, high citizen happiness, low income';
    } else if (taxRate <= 10) {
      policyName = 'Fair Taxation';
      policyDescription = 'Moderate taxes, neutral happiness effect, balanced income';
    } else if (taxRate <= 15) {
      policyName = 'Standard Taxation';
      policyDescription = 'Standard tax rate, slight happiness penalty, good income';
    } else if (taxRate <= 25) {
      policyName = 'Heavy Taxation';
      policyDescription = 'High taxes, reduced happiness, excellent income';
    } else {
      policyName = 'Oppressive Taxation';
      policyDescription = 'Very high taxes, significantly reduced happiness, maximum income';
    }
    
    // Create the new tax policy
    const taxPolicy = {
      id: uuidv4(),
      name: policyName,
      description: policyDescription,
      effects: { 
        gold: calculateIncome(),
        happiness: calculateHappinessEffect()
      },
      category: PolicyCategoryValues.Economic,
      active: true
    };
    
    addPolicy(taxPolicy);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg cinzel font-bold text-[#8B4513] mb-3">Economic Overview</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="p-3 border rounded">
              <h4 className="font-bold mb-1">Treasury</h4>
              <div className="text-3xl font-bold text-[#8B4513]">{game.playerCityState.resources.gold}</div>
              <div className="text-sm text-gray-600">Current gold reserves</div>
            </div>
            
            <div className="p-3 border rounded">
              <h4 className="font-bold mb-1">Income</h4>
              <div className="text-3xl font-bold text-[#8B4513]">+{calculateIncome()}</div>
              <div className="text-sm text-gray-600">Gold per turn</div>
            </div>
            
            <div className="p-3 border rounded">
              <h4 className="font-bold mb-1">Food Production</h4>
              <div className="text-3xl font-bold text-[#8B4513]">+{calculateFoodProduction()}</div>
              <div className="text-sm text-gray-600">Food per turn</div>
            </div>
          </div>
          
          <div className="mb-6">
            <h4 className="font-bold mb-3">Trade Status</h4>
            
            {game.relationships.filter(r => r.treaties.includes('Trade')).length > 0 ? (
              <div className="space-y-2">
                {game.relationships
                  .filter(r => r.treaties.includes('Trade'))
                  .map(relationship => (
                    <div key={relationship.cityState} className="p-2 border-l-4 border-[#B8860B] bg-amber-50">
                      <div className="font-bold">Trade with {relationship.cityState}</div>
                      <div className="text-sm">+50 gold per turn</div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-3 text-gray-500 bg-gray-50 rounded">
                No active trade agreements. Establish trade routes to increase income.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg cinzel font-bold text-[#8B4513] mb-3">Taxation Policy</h3>
          
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="font-bold">Tax Rate: {taxRate}%</span>
              <span className={
                taxRate <= 5 
                  ? "text-[#4CAF50]" 
                  : taxRate <= 15 
                  ? "text-[#8B4513]" 
                  : "text-[#B71C1C]"
              }>
                {taxRate <= 5 
                  ? "Very Low" 
                  : taxRate <= 10 
                  ? "Low" 
                  : taxRate <= 15 
                  ? "Standard" 
                  : taxRate <= 25 
                  ? "High" 
                  : "Very High"}
              </span>
            </div>
            
            <Slider 
              value={[taxRate]} 
              min={1} 
              max={30} 
              step={1} 
              onValueChange={(value) => setTaxRate(value[0])}
              className="mb-4"
            />
            
            <div className="flex justify-between text-sm text-gray-500">
              <span>Low</span>
              <span>Medium</span>
              <span>High</span>
            </div>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 border rounded">
                <h4 className="font-bold mb-1">Income at {taxRate}%</h4>
                <div className="text-2xl font-bold text-[#8B4513]">+{calculateIncome()} gold</div>
                <div className="text-sm text-gray-600">Per turn from taxation</div>
              </div>
              
              <div className="p-3 border rounded">
                <h4 className="font-bold mb-1">Happiness Effect</h4>
                <div className={`text-2xl font-bold ${
                  calculateHappinessEffect() > 0 
                    ? "text-[#4CAF50]" 
                    : calculateHappinessEffect() < 0 
                    ? "text-[#B71C1C]" 
                    : "text-[#8B4513]"
                }`}>
                  {calculateHappinessEffect() > 0 ? "+" : ""}{calculateHappinessEffect()}
                </div>
                <div className="text-sm text-gray-600">Happiness per turn</div>
              </div>
            </div>
            
            <Button 
              className="w-full mt-4 bg-[#8B4513] hover:bg-amber-800 text-white"
              onClick={applyTaxPolicy}
            >
              Apply Tax Rate
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg cinzel font-bold text-[#8B4513] mb-3">Economic Actions</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button 
              variant="outline"
              className="bg-[#D2B48C] hover:bg-amber-200 p-3 rounded flex items-center justify-start border-[#8B4513] h-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="text-[#8B4513] mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div className="text-left">
                <div className="cinzel font-bold">Focus on Agriculture</div>
                <div className="text-xs text-[#333333]">+20% food production, -10% military recruitment</div>
              </div>
            </Button>
            
            <Button 
              variant="outline"
              className="bg-[#D2B48C] hover:bg-amber-200 p-3 rounded flex items-center justify-start border-[#8B4513] h-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="text-[#8B4513] mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <div className="text-left">
                <div className="cinzel font-bold">Market Expansion</div>
                <div className="text-xs text-[#333333]">+15% gold from trade, costs 300 gold</div>
              </div>
            </Button>
            
            <Button 
              variant="outline"
              className="bg-[#D2B48C] hover:bg-amber-200 p-3 rounded flex items-center justify-start border-[#8B4513] h-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="text-[#8B4513] mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <div className="text-left">
                <div className="cinzel font-bold">Store Food Reserves</div>
                <div className="text-xs text-[#333333]">Protection against famine, costs 200 food</div>
              </div>
            </Button>
            
            <Button 
              variant="outline"
              className="bg-[#D2B48C] hover:bg-amber-200 p-3 rounded flex items-center justify-start border-[#8B4513] h-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="text-[#8B4513] mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
              <div className="text-left">
                <div className="cinzel font-bold">Secure Treasury</div>
                <div className="text-xs text-[#333333]">Protection against theft, costs 150 gold</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EconomyTab;
