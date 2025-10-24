import React from 'react';
import SnakeGame from '../components/SnakeGame';

const GamePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      <SnakeGame />
    </div>
  );
};

export default GamePage;


