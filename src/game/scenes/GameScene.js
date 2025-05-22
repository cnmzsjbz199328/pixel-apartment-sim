import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // 显示logo作为占位
    const logo = this.add.image(width / 2, height / 2, 'logo');
    logo.setScale(0.5);
    
    // 添加像素风边框
    const border = this.add.graphics();
    border.lineStyle(4, 0x4a4a4a, 1);
    border.strokeRect(width / 4, height / 4, width / 2, height / 2);
    
    this.add.text(width / 2, height - 50, '公寓基础场景', {
      font: '16px "Press Start 2P"',
      fill: '#4CAF50'
    }).setOrigin(0.5);
    
    // 添加简单交互
    logo.setInteractive();
    logo.on('pointerdown', () => {
      // 随机更改颜色
      logo.setTint(Math.random() * 0xffffff);
      
      // 发送事件到React UI
      if (this.game.eventCallback) {
        const color = `#${Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0')}`;
        this.game.eventCallback('command-output', `Logo颜色已变更为: ${color}`);
      }
    });
  }
  
  // 接收来自React UI的命令
  processCommand(command) {
    console.log('游戏场景收到命令:', command);
    
    // 向React UI发送响应
    if (this.game.eventCallback) {
      this.game.eventCallback('command-response', `游戏引擎收到命令: ${command}`);
    }
    
    // 根据命令执行不同操作
    switch(command) {
      case 'map':
        // 显示地图信息...
        break;
      // 其他命令处理...
    }
  }
}