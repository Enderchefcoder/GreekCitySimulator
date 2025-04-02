import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';
import { GovernmentType } from '@shared/schema';

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
            Choose a new form of government for your city-state. This change will impact how laws are made and may affect resource production.
          </p>
          
          <div className="space-y-3">
            <div 
              className={`p-3 rounded border cursor-pointer ${
                currentGovernment === GovernmentType.Democracy 
                  ? "bg-[#D2B48C] border-[#8B4513]" 
                  : "bg-white border-[#D2B48C] hover:bg-[#f5f5f5]"
              }`}
              onClick={() => handleGovernmentChange(GovernmentType.Democracy)}
            >
              <div className="font-bold cinzel">{GovernmentType.Democracy}</div>
              <div className="text-sm text-gray-700">
                Citizens debate and vote on laws every few turns. Happiness grows faster, but decisions are slower.
              </div>
            </div>
            
            <div 
              className={`p-3 rounded border cursor-pointer ${
                currentGovernment === GovernmentType.Oligarchy 
                  ? "bg-[#D2B48C] border-[#8B4513]" 
                  : "bg-white border-[#D2B48C] hover:bg-[#f5f5f5]"
              }`}
              onClick={() => handleGovernmentChange(GovernmentType.Oligarchy)}
            >
              <div className="font-bold cinzel">{GovernmentType.Oligarchy}</div>
              <div className="text-sm text-gray-700">
                Policies are made behind closed doors by the elite. Economy grows faster, but civil unrest is possible.
              </div>
            </div>
            
            <div 
              className={`p-3 rounded border cursor-pointer ${
                currentGovernment === GovernmentType.Tyranny 
                  ? "bg-[#D2B48C] border-[#8B4513]" 
                  : "bg-white border-[#D2B48C] hover:bg-[#f5f5f5]"
              }`}
              onClick={() => handleGovernmentChange(GovernmentType.Tyranny)}
            >
              <div className="font-bold cinzel">{GovernmentType.Tyranny}</div>
              <div className="text-sm text-gray-700">
                The ruler enacts laws with absolute power. Military grows faster, but citizen happiness decreases over time.
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
