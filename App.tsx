import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { GameProvider } from './src/store/GameContext';

export default function App() {
  return (
    <GameProvider>
      <AppNavigator />
    </GameProvider>
  );
}