import React, { useState, useEffect } from 'react';
import { useGame } from '@/contexts/GameContext';
import { useMultiplayer } from '@/contexts/MultiplayerContext';
import GameBoard from './GameBoard';
import GameSidebar from './GameSidebar';
import GovernmentModal from './GovernmentModal';
import EventModal from './EventModal';
import EventLogModal from './EventLogModal';
import MultiplayerModal from './MultiplayerModal';
import { Button } from '@/components/ui/button';
import { CityStateName } from '@shared/schema';
import { GovernmentType } from '@shared/schema'; //Corrected import
import { Card, CardContent } from '@/components/ui/card'; //Added Card import


const GameContainer: React.FC = () => {
  const { game, startNewGame, loading } = useGame();
  const [showEventModal, setShowEventModal] = useState<boolean>(false);
  const [showEventLogModal, setShowEventLogModal] = useState<boolean>(false);
  const [showGovernmentModal, setShowGovernmentModal] = useState<boolean>(false);
  const [showMultiplayerModal, setShowMultiplayerModal] = useState<boolean>(false);
  const [newGameSetup, setNewGameSetup] = useState<boolean>(true);
  const [selectedCity, setSelectedCity] = useState<CityStateName>('Athens' as CityStateName);
  const [selectedGovernment, setSelectedGovernment] = useState<GovernmentType>('Democracy' as GovernmentType);
  const { session, isMyTurn, actionsRemaining, endTurn } = useMultiplayer();

  useEffect(() => {
    // Check if there's an active game
    if (game) {
      setNewGameSetup(false);
    }
  }, [game]);

  const handleStartNewGame = () => {
    startNewGame(selectedCity, selectedGovernment);
  };

  if (newGameSetup) {
    return (
      <div className="min-h-screen bg-[#F5F5DC] flex flex-col">
        {/* Header */}
        <header className="bg-[#8B4513] text-[#F5F5DC] p-4 greek-border">
          <div className="container mx-auto">
            <h1 className="text-2xl md:text-3xl cinzel font-bold">Greek City-State Simulator</h1>
          </div>
        </header>

        {/* Setup Screen */}
        <main className="flex-grow container mx-auto p-4 flex justify-center items-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h2 className="text-2xl cinzel font-bold text-[#8B4513] mb-6">Found Your City-State</h2>

              <div className="mb-6">
                <h3 className="cinzel font-bold text-[#8B4513] mb-2">Choose Your City</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {(['Athens', 'Sparta', 'Thebes', 'Corinth', 'Megara', 'Argos'] as const).map((city) => (
                    <Button
                      key={city}
                      variant={selectedCity === city ? "default" : "outline"}
                      className={selectedCity === city 
                        ? "bg-[#8B4513] hover:bg-[#6a340f] text-white border-[#8B4513]" 
                        : "border-[#8B4513] text-[#8B4513]"}
                      onClick={() => setSelectedCity(city as CityStateName)}
                    >
                      {city}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="cinzel font-bold text-[#8B4513] mb-2">Choose Your Government</h3>
                <div className="space-y-2">
                  {(['Democracy', 'Oligarchy', 'Tyranny', 'Aristocracy', 'Timocracy', 'Constitutional Monarchy'] as const).map((govt) => (
                    <div 
                      key={govt}
                      className={`p-3 rounded border cursor-pointer ${
                        selectedGovernment === govt 
                          ? "bg-[#D2B48C] border-[#8B4513]" 
                          : "bg-white border-[#D2B48C] hover:bg-[#f5f5f5]"
                      }`}
                      onClick={() => setSelectedGovernment(govt as GovernmentType)}
                    >
                      <div className="font-bold cinzel">{govt}</div>
                      <div className="text-sm text-gray-700">
                        {govt === 'Democracy'
                          ? "Citizens debate and vote on laws every few turns."
                          : govt === 'Oligarchy'
                          ? "Policies are made behind closed doors by the elite."
                          : "The ruler enacts laws with absolute power."
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                className="w-full bg-[#8B4513] hover:bg-[#6a340f] text-white"
                onClick={handleStartNewGame}
                disabled={loading}
              >
                {loading ? "Starting..." : "Begin Your Rule"}
              </Button>
            </CardContent>
          </Card>
        </main>

        {/* Footer */}
        <footer className="bg-[#8B4513] text-[#F5F5DC] p-3 text-center">
          <p className="text-sm">Greek City-State Simulator</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5DC] flex flex-col">
      {/* Header */}
      <header className="bg-[#8B4513] text-[#F5F5DC] p-4 greek-border">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl cinzel font-bold">Greek City-State Simulator</h1>
          <div className="flex space-x-2">
            <Button 
              className="bg-[#B8860B] hover:bg-amber-700 text-white px-3 py-1 flex items-center"
              onClick={() => {
                // This will be implemented later
                console.log('Save game functionality will be added');
              }}
            >
              <i className="fas fa-save mr-1"></i> Save
            </Button>
            <Button onClick={() => setShowMultiplayerModal(true)} className="bg-[#333333] hover:bg-gray-700 text-white px-3 py-1">
              <i className="fas fa-users"></i> Multiplayer
            </Button>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-grow container mx-auto p-4 flex flex-col lg:flex-row">
        <GameBoard onOpenGovernmentModal={() => setShowGovernmentModal(true)} />
        <GameSidebar 
          onOpenEventLog={() => setShowEventLogModal(true)} 
          onEventChoice={() => setShowEventModal(true)}
        />
      </main>

      {/* Footer */}
      <footer className="bg-[#8B4513] text-[#F5F5DC] p-3 text-center">
        <p className="text-sm">Greek City-State Simulator</p>
      </footer>

      {/* Modals */}
      <GovernmentModal
        open={showGovernmentModal}
        onOpenChange={setShowGovernmentModal}
        currentGovernment={game.playerCityState.government}
        //onChangeGovernment={handleGovernmentChange}  //This function is not defined in the original code
      />

      <EventModal
        open={!!game?.event} //Added safety check for game?.event
        onOpenChange={() => game && game.setEvent(null)} //Added safety check and used game.setEvent if available
        event={game?.event} //Added safety check
        //onMakeChoice={handleEventChoice} //This function is not defined in the original code
      />

      <EventLogModal 
        open={showEventLogModal}
        onOpenChange={setShowEventLogModal}
        events={game?.events || []} //Added safety check and default empty array
      />

      <MultiplayerModal
        open={showMultiplayerModal}
        onOpenChange={setShowMultiplayerModal}
      />
    </div>
  );
};

export default GameContainer;