import Phaser from 'phaser';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    // 创建像素风格的加载进度条
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 4, height / 2 - 30, width / 2, 50);
    
    const loadingText = this.add.text(width / 2, height / 2 - 50, '加载中...', {
      font: '16px "Press Start 2P"',
      fill: '#4CAF50'
    });
    loadingText.setOrigin(0.5, 0.5);
    
    // 注册加载事件
    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0x4CAF50, 1);
      progressBar.fillRect(width / 4 + 10, height / 2 - 20, (width / 2 - 20) * value, 30);
      
      // 发送加载进度到React UI
      if (this.game.eventCallback) {
        this.game.eventCallback('loading-progress', Math.floor(value * 100));
      }
    });
    
    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      
      // 通知React UI加载完成
      if (this.game.eventCallback) {
        this.game.eventCallback('loading-complete', {});
      }
    });
    
    // 加载测试资源
    this.load.image('logo', '/assets/phaser-logo.png');
    this.load.audio('startup', '/assets/startup.wav');
  }

  create() {
    // 播放启动音效
    this.sound.play('startup');
    
    this.add.text(10, 10, '像素公寓生活模拟器 Alpha 0.1', { 
      font: '16px "Press Start 2P"',
      fill: '#4CAF50' 
    });
    
    // 显示加载完成消息
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    this.add.text(width / 2, height / 2, '初始化完成!', {
      font: '16px "Press Start 2P"',
      fill: '#FFFFFF'
    }).setOrigin(0.5);
    
    // 延迟后跳转到游戏场景
    this.time.delayedCall(2000, () => {
      this.scene.start('GameScene');
    });
  }
}