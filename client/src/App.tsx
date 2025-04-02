import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import GameContainer from "@/components/game/GameContainer";
import { GameProvider } from "@/contexts/GameContext";
import { MultiplayerProvider } from "@/contexts/MultiplayerContext"; // Added import

function Router() {
  return (
    <Switch>
      <Route path="/" component={GameContainer} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <GameProvider>
      <MultiplayerProvider> {/* Added MultiplayerProvider */}
        <Router />
        <Toaster />
      </MultiplayerProvider> {/* Added MultiplayerProvider */}
    </GameProvider>
  );
}

export default App;