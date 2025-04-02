
import React, { useState } from 'react';
import { useMultiplayer } from '@/contexts/MultiplayerContext';
import { useGame } from '@/contexts/GameContext';
import { CityStateName } from '@shared/schema';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

interface MultiplayerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MultiplayerModal: React.FC<MultiplayerModalProps> = ({ open, onOpenChange }) => {
  const { game } = useGame();
  const { 
    createSession, 
    joinSession, 
    session, 
    isMyTurn, 
    actionsRemaining 
  } = useMultiplayer();
  
  const [activeTab, setActiveTab] = useState<string>('create');
  const [sessionId, setSessionId] = useState<string>('');
  const [cityState, setCityState] = useState<CityStateName>(game?.playerCityState.name || 'Athens');
  
  const handleCreateSession = async () => {
    if (!game) {
      toast({
        title: "Cannot create session",
        description: "No active game found",
        variant: "destructive",
      });
      return;
    }
    
    const result = await createSession(game.id, cityState);
    if (result) {
      onOpenChange(false);
    }
  };
  
  const handleJoinSession = async () => {
    if (!sessionId) {
      toast({
        title: "Cannot join session",
        description: "Please enter a session ID",
        variant: "destructive",
      });
      return;
    }
    
    const result = await joinSession(sessionId, cityState);
    if (result) {
      onOpenChange(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="cinzel text-center">LAN Multiplayer</DialogTitle>
          <DialogDescription className="text-center">
            Play with others on your local network in turn-based mode
          </DialogDescription>
        </DialogHeader>
        
        {!session ? (
          <Tabs defaultValue="create" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">Create Game</TabsTrigger>
              <TabsTrigger value="join">Join Game</TabsTrigger>
            </TabsList>
            
            <TabsContent value="create" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="city-state">Choose Your City-State</Label>
                <select 
                  id="city-state"
                  className="w-full p-2 border rounded"
                  value={cityState}
                  onChange={(e) => setCityState(e.target.value as CityStateName)}
                >
                  <option value="Athens">Athens</option>
                  <option value="Sparta">Sparta</option>
                  <option value="Thebes">Thebes</option>
                  <option value="Corinth">Corinth</option>
                  <option value="Megara">Megara</option>
                  <option value="Argos">Argos</option>
                </select>
              </div>
              
              <Button 
                onClick={handleCreateSession} 
                className="w-full bg-[#8B4513] hover:bg-amber-800"
              >
                Create Multiplayer Session
              </Button>
            </TabsContent>
            
            <TabsContent value="join" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="session-id">Session ID</Label>
                <Input
                  id="session-id"
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  placeholder="Enter session ID"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="city-state-join">Choose Your City-State</Label>
                <select 
                  id="city-state-join"
                  className="w-full p-2 border rounded"
                  value={cityState}
                  onChange={(e) => setCityState(e.target.value as CityStateName)}
                >
                  <option value="Athens">Athens</option>
                  <option value="Sparta">Sparta</option>
                  <option value="Thebes">Thebes</option>
                  <option value="Corinth">Corinth</option>
                  <option value="Megara">Megara</option>
                  <option value="Argos">Argos</option>
                </select>
              </div>
              
              <Button 
                onClick={handleJoinSession} 
                className="w-full bg-[#8B4513] hover:bg-amber-800"
              >
                Join Multiplayer Session
              </Button>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-4">
            <div className="p-3 bg-[#D2B48C] bg-opacity-30 rounded">
              <h3 className="font-bold">Current Session</h3>
              <p>Session ID: <span className="font-mono">{session.id}</span></p>
              <p>Players: {session.players.length}</p>
              <p className="mt-2">
                {isMyTurn ? (
                  <span className="font-bold text-green-700">
                    It's your turn! Actions remaining: {actionsRemaining}
                  </span>
                ) : (
                  <span className="text-amber-700">
                    Waiting for other player's turn...
                  </span>
                )}
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-bold">Players</h3>
              <ul className="space-y-1">
                {session.players.map(player => (
                  <li key={player.id} className="flex justify-between">
                    <span>{player.username} ({player.cityState})</span>
                    <span>
                      {player.isCurrentTurn ? '🎮 Current Turn' : ''}
                      {!player.isConnected ? ' (Disconnected)' : ''}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MultiplayerModal;
