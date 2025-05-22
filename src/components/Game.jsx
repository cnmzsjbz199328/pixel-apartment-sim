import React, { useEffect, useRef } from 'react';
import { launch } from '../game/index';

const Game = ({ onGameEvent }) => {
  const gameContainerRef = useRef(null);
  const gameInstanceRef = useRef(null);

  useEffect(() => {
    // 只在客户端执行，且只初始化一次
    if (typeof window !== 'undefined' && gameContainerRef.current && !gameInstanceRef.current) {
      gameInstanceRef.current = launch('game-container', onGameEvent);
    }

    // 清理函数 - 组件卸载时销毁游戏实例
    return () => {
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy(true);
        gameInstanceRef.current = null;
      }
    };
  }, [onGameEvent]);

  return (
    <div id="game-container" ref={gameContainerRef} className="w-full h-64 bg-gray-800">
      <div className="flex items-center justify-center h-full text-green-400">
        加载中...
      </div>
    </div>
  );
};

export default Game;