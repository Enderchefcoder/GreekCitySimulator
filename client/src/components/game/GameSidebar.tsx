import React from 'react';
import { useGame } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { GameEvent } from '@shared/schema';
import { EventSeverities } from '@/lib/game-enums-fix';

interface GameSidebarProps {
  onOpenEventLog: () => void;
  onEventChoice: () => void;
}

const GameSidebar: React.FC<GameSidebarProps> = ({ onOpenEventLog, onEventChoice }) => {
  const { game, endTurn, exportHistory } = useGame();

  if (!game) {
    return <div>Loading...</div>;
  }

  const getSeverityClass = (severity: string): string => {
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
    <div className="w-full lg:w-1/4">
      {/* Turn Information */}
      <div className="bg-[#8B4513] text-[#F5F5DC] rounded-lg shadow-md p-4 mb-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="cinzel font-bold">Turn: <span>{game.turn}</span></h3>
          <span className="text-sm">Year: <span>{game.year} BCE</span></span>
        </div>
        <Button 
          className="w-full bg-[#B8860B] hover:bg-amber-700 text-white py-2 rounded cinzel font-bold"
          onClick={endTurn}
        >
          End Turn
        </Button>
      </div>
      
      {/* Event Log */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg cinzel font-bold text-[#8B4513]">Events</h3>
          <button 
            className="text-[#B8860B] hover:text-amber-700"
            onClick={onOpenEventLog}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg> Full Log
          </button>
        </div>
        
        <div className="max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-[#8B4513] scrollbar-track-[#D2B48C]">
          {game.events.slice(0, 5).map((event: GameEvent) => (
            <div key={event.id} className="event-card mb-3 p-3 rounded border border-[#D2B48C]">
              <div className="flex justify-between">
                <span className="text-xs text-[#333333]">Turn {event.turn}</span>
                <span className="text-xs font-bold text-[#8B4513]">{event.year} BCE</span>
              </div>
              <h4 className={`cinzel font-bold mb-1 ${getSeverityClass(event.severity)}`}>
                {event.title}
              </h4>
              <p className="text-sm">{event.description}</p>
              
              {event.choices && event.choices.length > 0 && (
                <div className="mt-2">
                  <Button 
                    variant="outline" 
                    className="w-full text-sm border-[#8B4513] text-[#8B4513] hover:bg-[#D2B48C]"
                    onClick={onEventChoice}
                  >
                    Make a decision...
                  </Button>
                </div>
              )}
            </div>
          ))}
          
          {game.events.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No events yet. End your turn to begin your journey.
            </div>
          )}
        </div>
        
        <Button 
          className="mt-3 w-full bg-[#D2B48C] hover:bg-amber-200 text-[#8B4513] p-2 rounded border border-[#8B4513] cinzel"
          onClick={exportHistory}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg> Export History
        </Button>
      </div>
    </div>
  );
};

export default GameSidebar;
