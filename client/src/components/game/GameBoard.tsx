import React, { useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import CityTab from './CityTab';
import DiplomacyTab from './DiplomacyTab';
import MilitaryTab from './MilitaryTab';
import EconomyTab from './EconomyTab';

interface GameBoardProps {
  onOpenGovernmentModal: () => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ onOpenGovernmentModal }) => {
  const { game } = useGame();
  const [activeTab, setActiveTab] = useState('city');

  if (!game) {
    return <div>Loading game...</div>;
  }

  return (
    <div className="w-full lg:w-3/4 pr-0 lg:pr-4 mb-4 lg:mb-0">
      {/* City Status Overview */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="flex flex-wrap items-center justify-between">
          <div className="mb-2 md:mb-0">
            <h2 className="text-xl cinzel font-bold text-[#8B4513]">
              {game.playerCityState.name}
            </h2>
            <p className="text-[#333333] text-sm">
              {game.playerCityState.government}
            </p>
          </div>
          <div className="flex space-x-4 flex-wrap">
            <div className="flex items-center mr-3 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="text-[#B8860B] mr-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <div className="text-sm font-semibold">Treasury</div>
                <div className="text-lg">{game.playerCityState.resources.gold}</div>
              </div>
            </div>
            <div className="flex items-center mr-3 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="text-[#B8860B] mr-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
              <div>
                <div className="text-sm font-semibold">Food</div>
                <div className="text-lg">{game.playerCityState.resources.food}</div>
              </div>
            </div>
            <div className="flex items-center mr-3 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="text-[#B8860B] mr-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <div>
                <div className="text-sm font-semibold">Population</div>
                <div className="text-lg">{game.playerCityState.resources.population}</div>
              </div>
            </div>
            <div className="flex items-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="text-[#B8860B] mr-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div>
                <div className="text-sm font-semibold">Military</div>
                <div className="text-lg">{game.playerCityState.resources.military}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-[#333333] mb-4">
        <button 
          onClick={() => setActiveTab('city')}
          className={`px-4 py-2 cinzel font-bold transition-colors ${
            activeTab === 'city' 
              ? 'bg-[#D2B48C] text-[#333333] border-b-3 border-[#B8860B]' 
              : 'hover:bg-[#D2B48C]'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg> City
        </button>
        <button 
          onClick={() => setActiveTab('diplomacy')}
          className={`px-4 py-2 cinzel font-bold transition-colors ${
            activeTab === 'diplomacy' 
              ? 'bg-[#D2B48C] text-[#333333] border-b-3 border-[#B8860B]' 
              : 'hover:bg-[#D2B48C]'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
          </svg> Diplomacy
        </button>
        <button 
          onClick={() => setActiveTab('military')}
          className={`px-4 py-2 cinzel font-bold transition-colors ${
            activeTab === 'military' 
              ? 'bg-[#D2B48C] text-[#333333] border-b-3 border-[#B8860B]' 
              : 'hover:bg-[#D2B48C]'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg> Military
        </button>
        <button 
          onClick={() => setActiveTab('economy')}
          className={`px-4 py-2 cinzel font-bold transition-colors ${
            activeTab === 'economy' 
              ? 'bg-[#D2B48C] text-[#333333] border-b-3 border-[#B8860B]' 
              : 'hover:bg-[#D2B48C]'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg> Economy
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'city' && <CityTab onOpenGovernmentModal={onOpenGovernmentModal} />}
        {activeTab === 'diplomacy' && <DiplomacyTab />}
        {activeTab === 'military' && <MilitaryTab />}
        {activeTab === 'economy' && <EconomyTab />}
      </div>
    </div>
  );
};

export default GameBoard;
