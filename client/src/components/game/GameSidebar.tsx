import React from 'react';
import { useGame } from '@/contexts/GameContext';
import { useMultiplayer } from '@/contexts/MultiplayerContext';
import { ResourceTypeValues } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { GameEvent } from '@shared/schema';
import { EventSeverities } from '@/lib/game-enums-fix';
import { saveAs } from 'file-saver';
import { EventLogModal } from './EventLogModal';

interface GameSidebarProps {
}

const GameSidebar: React.FC<GameSidebarProps> = () => {
  const { game, endTurn } = useGame();
  const { session, isMyTurn, actionsRemaining, endTurn: endMultiplayerTurn } = useMultiplayer();
  const [showHappinessDetails, setShowHappinessDetails] = React.useState(false);
  const [isEventLogOpen, setIsEventLogOpen] = React.useState(false);

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

  const handleEndTurn = () => {
    if (session) {
      endMultiplayerTurn();
    } else {
      endTurn();
    }
  };

  const exportHistory = () => {
    const { game } = useGame();
    if (!game) return;

    const historyData = {
      cityState: game.playerCityState.name,
      startYear: game.startYear,
      endYear: game.year,
      turns: game.turn,
      events: game.events,
      resources: game.playerCityState.resources,
      policies: game.playerCityState.policies
    };

    const blob = new Blob([JSON.stringify(historyData, null, 2)], { type: 'application/json' });
    saveAs(blob, `greek-city-history-turn-${game.turn}.json`);
  };

  const handleOpenEventLog = () => {
    setIsEventLogOpen(true);
  };

  const handleCloseEventLog = () => {
    setIsEventLogOpen(false);
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
          onClick={handleEndTurn}
          disabled={session && (!isMyTurn || actionsRemaining > 0)}
        >
          {session 
            ? isMyTurn 
              ? `End Turn (${actionsRemaining} actions left)` 
              : "Waiting for other player" 
            : "End Turn"
          }
        </Button>
      </div>

      {/* Multiplayer status */}
      {session && (
        <div className="mt-4 p-3 bg-[#D2B48C] rounded">
          <h3 className="text-sm font-bold mb-1">Multiplayer Mode</h3>
          <p className="text-xs mb-2">
            {isMyTurn 
              ? `Your turn - ${actionsRemaining} actions remaining` 
              : "Waiting for other player's turn"}
          </p>
          <div className="text-xs">
            Players: {session.players.map(p => p.username).join(', ')}
          </div>
        </div>
      )}

      {/* Event Log */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg cinzel font-bold text-[#8B4513]">Events</h3>
          <button 
            className="text-[#B8860B] hover:text-amber-700"
            onClick={handleOpenEventLog}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
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
            </div>
          ))}
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

      {/* Happiness Section */}
      <div className="bg-white rounded-lg shadow-md p-4 mt-4">
        <div className="flex flex-row justify-between mt-2">
          <div>
            <p className="text-sm">Happiness</p>
          </div>
          <div className="flex items-center">
            <p className="text-sm">{game.playerCityState.resources.happiness.toLocaleString()}</p>
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-1 h-5 w-5 p-0" 
              onClick={() => setShowHappinessDetails(prevState => !prevState)}
            >
              <span className="text-xs">ⓘ</span>
            </Button>
          </div>
        </div>

        {showHappinessDetails && game.playerCityState.resources.happinessFactors && (
          <div className="mt-2 text-xs bg-[#D2B48C] bg-opacity-20 p-2 rounded">
            <h4 className="font-bold mb-1">Happiness Factors:</h4>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
              <div>Taxation:</div>
              <div className={game.playerCityState.resources.happinessFactors.taxationLevel >= 0 ? "text-green-700" : "text-red-700"}>
                {game.playerCityState.resources.happinessFactors.taxationLevel > 0 ? "+" : ""}
                {game.playerCityState.resources.happinessFactors.taxationLevel}
              </div>

              <div>Food Security:</div>
              <div className={game.playerCityState.resources.happinessFactors.foodSecurity >= 0 ? "text-green-700" : "text-red-700"}>
                {game.playerCityState.resources.happinessFactors.foodSecurity > 0 ? "+" : ""}
                {game.playerCityState.resources.happinessFactors.foodSecurity}
              </div>

              <div>Military Presence:</div>
              <div className={game.playerCityState.resources.happinessFactors.militaryPresence >= 0 ? "text-green-700" : "text-red-700"}>
                {game.playerCityState.resources.happinessFactors.militaryPresence > 0 ? "+" : ""}
                {game.playerCityState.resources.happinessFactors.militaryPresence}
              </div>

              <div>Culture:</div>
              <div className="text-green-700">
                +{game.playerCityState.resources.happinessFactors.culturalInvestment}
              </div>

              <div>War Weariness:</div>
              <div className={game.playerCityState.resources.happinessFactors.warWeariness >= 0 ? "text-green-700" : "text-red-700"}>
                {game.playerCityState.resources.happinessFactors.warWeariness}
              </div>

              <div>Political Stability:</div>
              <div className={game.playerCityState.resources.happinessFactors.politicalStability >= 0 ? "text-green-700" : "text-red-700"}>
                {game.playerCityState.resources.happinessFactors.politicalStability > 0 ? "+" : ""}
                {game.playerCityState.resources.happinessFactors.politicalStability}
              </div>

              <div>Recent Events:</div>
              <div className={game.playerCityState.resources.happinessFactors.recentEvents >= 0 ? "text-green-700" : "text-red-700"}>
                {game.playerCityState.resources.happinessFactors.recentEvents > 0 ? "+" : ""}
                {game.playerCityState.resources.happinessFactors.recentEvents}
              </div>
            </div>
          </div>
        )}
      </div>

      <EventLogModal 
        open={isEventLogOpen} 
        onOpenChange={handleCloseEventLog} 
      />
    </div>
  );
};

export default GameSidebar;