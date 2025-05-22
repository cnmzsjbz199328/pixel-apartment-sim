import Phaser from 'phaser';
import PreloadScene from './scenes/PreloadScene';
import GameScene from './scenes/GameScene';

export function launch(containerId, eventCallback) {
  const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: containerId,
    backgroundColor: '#1a1a2e',
    pixelArt: true,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [PreloadScene, GameScene],
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 }
      }
    }
  };

  const game = new Phaser.Game(config);
  
  // 存储回调函数，使场景可以发送事件到React组件
  game.eventCallback = eventCallback;
  
  // 使游戏实例全局可访问（便于调试）
  window.game = game;
  
  return game;
}