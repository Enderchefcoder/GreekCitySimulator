import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';
import { EventSeverity, GameEvent } from '@shared/schema';

interface EventLogModalProps {
  onClose: () => void;
}

const EventLogModal: React.FC<EventLogModalProps> = ({ onClose }) => {
  const { game, exportHistory } = useGame();

  if (!game) return null;

  // Group events by year
  const eventsByYear: Record<number, GameEvent[]> = {};
  game.events.forEach(event => {
    if (!eventsByYear[event.year]) {
      eventsByYear[event.year] = [];
    }
    eventsByYear[event.year].push(event);
  });

  // Sort years in descending order (most recent first)
  const sortedYears = Object.keys(eventsByYear)
    .map(Number)
    .sort((a, b) => b - a);

  const getSeverityClass = (severity: EventSeverity): string => {
    switch (severity) {
      case 'Positive':
        return 'text-[#4CAF50]';
      case 'Neutral':
        return '';
      case 'Warning':
        return 'text-[#FF9800]';
      case 'Danger':
        return 'text-[#B71C1C]';
      default:
        return '';
    }
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="bg-[#F5F5DC] max-w-4xl h-[75vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl cinzel font-bold text-[#8B4513]">City History</DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto flex-grow pr-2">
          {sortedYears.map(year => (
            <div key={year} className="mb-6">
              <h4 className="text-lg cinzel text-[#8B4513] border-b border-[#B8860B] pb-1 mb-3">
                {year} BCE
              </h4>
              
              {/* Sort events within each year by turn (descending) */}
              {eventsByYear[year]
                .sort((a, b) => b.turn - a.turn)
                .map(event => (
                  <div key={event.id} className="event-card mb-3 p-3 rounded border border-[#D2B48C]">
                    <div className="flex justify-between">
                      <span className="text-xs text-[#333333]">Turn {event.turn}</span>
                      <span className="text-xs font-bold text-[#8B4513]">{event.year} BCE</span>
                    </div>
                    <h4 className={`cinzel font-bold mb-1 ${getSeverityClass(event.severity)}`}>
                      {event.title}
                    </h4>
                    <p className="text-sm">{event.description}</p>
                  </div>
                ))}
            </div>
          ))}
          
          {sortedYears.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No historical events recorded yet.
            </div>
          )}
        </div>
        
        <DialogFooter className="mt-4 flex justify-between">
          <Button 
            variant="outline"
            className="bg-[#D2B48C] hover:bg-amber-200 text-[#8B4513] border border-[#8B4513] cinzel"
            onClick={exportHistory}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg> Export Full History
          </Button>
          <Button 
            className="bg-[#8B4513] hover:bg-amber-800 text-white cinzel"
            onClick={onClose}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EventLogModal;
