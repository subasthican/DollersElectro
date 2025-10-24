import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PlayIcon, PauseIcon, ArrowPathIcon, TrophyIcon, BoltIcon } from '@heroicons/react/24/outline';

interface Position {
  x: number;
  y: number;
}

interface ElectronicItem {
  id: number;
  position: Position;
  type: 'bulb' | 'phone' | 'laptop' | 'headphones' | 'camera' | 'tablet';
  points: number;
  emoji: string;
}

interface GameState {
  snake: Position[];
  direction: 'up' | 'down' | 'left' | 'right';
  food: ElectronicItem;
  score: number;
  highScore: number;
  gameOver: boolean;
  paused: boolean;
  speed: number;
  level: number;
}

const GRID_SIZE = 20;
const INITIAL_SPEED = 150;

const ELECTRONIC_ITEMS: Omit<ElectronicItem, 'id' | 'position'>[] = [
  { type: 'bulb', points: 10, emoji: '💡' },
  { type: 'phone', points: 20, emoji: '📱' },
  { type: 'laptop', points: 30, emoji: '💻' },
  { type: 'headphones', points: 15, emoji: '🎧' },
  { type: 'camera', points: 25, emoji: '📷' },
  { type: 'tablet', points: 20, emoji: '📱' },
];

const SnakeGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const [gameState, setGameState] = useState<GameState>({
    snake: [{ x: 10, y: 10 }],
    direction: 'right',
    food: {
      id: 1,
      position: { x: 15, y: 15 },
      type: 'bulb',
      points: 10,
      emoji: '💡'
    },
    score: 0,
    highScore: parseInt(localStorage.getItem('snakeHighScore') || '0'),
    gameOver: false,
    paused: false,
    speed: INITIAL_SPEED,
    level: 1,
  });

  const [gameStarted, setGameStarted] = useState(false);

  // Touch controls
  const [touchStart, setTouchStart] = useState<Position | null>(null);

  const getRandomPosition = useCallback((): Position => {
    const x = Math.floor(Math.random() * (canvasRef.current!.width / GRID_SIZE));
    const y = Math.floor(Math.random() * (canvasRef.current!.height / GRID_SIZE));
    return { x, y };
  }, []);

  const getRandomElectronicItem = useCallback((): ElectronicItem => {
    const item = ELECTRONIC_ITEMS[Math.floor(Math.random() * ELECTRONIC_ITEMS.length)];
    return {
      ...item,
      id: Date.now(),
      position: getRandomPosition(),
    };
  }, [getRandomPosition]);

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#16213e';
    ctx.lineWidth = 1;
    for (let i = 0; i <= canvas.width; i += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i <= canvas.height; i += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // Draw snake
    gameState.snake.forEach((segment, index) => {
      if (index === 0) {
        // Head - brighter green with gradient effect
        ctx.fillStyle = '#00ff88';
        ctx.fillRect(
          segment.x * GRID_SIZE + 1,
          segment.y * GRID_SIZE + 1,
          GRID_SIZE - 2,
          GRID_SIZE - 2
        );
        
        // Draw eyes based on direction
        ctx.fillStyle = '#ffffff';
        const eyeSize = 3;
        const eyeOffset = 5;
        
        if (gameState.direction === 'right') {
          // Eyes on the right side
          ctx.fillRect(segment.x * GRID_SIZE + GRID_SIZE - eyeOffset, segment.y * GRID_SIZE + eyeOffset, eyeSize, eyeSize);
          ctx.fillRect(segment.x * GRID_SIZE + GRID_SIZE - eyeOffset, segment.y * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize, eyeSize, eyeSize);
        } else if (gameState.direction === 'left') {
          // Eyes on the left side
          ctx.fillRect(segment.x * GRID_SIZE + eyeOffset - eyeSize, segment.y * GRID_SIZE + eyeOffset, eyeSize, eyeSize);
          ctx.fillRect(segment.x * GRID_SIZE + eyeOffset - eyeSize, segment.y * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize, eyeSize, eyeSize);
        } else if (gameState.direction === 'up') {
          // Eyes on the top
          ctx.fillRect(segment.x * GRID_SIZE + eyeOffset, segment.y * GRID_SIZE + eyeOffset - eyeSize, eyeSize, eyeSize);
          ctx.fillRect(segment.x * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize, segment.y * GRID_SIZE + eyeOffset - eyeSize, eyeSize, eyeSize);
        } else if (gameState.direction === 'down') {
          // Eyes on the bottom
          ctx.fillRect(segment.x * GRID_SIZE + eyeOffset, segment.y * GRID_SIZE + GRID_SIZE - eyeOffset, eyeSize, eyeSize);
          ctx.fillRect(segment.x * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize, segment.y * GRID_SIZE + GRID_SIZE - eyeOffset, eyeSize, eyeSize);
        }
      } else {
        // Body - darker green with slight variation
        const bodyColor = index % 2 === 0 ? '#00cc6a' : '#00b359';
        ctx.fillStyle = bodyColor;
        ctx.fillRect(
          segment.x * GRID_SIZE + 2,
          segment.y * GRID_SIZE + 2,
          GRID_SIZE - 4,
          GRID_SIZE - 4
        );
      }
    });

    // Draw food
    ctx.font = `${GRID_SIZE - 4}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      gameState.food.emoji,
      gameState.food.position.x * GRID_SIZE + GRID_SIZE / 2,
      gameState.food.position.y * GRID_SIZE + GRID_SIZE / 2
    );
  }, [gameState]);

  const startGame = useCallback(() => {
    setGameState({
      snake: [{ x: 10, y: 10 }],
      direction: 'right',
      food: getRandomElectronicItem(),
      score: 0,
      highScore: parseInt(localStorage.getItem('snakeHighScore') || '0'),
      gameOver: false,
      paused: false,
      speed: INITIAL_SPEED,
      level: 1,
    });
    setGameStarted(true);
  }, [getRandomElectronicItem]);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (gameState.gameOver) return;

    // Prevent default behavior for arrow keys to stop page scrolling
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
      event.preventDefault();
    }

    switch (event.key) {
      case 'ArrowUp':
        if (gameState.direction !== 'down') {
          setGameState(prev => ({ ...prev, direction: 'up' }));
        }
        break;
      case 'ArrowDown':
        if (gameState.direction !== 'up') {
          setGameState(prev => ({ ...prev, direction: 'down' }));
        }
        break;
      case 'ArrowLeft':
        if (gameState.direction !== 'right') {
          setGameState(prev => ({ ...prev, direction: 'left' }));
        }
        break;
      case 'ArrowRight':
        if (gameState.direction !== 'left') {
          setGameState(prev => ({ ...prev, direction: 'right' }));
        }
        break;
      case ' ':
        if (gameStarted) {
          setGameState(prev => ({ ...prev, paused: !prev.paused }));
        } else {
          startGame();
        }
        break;
    }
  }, [gameState.direction, gameState.gameOver, gameStarted, startGame]);

  const togglePause = useCallback(() => {
    setGameState(prev => ({ ...prev, paused: !prev.paused }));
  }, []);

  // Touch controls
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    
    if (!touchStart) return;

    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    const minSwipeDistance = 50;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX > 0 && gameState.direction !== 'left') {
          setGameState(prev => ({ ...prev, direction: 'right' })); // Swipe right
        } else if (deltaX < 0 && gameState.direction !== 'right') {
          setGameState(prev => ({ ...prev, direction: 'left' })); // Swipe left
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > minSwipeDistance) {
        if (deltaY > 0 && gameState.direction !== 'up') {
          setGameState(prev => ({ ...prev, direction: 'down' })); // Swipe down
        } else if (deltaY < 0 && gameState.direction !== 'down') {
          setGameState(prev => ({ ...prev, direction: 'up' })); // Swipe up
        }
      }
    }
  };

  // Game loop
  useEffect(() => {
    if (gameState.gameOver || gameState.paused || !gameStarted) return;

    const gameLoop = () => {
      if (gameState.gameOver || gameState.paused || !gameStarted) return;
      
      setGameState(prevState => {
        const newSnake = [...prevState.snake];
        const head = { ...newSnake[0] };

        // Move head based on current direction
        switch (prevState.direction) {
          case 'up':
            head.y -= 1;
            break;
          case 'down':
            head.y += 1;
            break;
          case 'left':
            head.x -= 1;
            break;
          case 'right':
            head.x += 1;
            break;
        }

        // Check wall collision
        const canvas = canvasRef.current;
        if (!canvas) return prevState;

        if (
          head.x < 0 ||
          head.x >= canvas.width / GRID_SIZE ||
          head.y < 0 ||
          head.y >= canvas.height / GRID_SIZE
        ) {
          setGameStarted(false);
          return { ...prevState, gameOver: true };
        }

        // Check self collision
        if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
          setGameStarted(false);
          return { ...prevState, gameOver: true };
        }

        newSnake.unshift(head);

        // Check food collision
        if (head.x === prevState.food.position.x && head.y === prevState.food.position.y) {
          const newScore = prevState.score + prevState.food.points;
          const newLevel = Math.floor(newScore / 100) + 1;
          const newSpeed = Math.max(50, INITIAL_SPEED - (newLevel - 1) * 10);
          
          // Generate new food
          let newFood: ElectronicItem;
          do {
            newFood = getRandomElectronicItem();
          } while (
            newSnake.some(segment => 
              segment.x === newFood.position.x && segment.y === newFood.position.y
            )
          );

          return {
            ...prevState,
            snake: newSnake,
            food: newFood,
            score: newScore,
            level: newLevel,
            speed: newSpeed,
          };
        } else {
          // Remove tail if no food eaten
          newSnake.pop();
          return { ...prevState, snake: newSnake };
        }
      });

      gameLoopRef.current = window.setTimeout(gameLoop, gameState.speed);
    };

    gameLoopRef.current = window.setTimeout(gameLoop, gameState.speed);

    return () => {
      if (gameLoopRef.current) {
        clearTimeout(gameLoopRef.current);
      }
    };
  }, [gameState.speed, gameState.gameOver, gameState.paused, gameStarted, gameState.direction, gameState.food, gameState.score, getRandomElectronicItem]);

  // Update high score
  useEffect(() => {
    if (gameState.gameOver && gameState.score > gameState.highScore) {
      const newHighScore = gameState.score;
      localStorage.setItem('snakeHighScore', newHighScore.toString());
      setGameState(prev => ({ ...prev, highScore: newHighScore }));
    }
  }, [gameState.gameOver, gameState.score, gameState.highScore]);

  // Event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // Draw game
  useEffect(() => {
    drawGame();
  }, [drawGame]);

  return (
    <div className="flex flex-col items-center space-y-4 p-4 bg-gradient-to-br from-blue-50/50 via-white/50 to-purple-50/50 w-full rounded-2xl">
      {/* Header - iOS 26 Glassy */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center drop-shadow-lg">
          <BoltIcon className="h-8 w-8 mr-2 text-yellow-500" />
          ⚡ Electronic Snake ⚡
          <BoltIcon className="h-8 w-8 ml-2 text-yellow-500" />
        </h1>
        <p className="text-gray-700 text-base font-medium">Eat electronic items and grow your snake!</p>
      </div>

      {/* Game Stats - iOS 26 Glassy */}
      <div className="flex space-x-3">
        <div className="text-center backdrop-blur-2xl bg-white/80 px-4 py-2 rounded-2xl border-2 border-white/60 shadow-lg shadow-green-500/10">
          <div className="text-2xl font-bold text-green-600">{gameState.score}</div>
          <div className="text-xs font-semibold text-gray-600">Score</div>
        </div>
        <div className="text-center backdrop-blur-2xl bg-white/80 px-4 py-2 rounded-2xl border-2 border-white/60 shadow-lg shadow-yellow-500/10">
          <div className="text-2xl font-bold text-yellow-600">{gameState.highScore}</div>
          <div className="text-xs font-semibold text-gray-600">High</div>
        </div>
        <div className="text-center backdrop-blur-2xl bg-white/80 px-4 py-2 rounded-2xl border-2 border-white/60 shadow-lg shadow-blue-500/10">
          <div className="text-2xl font-bold text-blue-600">L{gameState.level}</div>
          <div className="text-xs font-semibold text-gray-600">Level</div>
        </div>
        <div className="text-center backdrop-blur-2xl bg-white/80 px-4 py-2 rounded-2xl border-2 border-white/60 shadow-lg shadow-purple-500/10">
          <div className="text-2xl font-bold text-purple-600">{gameState.snake.length}</div>
          <div className="text-xs font-semibold text-gray-600">Length</div>
        </div>
      </div>

      {/* Game Canvas - iOS 26 Glassy */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={450}
          height={300}
          className="border-4 border-white/60 rounded-2xl shadow-2xl bg-gradient-to-br from-gray-800 to-gray-900 touch-none select-none max-w-full h-auto"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        />
        
        {/* Start Game Overlay - iOS 26 Glassy */}
        {!gameStarted && !gameState.gameOver && (
          <div className="absolute inset-0 backdrop-blur-xl bg-black/80 flex flex-col items-center justify-center rounded-2xl border-4 border-white/60">
            <BoltIcon className="h-20 w-20 text-yellow-400 mb-4 drop-shadow-2xl animate-pulse" />
            <h2 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">Snake Game</h2>
            <p className="text-white/90 mb-6 font-medium drop-shadow">Eat electronic items and grow!</p>
            <button
              onClick={startGame}
              className="backdrop-blur-2xl bg-gradient-to-br from-green-500/90 to-green-600/90 hover:from-green-600/95 hover:to-green-700/95 text-white px-8 py-4 rounded-2xl font-bold shadow-2xl shadow-green-500/50 transition-all duration-300 transform hover:scale-110 flex items-center text-lg border-2 border-white/30"
            >
              <PlayIcon className="h-6 w-6 mr-2" />
              Start Game
            </button>
          </div>
        )}

        {/* Game Over Overlay - iOS 26 Glassy */}
        {gameState.gameOver && (
          <div className="absolute inset-0 backdrop-blur-xl bg-black/80 flex flex-col items-center justify-center rounded-2xl border-4 border-white/60">
            <TrophyIcon className="h-20 w-20 text-yellow-400 mb-4 drop-shadow-2xl animate-bounce" />
            <h2 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">Game Over!</h2>
            <p className="text-white/90 mb-2 font-medium drop-shadow">Final Score: {gameState.score}</p>
            <p className="text-white/90 mb-6 font-medium drop-shadow">Snake Length: {gameState.snake.length}</p>
            <button
              onClick={startGame}
              className="backdrop-blur-2xl bg-gradient-to-br from-green-500/90 to-green-600/90 hover:from-green-600/95 hover:to-green-700/95 text-white px-8 py-4 rounded-2xl font-bold shadow-2xl shadow-green-500/50 transition-all duration-300 transform hover:scale-110 flex items-center text-lg border-2 border-white/30"
            >
              <ArrowPathIcon className="h-6 w-6 mr-2" />
              Play Again
            </button>
          </div>
        )}

        {/* Pause Overlay */}
        {gameState.paused && !gameState.gameOver && gameStarted && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <PauseIcon className="h-16 w-16 text-white mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">Paused</h2>
              <p className="text-gray-300">Press SPACE to resume</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls - iOS 26 Glassy */}
      <div className="flex space-x-4">
        <button
          onClick={startGame}
          className="backdrop-blur-2xl bg-gradient-to-br from-blue-500/90 to-blue-600/90 hover:from-blue-600/95 hover:to-blue-700/95 text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 border-2 border-white/30 hover:border-white/50 transition-all duration-300 transform hover:scale-105 flex items-center"
        >
          <PlayIcon className="h-5 w-5 mr-2" />
          {gameStarted ? 'Restart' : 'Start Game'}
        </button>
        
        {gameStarted && !gameState.gameOver && (
          <button
            onClick={togglePause}
            className="backdrop-blur-2xl bg-gradient-to-br from-yellow-500/90 to-yellow-600/90 hover:from-yellow-600/95 hover:to-yellow-700/95 text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-yellow-500/30 hover:shadow-yellow-500/50 border-2 border-white/30 hover:border-white/50 transition-all duration-300 transform hover:scale-105 flex items-center"
          >
            {gameState.paused ? (
              <>
                <PlayIcon className="h-5 w-5 mr-2" />
                Resume
              </>
            ) : (
              <>
                <PauseIcon className="h-5 w-5 mr-2" />
                Pause
              </>
            )}
          </button>
        )}
      </div>

      {/* Electronic Items Legend - iOS 26 Glassy */}
      <div className="w-full">
        <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">💡 Electronic Items & Points</h3>
        <div className="grid grid-cols-3 gap-3">
          {ELECTRONIC_ITEMS.map((item, index) => (
            <div key={index} className="backdrop-blur-2xl bg-white/80 rounded-2xl p-3 border-2 border-white/60 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
              <div className="text-3xl mb-1">{item.emoji}</div>
              <div className="text-xs font-bold capitalize text-gray-900">{item.type}</div>
              <div className="text-sm text-yellow-600 font-bold">{item.points} pts</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SnakeGame;
