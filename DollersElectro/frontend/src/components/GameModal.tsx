import React, { useEffect } from 'react';
import SnakeGame from './SnakeGame';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface GameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GameModal: React.FC<GameModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scrolling when modal is closed
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-hidden">
      <div className="backdrop-blur-2xl bg-white/95 rounded-3xl shadow-2xl border-2 border-white/60 w-full max-w-7xl h-[98vh] overflow-hidden flex flex-col">
        {/* Modal Header - iOS 26 Glassy */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-green-500/90 to-blue-600/90 backdrop-blur-xl border-b border-white/60 rounded-t-3xl">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 backdrop-blur-xl bg-white/20 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">🎮</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white drop-shadow-lg">⚡ Electronic Snake Game</h2>
              <p className="text-sm text-white/90 font-medium drop-shadow">Eat electronic items and grow your snake!</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="p-3 text-white hover:text-white backdrop-blur-xl bg-white/10 hover:bg-red-500/80 rounded-2xl transition-all duration-300 transform hover:scale-110 shadow-lg"
              title="Close Game"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Modal Content - iOS 26 Glassy */}
        <div className="flex-1 overflow-y-auto p-4 backdrop-blur-xl bg-gradient-to-b from-gray-50/50 to-white/50">
          <SnakeGame />
        </div>
      </div>
    </div>
  );
};

export default GameModal;
