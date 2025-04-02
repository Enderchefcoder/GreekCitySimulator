import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';

interface EventModalProps {
  onClose: () => void;
}

const EventModal: React.FC<EventModalProps> = ({ onClose }) => {
  const { game, handleEventChoice } = useGame();

  if (!game) return null;

  // Find the first event with choices
  const eventWithChoices = game.events.find(event => event.choices && event.choices.length > 0);

  if (!eventWithChoices) {
    // If there's no event with choices, show a random recent event instead
    const recentEvent = game.events[0];
    
    return (
      <Dialog open onOpenChange={() => onClose()}>
        <DialogContent className="bg-[#F5F5DC] border-[#D2B48C] event-card max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl cinzel font-bold text-[#8B4513]">{recentEvent.title}</DialogTitle>
          </DialogHeader>
          
          <div className="my-4">{recentEvent.description}</div>
          
          <DialogFooter>
            <Button 
              className="bg-[#8B4513] hover:bg-amber-800 text-white"
              onClick={onClose}
            >
              Acknowledge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
  
  // If there is an event with choices, show the choices
  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="bg-[#F5F5DC] border-[#D2B48C] event-card max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl cinzel font-bold text-[#8B4513]">{eventWithChoices.title}</DialogTitle>
        </DialogHeader>
        
        <div className="my-4">{eventWithChoices.description}</div>
        
        <DialogFooter className="flex-col space-y-2">
          {eventWithChoices.choices?.map((choice, index) => (
            <Button 
              key={index}
              className="w-full bg-[#D2B48C] hover:bg-amber-200 text-[#8B4513] border border-[#8B4513]"
              onClick={() => {
                handleEventChoice(eventWithChoices.id, index);
                onClose();
              }}
            >
              {choice.text}
            </Button>
          ))}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EventModal;
