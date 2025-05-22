# 项目阶段4：API集成与优化开发文档

## 阶段概述

**版本**：Beta 0.4  
**时间跨度**：2-3周  
**主要目标**：将模拟数据替换为真实API调用，优化游戏性能和用户体验，增强视觉效果

## 详细技术规格

### API集成系统

- **后端框架**：Express.js / Node.js
- **数据格式**：JSON
- **请求方式**：RESTful API
- **通信协议**：HTTPS
- **状态管理**：
  - 加载状态
  - 错误处理
  - 断线重连
- **数据缓存**：本地存储策略

### API端点定义

1. **获取NPC配置列表**
   - 端点：`/api/npcs`
   - 方法：GET
   - 权限：公开
   - 用途：获取所有NPC的基础配置

2. **获取NPC行为**
   - 端点：`/api/npcs/:id/actions`
   - 方法：GET
   - 参数：
     - `playerPosition`: {x, y} - 玩家位置
   - 权限：公开
   - 用途：获取特定NPC的行为（对话或移动）

3. **获取游戏配置**
   - 端点：`/api/game/config`
   - 方法：GET
   - 权限：公开
   - 用途：获取游戏配置参数（音量、难度等）

### 性能优化

- **资源加载**：
  - 按需加载资源
  - 资源压缩和优化
  - 纹理图集（Texture Atlas）
  - 加载进度反馈
- **渲染优化**：
  - 对象池（Object Pooling）
  - 剔除不可见对象
  - 减少渲染更新频率
- **内存管理**：
  - 场景切换时释放资源
  - 纹理缓存控制
  - 避免频繁创建/销毁对象

### 视觉增强

- **过渡效果**：
  - 场景间淡入淡出
  - UI元素平滑动画
- **粒子效果**：
  - NPC互动粒子
  - 环境粒子（灰尘、光线等）
- **光照系统**：
  - 日/夜循环
  - 室内/室外光照区分
- **视差背景**：增加深度感

## 任务分解

### 任务1：后端API设计与实现

**描述**：设计和实现后端API服务，用于提供NPC配置和行为数据

**步骤**：
1. 创建后端项目结构
```
server/
├── src/
│   ├── controllers/
│   │   ├── npcController.js
│   │   └── gameController.js
│   ├── models/
│   │   └── npc.js
│   ├── routes/
│   │   ├── api.js
│   │   └── index.js
│   ├── data/
│   │   └── mockData.js  # 从前端移植的模拟数据
│   └── app.js
├── package.json
└── README.md
```

2. 实现NPC控制器
```javascript
// server/src/controllers/npcController.js

const npcData = require('../data/mockData');

// 获取所有NPC配置
exports.getAllNPCs = (req, res) => {
  try {
    const npcs = npcData.getNPCConfigurations();
    res.json({
      success: true,
      data: npcs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve NPC configurations',
      details: error.message
    });
  }
};

// 获取特定NPC的行为
exports.getNPCAction = (req, res) => {
  try {
    const npcId = req.params.id;
    const playerPosition = req.query.playerPosition ? 
      JSON.parse(req.query.playerPosition) : 
      { x: 0, y: 0 };
      
    const action = npcData.getMockNPCAction(npcId, playerPosition);
    
    res.json({
      success: true,
      data: action
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve NPC action',
      details: error.message
    });
  }
};
```

3. 实现API路由
```javascript
// server/src/routes/api.js

const express = require('express');
const router = express.Router();
const npcController = require('../controllers/npcController');
const gameController = require('../controllers/gameController');

// NPC路由
router.get('/npcs', npcController.getAllNPCs);
router.get('/npcs/:id/actions', npcController.getNPCAction);

// 游戏配置路由
router.get('/game/config', gameController.getGameConfig);

module.exports = router;
```

4. 设置主应用
```javascript
// server/src/app.js

const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// API路由
app.use('/api', apiRoutes);

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    details: err.message
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**验收标准**：
- API服务可以正常启动和运行
- 所有端点正确响应请求
- 错误处理机制工作正常
- API文档完整且符合标准

### 任务2：前端API服务集成

**描述**：将前端模拟数据替换为API调用，实现数据获取和状态管理

**步骤**：
1. 创建API服务类
```javascript
// src/services/ApiService.js

export default class ApiService {
  constructor(baseUrl = 'http://localhost:3000/api') {
    this.baseUrl = baseUrl;
    this.isConnected = true;
  }
  
  async fetchWithTimeout(url, options = {}, timeout = 5000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      
      clearTimeout(id);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        this.isConnected = false;
        throw new Error('Request timed out');
      }
      throw error;
    }
  }
  
  async getNPCConfigurations() {
    try {
      const result = await this.fetchWithTimeout(`${this.baseUrl}/npcs`);
      this.isConnected = true;
      return result.data;
    } catch (error) {
      console.error('Error fetching NPC configurations:', error);
      // 回退到本地模拟数据
      this.isConnected = false;
      return await this.getFallbackNPCConfigurations();
    }
  }
  
  async getNPCAction(npcId, playerPosition) {
    try {
      const queryParams = new URLSearchParams({
        playerPosition: JSON.stringify(playerPosition)
      });
      
      const result = await this.fetchWithTimeout(
        `${this.baseUrl}/npcs/${npcId}/actions?${queryParams}`
      );
      
      this.isConnected = true;
      return result.data;
    } catch (error) {
      console.error('Error fetching NPC action:', error);
      // 回退到本地模拟数据
      this.isConnected = false;
      return await this.getFallbackNPCAction(npcId, playerPosition);
    }
  }
  
  async getGameConfig() {
    try {
      const result = await this.fetchWithTimeout(`${this.baseUrl}/game/config`);
      this.isConnected = true;
      return result.data;
    } catch (error) {
      console.error('Error fetching game config:', error);
      // 回退到本地默认配置
      this.isConnected = false;
      return this.getDefaultGameConfig();
    }
  }
  
  // 本地回退方法
  async getFallbackNPCConfigurations() {
    const { getNPCConfigurations } = await import('../utils/mockData');
    return getNPCConfigurations();
  }
  
  async getFallbackNPCAction(npcId, playerPosition) {
    const { getMockNPCAction } = await import('../utils/mockData');
    return getMockNPCAction(npcId, playerPosition);
  }
  
  getDefaultGameConfig() {
    return {
      soundVolume: 0.5,
      musicVolume: 0.3,
      pixelArt: true,
      fullscreen: false
    };
  }
  
  isOnline() {
    return this.isConnected;
  }
}
```

2. 修改GameScene中的NPC管理代码
```javascript
// src/scenes/GameScene.js - 修改NPC初始化代码

import ApiService from '../services/ApiService';

// 在GameScene类中添加

constructor() {
  super({ key: 'GameScene' });
  this.apiService = new ApiService();
  this.connectionStatus = { isOnline: true, lastCheck: Date.now() };
}

async initNPCSystem() {
  // 创建NPC组
  this.npcs = this.physics.add.group({ classType: NPC });
  
  try {
    // 显示加载指示器
    this.showLoadingIndicator(true, '正在加载NPC数据...');
    
    // 从API获取NPC配置
    const npcConfigs = await this.apiService.getNPCConfigurations();
    
    // 创建每个NPC
    npcConfigs.forEach(config => {
      const npc = new NPC(
        this,
        config.position.x,
        config.position.y,
        `npc-${config.type}`,
        0,
        config
      );
      
      this.npcs.add(npc);
      
      // 添加与NPC的碰撞
      this.physics.add.collider(npc, this.collisionLayer);
      this.physics.add.collider(this.player, npc);
    });
    
    // 隐藏加载指示器
    this.showLoadingIndicator(false);
    
    // 更新连接状态
    this.connectionStatus = { 
      isOnline: this.apiService.isOnline(), 
      lastCheck: Date.now() 
    };
    
    // 显示连接状态
    this.updateConnectionStatusUI();
  } catch (error) {
    console.error('Failed to initialize NPCs:', error);
    this.showLoadingIndicator(false);
    this.showErrorMessage('NPC加载失败，使用本地数据');
    
    // 回退到本地模拟数据
    const { getNPCConfigurations } = await import('../utils/mockData');
    const npcConfigs = getNPCConfigurations();
    
    // ... 创建NPC的代码 (同上) ...
  }
}

// 替换getMockNPCAction方法
async getNPCAction(npcId, playerPosition) {
  try {
    const action = await this.apiService.getNPCAction(npcId, playerPosition);
    return action;
  } catch (error) {
    console.error('Failed to get NPC action:', error);
    // 回退到本地模拟数据
    const { getMockNPCAction } = await import('../utils/mockData');
    return getMockNPCAction(npcId, playerPosition);
  }
}

// 与NPC交互
async interactWithNPC(npc) {
  npc.startCooldown();
  
  // 显示加载指示器
  const loadingText = this.showMinimalLoadingIndicator(npc.x, npc.y - 40);
  
  // 获取API数据
  const action = await this.getNPCAction(npc.id, {
    x: this.player.x,
    y: this.player.y
  });
  
  // 隐藏加载指示器
  if (loadingText) loadingText.destroy();
  
  // 执行对应行为
  if (action.action === 'speak') {
    npc.showSpeechBubble(action.dialogue, action.duration || 3000);
    
    // 播放对话音效
    this.sound.play('chat', { volume: 0.5 });
  } else if (action.action === 'move') {
    npc.moveToPosition(action.targetPos.x, action.targetPos.y);
    
    // 播放移动音效
    this.sound.play('move', { volume: 0.3 });
  }
}

// UI辅助方法
showLoadingIndicator(visible, text = '加载中...') {
  if (visible) {
    this.loadingBox = this.add.graphics();
    this.loadingBox.fillStyle(0x000000, 0.7);
    this.loadingBox.fillRect(0, 0, this.cameras.main.width, 40);
    this.loadingBox.setScrollFactor(0);
    this.loadingBox.setDepth(999);
    
    this.loadingText = this.add.text(
      this.cameras.main.width / 2,
      20,
      text,
      { font: '14px Arial', fill: '#ffffff' }
    );
    this.loadingText.setOrigin(0.5);
    this.loadingText.setScrollFactor(0);
    this.loadingText.setDepth(1000);
  } else {
    if (this.loadingBox) {
      this.loadingBox.destroy();
      this.loadingBox = null;
    }
    
    if (this.loadingText) {
      this.loadingText.destroy();
      this.loadingText = null;
    }
  }
}

showMinimalLoadingIndicator(x, y) {
  const text = this.add.text(x, y, '...', {
    font: '12px Arial',
    fill: '#ffffff'
  });
  text.setOrigin(0.5);
  text.setDepth(100);
  
  // 创建闪烁动画
  this.tweens.add({
    targets: text,
    alpha: { from: 0.2, to: 1 },
    duration: 300,
    yoyo: true,
    repeat: -1
  });
  
  return text;
}

showErrorMessage(message) {
  const errorBox = this.add.graphics();
  errorBox.fillStyle(0xff0000, 0.7);
  errorBox.fillRect(0, 0, this.cameras.main.width, 40);
  errorBox.setScrollFactor(0);
  errorBox.setDepth(999);
  
  const errorText = this.add.text(
    this.cameras.main.width / 2,
    20,
    message,
    { font: '14px Arial', fill: '#ffffff' }
  );
  errorText.setOrigin(0.5);
  errorText.setScrollFactor(0);
  errorText.setDepth(1000);
  
  // 3秒后自动隐藏
  this.time.delayedCall(3000, () => {
    errorBox.destroy();
    errorText.destroy();
  });
}

updateConnectionStatusUI() {
  // 如果已有状态图标则删除
  if (this.connectionIcon) {
    this.connectionIcon.destroy();
  }
  
  // 创建新的状态图标
  this.connectionIcon = this.add.graphics();
  this.connectionIcon.setScrollFactor(0);
  this.connectionIcon.setDepth(1000);
  
  // 根据连接状态设置颜色
  if (this.connectionStatus.isOnline) {
    this.connectionIcon.fillStyle(0x00ff00, 1); // 绿色表示在线
  } else {
    this.connectionIcon.fillStyle(0xff0000, 1); // 红色表示离线
  }
  
  // 绘制小圆点
  this.connectionIcon.fillCircle(
    this.cameras.main.width - 15,
    15,
    5
  );
}
```

3. 修改入口以注册API服务
```javascript
// src/main.js - 添加API服务注册

import Phaser from 'phaser';
import PreloadScene from './scenes/PreloadScene';
import GameScene from './scenes/GameScene';
import ApiService from './services/ApiService';

const config = {
  // ... 现有配置 ...
};

const game = new Phaser.Game(config);

// 注册API服务以便全局访问
game.registry.apiService = new ApiService();

// 定期检查服务器连接状态
setInterval(async () => {
  try {
    await game.registry.apiService.getGameConfig();
    console.log('API连接状态: 正常');
  } catch (error) {
    console.warn('API连接状态: 断开', error);
  }
}, 30000); // 每30秒检查一次
```

**验收标准**：
- 前端能成功从API获取数据
- 网络错误时自动回退到本地模拟数据
- 连接状态UI正确显示
- 加载指示器在数据获取过程中显示
- 错误信息适当显示给用户

### 任务3：性能优化实现

**描述**：实现各种性能优化技术，提升游戏运行效率

**步骤**：
1. 实现对象池
```javascript
// src/utils/ObjectPool.js

export default class ObjectPool {
  constructor(scene, objectClass, initialSize = 0) {
    this.scene = scene;
    this.objectClass = objectClass;
    this.pool = [];
    
    // 预创建对象
    for (let i = 0; i < initialSize; i++) {
      this.createNewObject(false);
    }
  }
  
  createNewObject(active = false) {
    const object = new this.objectClass(this.scene);
    object.setActive(active);
    object.setVisible(active);
    this.pool.push(object);
    return object;
  }
  
  // 获取对象（空闲或创建新的）
  getObject() {
    // 寻找未激活的对象
    let obj = this.pool.find(o => !o.active);
    
    // 如果没有未激活的对象，创建新对象
    if (!obj) {
      obj = this.createNewObject(true);
    } else {
      obj.setActive(true);
      obj.setVisible(true);
    }
    
    return obj;
  }
  
  // 释放对象
  releaseObject(object) {
    object.setActive(false);
    object.setVisible(false);
  }
  
  // 释放所有对象
  releaseAll() {
    this.pool.forEach(obj => {
      this.releaseObject(obj);
    });
  }
}
```

2. 实现纹理图集
```javascript
// 在PreloadScene.js中使用纹理图集

preload() {
  // ... 现有代码 ...
  
  // 加载纹理图集代替单独的精灵表
  this.load.atlas('game-atlas', 'assets/game-atlas.png', 'assets/game-atlas.json');
  
  // ... 现有代码 ...
}

// 使用纹理图集创建帧
create() {
  // ... 现有代码 ...
  
  // 为玩家创建动画帧
  this.anims.create({
    key: 'walk-down',
    frames: this.anims.generateFrameNames('game-atlas', { 
      prefix: 'player-walk-down-',
      start: 0,
      end: 2,
      zeroPad: 1
    }),
    frameRate: 10,
    repeat: -1
  });
  
  // ... 现有代码 ...
}
```

3. 优化渲染性能
```javascript
// 在GameScene.js中添加渲染优化

create() {
  // ... 现有代码 ...
  
  // 设置游戏物理边界以匹配地图
  this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  
  // 设置相机边界
  this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  
  // 优化相机跟随
  this.cameras.main.startFollow(this.player, true, 0.09, 0.09);
  
  // 设置游戏世界边界
  this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  
  // 启用剔除功能
  this.cameras.main.setRenderToTexture();
  
  // 动态光照
  this.lights.enable().setAmbientColor(0x808080);
  
  // 优化更新
  this.physics.world.setFPS(30); // 物理更新30FPS而不是默认60FPS
  
  // ... 现有代码 ...
}

update(time, delta) {
  // ... 现有代码 ...
  
  // 仅更新视野内的NPC
  this.npcs.getChildren().forEach(npc => {
    if (this.cameras.main.worldView.contains(npc.x, npc.y)) {
      npc.update(time, delta);
    }
  });
  
  // ... 现有代码 ...
}
```

4. 优化场景切换
```javascript
// 在SceneTransitionManager.js中实现

export default class SceneTransitionManager {
  constructor(scene) {
    this.scene = scene;
  }
  
  fadeOut(targetScene, data = {}, duration = 300) {
    // 创建黑色遮罩
    const overlay = this.scene.add.graphics();
    overlay.fillStyle(0x000000, 1);
    overlay.fillRect(0, 0, this.scene.cameras.main.width, this.scene.cameras.main.height);
    overlay.setDepth(999);
    overlay.setScrollFactor(0);
    overlay.alpha = 0;
    
    // 淡入动画
    this.scene.tweens.add({
      targets: overlay,
      alpha: 1,
      duration: duration,
      ease: 'Linear',
      onComplete: () => {
        // 准备新场景的数据
        const nextSceneData = {
          ...data,
          previousScene: this.scene.scene.key
        };
        
        // 释放当前场景资源
        this.scene.textures.once('cleancomplete', () => {
          // 开始目标场景
          this.scene.scene.start(targetScene, nextSceneData);
        });
        
        // 清理当前场景未使用的资源
        this.scene.textures.removeUnusedKeys();
      }
    });
  }
  
  fadeIn(duration = 300) {
    // 创建黑色遮罩
    const overlay = this.scene.add.graphics();
    overlay.fillStyle(0x000000, 1);
    overlay.fillRect(0, 0, this.scene.cameras.main.width, this.scene.cameras.main.height);
    overlay.setDepth(999);
    overlay.setScrollFactor(0);
    overlay.alpha = 1;
    
    // 淡出动画
    this.scene.tweens.add({
      targets: overlay,
      alpha: 0,
      duration: duration,
      ease: 'Linear',
      onComplete: () => {
        overlay.destroy();
      }
    });
  }
}
```

**验收标准**：
- 游戏帧率稳定保持在60FPS
- 内存使用量保持在合理范围内
- 场景切换时资源正确释放
- 只有视野内的物体进行更新
- 物体池系统正常工作，减少垃圾回收

### 任务4：视觉效果增强

**描述**：添加视觉增强效果，提升游戏美术表现力和用户体验

**步骤**：
1. 实现粒子效果
```javascript
// 在GameScene.js中添加粒子系统

create() {
  // ... 现有代码 ...
  
  // 创建粒子管理器
  this.particleManager = {
    // NPC交互粒子
    createInteractionParticles(x, y, color = 0xffffff) {
      const particles = this.add.particles('game-atlas', 'particle');
      const emitter = particles.createEmitter({
        x,
        y,
        speed: { min: 20, max: 40 },
        scale: { start: 0.6, end: 0 },
        lifespan: 800,
        blendMode: 'ADD',
        tint: color,
        quantity: 10
      });
      
      // 单次爆发后停止
      emitter.explode();
      
      // 粒子完成后销毁
      this.time.delayedCall(1000, () => {
        particles.destroy();
      });
      
      return particles;
    },
    
    // 环境粒子（如灰尘）
    createAmbientParticles(region) {
      const particles = this.add.particles('game-atlas', 'dust');
      
      particles.createEmitter({
        x: { min: region.x, max: region.x + region.width },
        y: { min: region.y, max: region.y + region.height },
        speedX: { min: -5, max: 5 },
        speedY: { min: -5, max: 5 },
        scale: { start: 0.2, end: 0 },
        alpha: { start: 0.3, end: 0 },
        lifespan: { min: 2000, max: 5000 },
        frequency: 500, // 每500ms产生一个粒子
        blendMode: 'ADD',
        maxParticles: 20
      });
      
      return particles;
    }
  }.bind(this);
  
  // 为主要房间添加环境粒子
  this.ambientParticles = this.particleManager.createAmbientParticles({
    x: 100,
    y: 100,
    width: 400,
    height: 300
  });
  
  // ... 现有代码 ...
}

// 在NPC交互中使用粒子效果
interactWithNPC(npc) {
  // ... 现有代码 ...
  
  // 添加交互粒子
  if (action.action === 'speak') {
    this.particleManager.createInteractionParticles(npc.x, npc.y - 20, 0x00ffff);
  } else if (action.action === 'move') {
    this.particleManager.createInteractionParticles(npc.x, npc.y, 0xff8800);
  }
  
  // ... 现有代码 ...
}
```

2. 实现光照效果
```javascript
// 在GameScene.js中添加光照系统

create() {
  // ... 现有代码 ...
  
  // 启用光照系统
  this.lights.enable();
  
  // 设置环境光
  this.lights.setAmbientColor(0x808080); // 50%灰色环境光
  
  // 创建玩家光源
  this.playerLight = this.lights.addLight(this.player.x, this.player.y, 150, 0xffffff, 1);
  
  // 为室内灯具添加光源
  this.lampLights = [];
  const lampPositions = [
    { x: 100, y: 100 },
    { x: 300, y: 150 },
    { x: 200, y: 250 }
  ];
  
  lampPositions.forEach(pos => {
    const light = this.lights.addLight(pos.x, pos.y, 100, 0xffaa66, 0.8);
    this.lampLights.push(light);
    
    // 添加轻微闪烁效果
    this.tweens.add({
      targets: light,
      intensity: { from: 0.8, to: 0.9 },
      duration: 1000 + Math.random() * 500,
      yoyo: true,
      repeat: -1
    });
  });
  
  // 日/夜循环系统
  this.timeSystem = {
    time: 0, // 0-1440分钟 (24小时)
    daySpeed: 0.5, // 游戏中1秒 = 现实0.5分钟
    
    update(delta) {
      // 更新游戏时间
      this.time = (this.time + this.daySpeed * delta / 1000) % 1440;
      
      // 计算一天中的比例 (0-1)
      const dayRatio = this.time / 1440;
      
      // 计算亮度基于时间
      // 最亮在中午(720分钟)，最暗在午夜(0/1440分钟)
      let brightness = Math.sin(dayRatio * Math.PI) * 0.5 + 0.5;
      
      // 限制最低亮度为0.2
      brightness = Math.max(0.2, brightness);
      
      // 更新环境光
      this.scene.lights.setAmbientColor(
        Phaser.Display.Color.GetColor(
          Math.floor(128 * brightness),
          Math.floor(128 * brightness),
          Math.floor(150 * brightness)
        )
      );
      
      // 更新灯光强度（夜晚灯光更亮）
      const lampIntensity = 0.8 + (1 - brightness) * 0.5;
      this.scene.lampLights.forEach(light => {
        light.intensity = lampIntensity;
      });
      
      return {
        hour: Math.floor(this.time / 60),
        minute: Math.floor(this.time % 60),
        brightness
      };
    }
  };
  this.timeSystem.scene = this;
  
  // ... 现有代码 ...
}

update(time, delta) {
  // ... 现有代码 ...
  
  // 更新玩家光源位置
  this.playerLight.x = this.player.x;
  this.playerLight.y = this.player.y;
  
  // 更新时间系统
  const timeInfo = this.timeSystem.update(delta);
  
  // 可选：显示时间UI
  if (this.timeText) {
    this.timeText.setText(
      `${String(timeInfo.hour).padStart(2, '0')}:${String(timeInfo.minute).padStart(2, '0')}`
    );
  }
  
  // ... 现有代码 ...
}
```

3. 实现视差背景
```javascript
// 在GameScene.js中添加视差背景

create() {
  // ... 现有代码 ...
  
  // 创建视差背景层
  this.createParallaxLayers();
  
  // ... 现有代码 ...
}

createParallaxLayers() {
  // 假设我们有三层背景图片
  const layerConfigs = [
    { key: 'bg-far', scrollFactor: 0.1 },
    { key: 'bg-mid', scrollFactor: 0.3 },
    { key: 'bg-near', scrollFactor: 0.5 }
  ];
  
  this.parallaxLayers = [];
  
  layerConfigs.forEach(config => {
    // 创建TileSprite以覆盖整个相机视口
    const layer = this.add.tileSprite(
      0, 0,
      this.cameras.main.width, 
      this.cameras.main.height,
      config.key
    );
    
    // 设置原点为左上角
    layer.setOrigin(0, 0);
    
    // 固定到相机
    layer.setScrollFactor(0);
    
    // 记住滚动因子以便在update中使用
    layer.parallaxFactor = config.scrollFactor;
    
    // 添加到层数组
    this.parallaxLayers.push(layer);
  });
}

update(time, delta) {
  // ... 现有代码 ...
  
  // 更新视差背景
  this.parallaxLayers.forEach(layer => {
    layer.tilePositionX = this.cameras.main.scrollX * layer.parallaxFactor;
    layer.tilePositionY = this.cameras.main.scrollY * layer.parallaxFactor;
  });
  
  // ... 现有代码 ...
}
```

**验收标准**：
- 粒子效果正确显示，增强交互反馈
- 光照系统工作正常，提供室内外不同氛围
- 日/夜循环系统平滑运行
- 视差背景增强深度感
- 所有视觉增强不影响游戏性能

## 测试计划

### 单元测试

- 测试API服务各函数
- 测试对象池创建和重用逻辑
- 测试日/夜循环计算
- 测试场景转换函数

### 集成测试

| 测试场景 | 预期结果 | 测试方法 |
|---------|----------|---------|
| API连接 | 成功获取NPC配置和行为 | 自动化HTTP请求测试 |
| API断开 | 自动回退到本地数据 | 模拟网络故障测试 |
| 场景切换 | 平滑过渡且资源正确释放 | 手动场景切换测试 |
| 内存使用 | 长时间运行不出现内存泄露 | 自动压力测试 |
| 光照系统 | 灯光随时间变化，室内外区分明显 | 一天周期测试 |

### 性能测试

- **负载测试**：同时显示多个NPC并触发交互
- **响应性测试**：确保玩家输入的响应时间低于16ms
- **内存测试**：监控场景切换时内存使用情况
- **帧率测试**：确保在最低目标设备上保持60FPS

## 设计文档

### API结构

```
Backend API
├── GET /api/npcs
│   └── 获取所有NPC配置
├── GET /api/npcs/:id/actions
│   └── 根据玩家位置获取NPC行为
└── GET /api/game/config
    └── 获取游戏配置
```

### 前端服务类图

```
ApiService
├── fetchWithTimeout()
├── getNPCConfigurations()
├── getNPCAction()
├── getGameConfig()
├── getFallbackNPCConfigurations()
├── getFallbackNPCAction()
└── isOnline()

ObjectPool
├── createNewObject()
├── getObject()
├── releaseObject()
└── releaseAll()

SceneTransitionManager
├── fadeOut()
└── fadeIn()

TimeSystem
└── update()
```

### 日/夜循环图

```
  亮度
  1.0 |     /\
      |    /  \
      |   /    \
      |  /      \
  0.5 | /        \
      |/          \
  0.0 +-------------> 时间
      0  6  12  18  24
      午夜 黎明 正午 黄昏 午夜
```

## 资源清单

1. **API文档**：
   - `api-documentation.md` - API接口规范与示例
   - `swagger.yaml` - OpenAPI规范文件

2. **纹理图集**：
   - `game-atlas.png` - 合并的游戏精灵图
   - `game-atlas.json` - 图集帧定义

3. **粒子资源**：
   - 粒子图像：`particle.png`, `dust.png`
   - 粒子配置：`particle-presets.json`

4. **背景**：
   - 视差背景层：`bg-far.png`, `bg-mid.png`, `bg-near.png`

## 风险与缓解策略

| 风险 | 严重程度 | 缓解策略 |
|-----|----------|---------|
| API服务不稳定 | 高 | 实现本地回退机制，超时自动重试 |
| 性能优化不足 | 中 | 分析性能瓶颈，有针对性地优化 |
| 视觉效果成本高 | 中 | 为低性能设备提供降级选项 |
| 不同浏览器兼容性 | 中 | 全面的浏览器测试，提供渐进式增强 |
| 资源加载过大 | 高 | 实现资源分割和按需加载策略 |

## 阶段成果物

完成本阶段后，应当交付：

1. 功能完整的后端API服务
2. 前端API集成系统，包含错误处理和回退机制
3. 性能优化实现，包括对象池和渲染优化
4. 视觉增强系统，包括粒子效果、光照和日/夜循环
5. 完整的API文档和使用说明

## 下一阶段准备

成功完成本阶段后，为阶段5(扩展功能与发布准备)准备：

1. 设计游戏存档和加载系统
2. 规划游戏UI和设置界面
3. 准备发布平台和部署策略
4. 制定测试计划和质量保证流程

## 参考资料

- [RESTful API设计最佳实践](https://restfulapi.net/resource-naming/)
- [Phaser 3性能优化指南](https://phaser.io/phaser3/devlog/127)
- [游戏中的对象池模式](https://gameprogrammingpatterns.com/object-pool.html)
- [Express.js官方文档](https://expressjs.com/)
- [游戏中的日/夜循环系统设计](https://www.gamedeveloper.com/design/designing-day-night-cycles-in-games)
