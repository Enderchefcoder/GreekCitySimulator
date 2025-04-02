import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';

// Expanded Government Type Enum
type GovernmentType = 'Democracy' | 'Oligarchy' | 'Tyranny' | 'Aristocracy' | 'Timocracy' | 'ConstitutionalMonarchy';

// Values for accessing government types
const GovernmentTypeValues = {
  Democracy: 'Democracy' as GovernmentType,
  Oligarchy: 'Oligarchy' as GovernmentType,
  Tyranny: 'Tyranny' as GovernmentType,
  Aristocracy: 'Aristocracy' as GovernmentType,
  Timocracy: 'Timocracy' as GovernmentType,
  ConstitutionalMonarchy: 'ConstitutionalMonarchy' as GovernmentType
};

interface GovernmentModalProps {
  onClose: () => void;
}

const GovernmentModal: React.FC<GovernmentModalProps> = ({ onClose }) => {
  const { game, changeGovernment } = useGame();

  if (!game) return null;

  const currentGovernment = game.playerCityState.government;

  const handleGovernmentChange = (government: GovernmentType) => {
    if (government !== currentGovernment) {
      changeGovernment(government);
    }
    onClose();
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="bg-[#F5F5DC] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl cinzel font-bold text-[#8B4513]">Change Government</DialogTitle>
        </DialogHeader>

        <div className="my-4">
          <p className="mb-4">
            Choose a new form of government for your city-state. This change will impact how laws are made and may affect resource production and citizen happiness.
          </p>

          <div className="space-y-3">
            <div 
              className={`p-3 rounded border cursor-pointer ${
                currentGovernment === GovernmentTypeValues.Democracy 
                  ? "bg-[#D2B48C] border-[#8B4513]" 
                  : "bg-white border-[#D2B48C] hover:bg-[#f5f5f5]"
              }`}
              onClick={() => handleGovernmentChange(GovernmentTypeValues.Democracy)}
            >
              <div className="font-bold cinzel">{GovernmentTypeValues.Democracy}</div>
              <div className="text-sm text-gray-700">
                Citizens debate and vote on laws every few turns. Happiness grows faster, but decisions are slower.
              </div>
            </div>

            <div 
              className={`p-3 rounded border cursor-pointer ${
                currentGovernment === GovernmentTypeValues.Oligarchy 
                  ? "bg-[#D2B48C] border-[#8B4513]" 
                  : "bg-white border-[#D2B48C] hover:bg-[#f5f5f5]"
              }`}
              onClick={() => handleGovernmentChange(GovernmentTypeValues.Oligarchy)}
            >
              <div className="font-bold cinzel">{GovernmentTypeValues.Oligarchy}</div>
              <div className="text-sm text-gray-700">
                Policies are made behind closed doors by the elite. Economy grows faster, but civil unrest is possible.
              </div>
            </div>

            <div 
              className={`p-3 rounded border cursor-pointer ${
                currentGovernment === GovernmentTypeValues.Tyranny 
                  ? "bg-[#D2B48C] border-[#8B4513]" 
                  : "bg-white border-[#D2B48C] hover:bg-[#f5f5f5]"
              }`}
              onClick={() => handleGovernmentChange(GovernmentTypeValues.Tyranny)}
            >
              <div className="font-bold cinzel">{GovernmentTypeValues.Tyranny}</div>
              <div className="text-sm text-gray-700">
                The ruler enacts laws with absolute power. Military grows faster, but citizen happiness decreases over time.
              </div>
            </div>

            <div 
              className={`p-3 rounded border cursor-pointer ${
                currentGovernment === GovernmentTypeValues.Aristocracy 
                  ? "bg-[#D2B48C] border-[#8B4513]" 
                  : "bg-white border-[#D2B48C] hover:bg-[#f5f5f5]"
              }`}
              onClick={() => handleGovernmentChange(GovernmentTypeValues.Aristocracy)}
            >
              <div className="font-bold cinzel">{GovernmentTypeValues.Aristocracy}</div>
              <div className="text-sm text-gray-700">
                Rule by noble families. Culture and education thrive, but social mobility is limited.
              </div>
            </div>

            <div 
              className={`p-3 rounded border cursor-pointer ${
                currentGovernment === GovernmentTypeValues.Timocracy 
                  ? "bg-[#D2B48C] border-[#8B4513]" 
                  : "bg-white border-[#D2B48C] hover:bg-[#f5f5f5]"
              }`}
              onClick={() => handleGovernmentChange(GovernmentTypeValues.Timocracy)}
            >
              <div className="font-bold cinzel">{GovernmentTypeValues.Timocracy}</div>
              <div className="text-sm text-gray-700">
                Rule by property owners. Economic growth and stability increase, but inequality rises.
              </div>
            </div>

            <div 
              className={`p-3 rounded border cursor-pointer ${
                currentGovernment === GovernmentTypeValues.ConstitutionalMonarchy 
                  ? "bg-[#D2B48C] border-[#8B4513]" 
                  : "bg-white border-[#D2B48C] hover:bg-[#f5f5f5]"
              }`}
              onClick={() => handleGovernmentChange(GovernmentTypeValues.ConstitutionalMonarchy)}
            >
              <div className="font-bold cinzel">Constitutional Monarchy</div>
              <div className="text-sm text-gray-700">
                Balanced rule between monarch and assembly. Provides stability and moderate growth in all areas.
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline"
            className="border-[#8B4513] text-[#8B4513]"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            className="bg-[#8B4513] hover:bg-amber-800 text-white"
            onClick={onClose}
          >
            Keep Current
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GovernmentModal;