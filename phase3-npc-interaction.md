# 项目阶段3：NPC与交互系统开发文档

## 阶段概述

**版本**：Beta 0.3  
**时间跨度**：2-3周  
**主要目标**：实现NPC角色及其行为逻辑，玩家与NPC的交互系统，以及基于模拟数据的对话系统

## 详细技术规格

### NPC系统

- **NPC类型**：住户、访客、宠物等多种角色类型
- **行为状态**：
  - 闲置 (idle) - 原地站立，轻微动画
  - 移动 (moving) - 在预定路径上行走
  - 交谈 (talking) - 与玩家互动时显示对话
- **外观规格**：
  - 16x16像素精灵
  - 每种NPC 4个方向，每个方向3帧动画
- **路径系统**：
  - 预定义路径点
  - A*寻路算法（简化版）
  - 避障逻辑

### 交互系统

- **触发机制**：
  - 距离触发：玩家接近NPC指定距离内
  - 按键触发：在近距离时按特定按键(E键)
- **交互半径**：30像素（可根据NPC类型调整）
- **冷却时间**：2000毫秒（防止连续触发）
- **视觉提示**：
  - NPC头顶互动图标
  - 按键提示UI

### 对话系统

- **对话气泡**：
  - 样式：像素风格文本气泡
  - 位置：NPC头顶上方
  - 显示时间：3000毫秒（可配置）
  - 文字速度：每字符50毫秒（打字机效果）
- **对话内容**：
  - 从模拟数据中随机选择
  - 基于NPC类型和上下文
  - 支持简单分支

### 模拟数据系统

- **数据结构**：JSON格式
- **数据内容**：
  - NPC基础信息（ID、名称、类型）
  - NPC位置和路径点
  - 对话内容库
  - 行为模式配置
- **存储位置**：`src/utils/mockData.js`
- **未来API替换**：结构设计与未来API返回格式一致

## 任务分解

### 任务1：NPC基础系统

**描述**：创建NPC类及基础行为系统

**步骤**：
1. 创建NPC精灵资源
   - 设计至少3种不同NPC角色
   - 为每种角色创建精灵表
   - 包含四个方向的移动和闲置动画

2. 创建NPC类
```javascript
// 创建 src/entities/NPC.js
import Phaser from 'phaser';

export default class NPC extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, frame, config) {
    super(scene, x, y, texture, frame);
    
    // 添加到场景
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // 碰撞设置
    this.body.setSize(12, 12);
    this.body.offset.x = 2;
    this.body.offset.y = 4;
    this.setImmovable(true);
    
    // NPC配置
    this.config = config || {};
    this.id = config.id || 'npc-' + Math.floor(Math.random() * 1000);
    this.npcType = config.type || 'resident';
    this.interactionRadius = config.interactionRadius || 30;
    this.cooldown = false;
    this.cooldownTime = config.cooldownTime || 2000;
    
    // 状态机
    this.state = 'idle';
    this.direction = 'down';
    this.targetPosition = null;
    this.movePath = [];
    this.pathIndex = 0;
    
    // 创建动画
    this.createAnimations();
    
    // 交互图标
    this.interactionIcon = scene.add.sprite(x, y - 20, 'icons', 0);
    this.interactionIcon.setVisible(false);
    this.interactionIcon.setDepth(100);
    
    // 对话气泡
    this.speechBubble = null;
    this.speechText = null;
  }
  
  createAnimations() {
    const texture = this.texture.key;
    const anims = this.scene.anims;
    
    // 如果动画已存在则跳过
    if (anims.exists(`${texture}-walk-down`)) return;
    
    // 创建行走动画
    anims.create({
      key: `${texture}-walk-down`,
      frames: anims.generateFrameNumbers(texture, { start: 0, end: 2 }),
      frameRate: 10,
      repeat: -1
    });
    
    anims.create({
      key: `${texture}-walk-left`,
      frames: anims.generateFrameNumbers(texture, { start: 3, end: 5 }),
      frameRate: 10,
      repeat: -1
    });
    
    anims.create({
      key: `${texture}-walk-right`,
      frames: anims.generateFrameNumbers(texture, { start: 6, end: 8 }),
      frameRate: 10,
      repeat: -1
    });
    
    anims.create({
      key: `${texture}-walk-up`,
      frames: anims.generateFrameNumbers(texture, { start: 9, end: 11 }),
      frameRate: 10,
      repeat: -1
    });
    
    // 创建闲置动画
    anims.create({ key: `${texture}-idle-down`, frames: [{ key: texture, frame: 0 }] });
    anims.create({ key: `${texture}-idle-left`, frames: [{ key: texture, frame: 3 }] });
    anims.create({ key: `${texture}-idle-right`, frames: [{ key: texture, frame: 6 }] });
    anims.create({ key: `${texture}-idle-up`, frames: [{ key: texture, frame: 9 }] });
  }
  
  update(time, delta) {
    // 更新交互图标位置
    if (this.interactionIcon) {
      this.interactionIcon.x = this.x;
      this.interactionIcon.y = this.y - 20;
    }
    
    // 更新对话气泡位置
    if (this.speechBubble) {
      this.speechBubble.x = this.x;
      this.speechBubble.y = this.y - 30;
      this.speechText.x = this.x;
      this.speechText.y = this.y - 30;
    }
    
    // 根据状态执行不同行为
    switch (this.state) {
      case 'idle':
        this.handleIdleState();
        break;
      case 'moving':
        this.handleMovingState();
        break;
      case 'talking':
        this.handleTalkingState();
        break;
    }
  }
  
  handleIdleState() {
    // 播放闲置动画
    this.anims.play(`${this.texture.key}-idle-${this.direction}`, true);
    
    // 随机决定是否移动
    if (this.config.canMove && Math.random() < 0.005) {
      this.moveToRandomPosition();
    }
  }
  
  handleMovingState() {
    // 如果有目标位置
    if (this.targetPosition) {
      // 计算与目标的距离
      const dx = this.targetPosition.x - this.x;
      const dy = this.targetPosition.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // 如果接近目标，则到达
      if (distance < 2) {
        this.x = this.targetPosition.x;
        this.y = this.targetPosition.y;
        this.body.reset(this.x, this.y);
        this.targetPosition = null;
        this.state = 'idle';
        return;
      }
      
      // 设置移动方向和动画
      const speed = 50;
      const angle = Math.atan2(dy, dx);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      
      this.body.setVelocity(vx, vy);
      
      // 根据移动方向设置朝向和动画
      if (Math.abs(dx) > Math.abs(dy)) {
        this.direction = dx > 0 ? 'right' : 'left';
      } else {
        this.direction = dy > 0 ? 'down' : 'up';
      }
      
      this.anims.play(`${this.texture.key}-walk-${this.direction}`, true);
    } else {
      this.state = 'idle';
    }
  }
  
  handleTalkingState() {
    // 说话时通常保持静止
    this.body.setVelocity(0, 0);
    this.anims.play(`${this.texture.key}-idle-${this.direction}`, true);
  }
  
  moveToPosition(x, y) {
    this.targetPosition = { x, y };
    this.state = 'moving';
  }
  
  moveToRandomPosition() {
    // 在NPC周围随机选择一个点
    const radius = 50;
    const angle = Math.random() * Math.PI * 2;
    const x = this.x + Math.cos(angle) * radius;
    const y = this.y + Math.sin(angle) * radius;
    
    // 检查点是否可到达（不与墙碰撞）
    if (this.scene.isPositionWalkable(x, y)) {
      this.moveToPosition(x, y);
    }
  }
  
  showSpeechBubble(text, duration = 3000) {
    // 清除现有对话气泡
    this.clearSpeechBubble();
    
    // 创建新的对话气泡
    const bubble = this.scene.add.graphics();
    const padding = 10;
    const style = { fontSize: '10px', fill: '#000', wordWrap: { width: 100 } };
    
    // 计算气泡大小
    const textObj = this.scene.add.text(0, 0, text, style);
    const bubbleWidth = textObj.width + padding * 2;
    const bubbleHeight = textObj.height + padding * 2;
    
    // 绘制气泡
    bubble.fillStyle(0xffffff, 0.9);
    bubble.lineStyle(2, 0x565656, 1);
    bubble.fillRoundedRect(-bubbleWidth/2, -bubbleHeight/2, bubbleWidth, bubbleHeight, 5);
    bubble.strokeRoundedRect(-bubbleWidth/2, -bubbleHeight/2, bubbleWidth, bubbleHeight, 5);
    
    // 气泡尾部
    bubble.fillTriangle(-5, bubbleHeight/2 - 2, 5, bubbleHeight/2 - 2, 0, bubbleHeight/2 + 5);
    bubble.lineStyle(2, 0x565656, 1);
    bubble.lineBetween(-5, bubbleHeight/2 - 2, 0, bubbleHeight/2 + 5);
    bubble.lineBetween(0, bubbleHeight/2 + 5, 5, bubbleHeight/2 - 2);
    
    // 设置位置
    bubble.x = this.x;
    bubble.y = this.y - 30;
    
    textObj.setPosition(this.x - textObj.width/2, this.y - 30 - textObj.height/2);
    
    this.speechBubble = bubble;
    this.speechText = textObj;
    
    // 设置深度
    bubble.setDepth(100);
    textObj.setDepth(101);
    
    // 设置状态
    this.state = 'talking';
    
    // 定时消失
    this.scene.time.delayedCall(duration, () => {
      this.clearSpeechBubble();
      this.state = 'idle';
    });
  }
  
  clearSpeechBubble() {
    if (this.speechBubble) {
      this.speechBubble.destroy();
      this.speechBubble = null;
    }
    
    if (this.speechText) {
      this.speechText.destroy();
      this.speechText = null;
    }
  }
  
  showInteractionIcon(show) {
    if (this.interactionIcon) {
      this.interactionIcon.setVisible(show);
    }
  }
  
  startCooldown() {
    this.cooldown = true;
    this.scene.time.delayedCall(this.cooldownTime, () => {
      this.cooldown = false;
    });
  }
  
  canInteract() {
    return !this.cooldown;
  }
}
```

3. 在GameScene中添加NPC管理
```javascript
// 在GameScene.js中添加NPC管理

import NPC from '../entities/NPC';
import { getNPCConfigurations } from '../utils/mockData';

// 在GameScene class内添加

create() {
  // ... 现有代码 ...
  
  // 初始化NPC系统
  this.initNPCSystem();
  
  // ... 现有代码 ...
}

initNPCSystem() {
  // 创建NPC组
  this.npcs = this.physics.add.group({ classType: NPC });
  
  // 从模拟数据获取NPC配置
  const npcConfigs = getNPCConfigurations();
  
  // 创建每个NPC
  npcConfigs.forEach(config => {
    const npc = new NPC(
      this,
      config.position.x,
      config.position.y,
      `npc-${config.type}`, // 精灵表名称
      0, // 初始帧
      config
    );
    
    this.npcs.add(npc);
    
    // 添加与NPC的碰撞
    this.physics.add.collider(npc, this.collisionLayer);
    this.physics.add.collider(this.player, npc);
  });
}

// 辅助函数：检查位置是否可行走
isPositionWalkable(x, y) {
  const tile = this.collisionLayer.getTileAtWorldXY(x, y);
  return !tile || tile.index === -1;
}

update(time, delta) {
  // ... 玩家控制代码 ...
  
  // 更新所有NPC
  this.npcs.getChildren().forEach(npc => {
    npc.update(time, delta);
  });
  
  // ... 其他更新代码 ...
}
```

**验收标准**：
- NPC能够在场景中正确显示并具有正确的外观
- NPC碰撞检测工作正常，玩家不能穿过NPC
- NPC动画正确显示（闲置和移动）
- NPC能够遵循基本的状态逻辑

### 任务2：玩家与NPC交互系统

**描述**：实现玩家与NPC的互动机制

**步骤**：
1. 创建交互按键和视觉提示
```javascript
// 在GameScene.js中添加

create() {
  // ... 现有代码 ...
  
  // 添加交互按键
  this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
  
  // 添加交互提示UI
  this.interactionPrompt = this.add.text(
    this.cameras.main.width / 2,
    this.cameras.main.height - 50,
    '按 E 键交互',
    { fontSize: '16px', fill: '#fff' }
  );
  this.interactionPrompt.setOrigin(0.5);
  this.interactionPrompt.setScrollFactor(0); // 固定在相机上
  this.interactionPrompt.setVisible(false);
  this.interactionPrompt.setDepth(1000);
  
  // 加载交互图标
  this.load.spritesheet('icons', 'assets/icons.png', { frameWidth: 16, frameHeight: 16 });
  
  // ... 现有代码 ...
}

update(time, delta) {
  // ... 现有代码 ...
  
  // 检查玩家是否在NPC附近
  const nearbyNPC = this.findNearbyNPC();
  
  // 更新交互提示和图标
  if (nearbyNPC) {
    nearbyNPC.showInteractionIcon(true);
    this.interactionPrompt.setVisible(true);
    
    // 如果按下交互键且NPC可交互
    if (Phaser.Input.Keyboard.JustDown(this.interactKey) && nearbyNPC.canInteract()) {
      this.interactWithNPC(nearbyNPC);
    }
  } else {
    this.interactionPrompt.setVisible(false);
    
    // 隐藏所有NPC的交互图标
    this.npcs.getChildren().forEach(npc => {
      npc.showInteractionIcon(false);
    });
  }
  
  // ... 现有代码 ...
}

// 寻找附近的NPC
findNearbyNPC() {
  let nearbyNPC = null;
  let minDistance = Infinity;
  
  this.npcs.getChildren().forEach(npc => {
    // 计算与玩家的距离
    const distance = Phaser.Math.Distance.Between(
      this.player.x, this.player.y,
      npc.x, npc.y
    );
    
    // 如果在交互范围内且比之前的更近
    if (distance <= npc.interactionRadius && distance < minDistance) {
      minDistance = distance;
      nearbyNPC = npc;
    }
  });
  
  return nearbyNPC;
}

// 与NPC交互
interactWithNPC(npc) {
  npc.startCooldown();
  
  // 获取模拟数据
  const action = this.getMockNPCAction(npc.id, {
    x: this.player.x,
    y: this.player.y
  });
  
  // 执行对应行为
  if (action.action === 'speak') {
    npc.showSpeechBubble(action.dialogue, action.duration || 3000);
  } else if (action.action === 'move') {
    npc.moveToPosition(action.targetPos.x, action.targetPos.y);
  }
  
  // 播放交互音效
  this.sound.play('interact');
}
```

2. 添加模拟数据辅助函数
```javascript
// 在GameScene.js中添加

// 获取模拟NPC行为
getMockNPCAction(npcId, playerPosition) {
  // 使用工具函数获取模拟数据
  const { getMockNPCAction } = this.scene.systems.game.registry.mockData;
  return getMockNPCAction(npcId, playerPosition);
}
```

**验收标准**：
- 玩家接近NPC时显示交互图标和提示
- 按E键能够触发NPC交互
- NPC根据模拟数据作出反应（对话或移动）
- 交互后有一定冷却时间，防止连续触发

### 任务3：模拟数据系统

**描述**：创建NPC行为和对话的模拟数据系统

**步骤**：
1. 创建模拟数据模块
```javascript
// 创建 src/utils/mockData.js

// NPC基础配置数据
export function getNPCConfigurations() {
  return [
    {
      id: 'npc001',
      name: '李阿姨',
      type: 'resident',
      position: { x: 150, y: 200 },
      interactionRadius: 40,
      cooldownTime: 2000,
      canMove: true,
      paths: [
        { x: 150, y: 200 },
        { x: 200, y: 250 },
        { x: 250, y: 200 },
        { x: 200, y: 150 }
      ],
      dialogues: {
        greeting: [
          '你好啊，年轻人！',
          '今天天气不错，是吧？',
          '你是新搬来的住户吗？'
        ],
        random: [
          '我记得年轻的时候...',
          '你有没有看到我的眼镜？',
          '这栋楼的物业真是越来越差了。'
        ]
      }
    },
    {
      id: 'npc002',
      name: '张先生',
      type: 'visitor',
      position: { x: 300, y: 150 },
      interactionRadius: 35,
      cooldownTime: 3000,
      canMove: true,
      paths: [
        { x: 300, y: 150 },
        { x: 350, y: 200 },
        { x: 300, y: 250 }
      ],
      dialogues: {
        greeting: [
          '嗨，你好！',
          '请问这里是几号楼？',
          '抱歉打扰了。'
        ],
        random: [
          '我在找我朋友的公寓...',
          '这个社区真不错啊。',
          '你知道附近有便利店吗？'
        ]
      }
    },
    {
      id: 'npc003',
      name: '小花猫',
      type: 'pet',
      position: { x: 220, y: 300 },
      interactionRadius: 30,
      cooldownTime: 1000,
      canMove: true,
      paths: [
        { x: 220, y: 300 },
        { x: 250, y: 330 },
        { x: 280, y: 300 },
        { x: 250, y: 270 }
      ],
      dialogues: {
        greeting: [
          '喵~',
          '喵喵！',
          '咕噜咕噜~'
        ],
        random: [
          '喵？',
          '喵呜~',
          '咕噜咕噜喵~'
        ]
      }
    }
  ];
}

// 获取NPC行为模拟数据
export function getMockNPCAction(npcId, playerPosition) {
  // 获取所有NPC配置
  const npcs = getNPCConfigurations();
  
  // 查找对应ID的NPC
  const npc = npcs.find(n => n.id === npcId);
  
  if (!npc) {
    return { action: 'speak', dialogue: '错误：找不到NPC数据' };
  }
  
  // 随机选择行为：80%对话，20%移动
  const isSpeak = Math.random() < 0.8;
  
  if (isSpeak) {
    // 随机选择对话类型和内容
    const dialogueType = Math.random() < 0.3 ? 'greeting' : 'random';
    const dialogues = npc.dialogues[dialogueType];
    const dialogue = dialogues[Math.floor(Math.random() * dialogues.length)];
    
    return {
      action: 'speak',
      dialogue: `${npc.name}: ${dialogue}`,
      duration: dialogue.length * 100 + 1000 // 根据文本长度调整显示时间
    };
  } else {
    // 移动行为：随机选择一个路径点
    let targetPos;
    
    if (npc.paths && npc.paths.length > 0) {
      targetPos = npc.paths[Math.floor(Math.random() * npc.paths.length)];
    } else {
      // 如果没有预定路径，则在当前位置周围随机选择一点
      const radius = 50;
      const angle = Math.random() * Math.PI * 2;
      targetPos = {
        x: npc.position.x + Math.cos(angle) * radius,
        y: npc.position.y + Math.sin(angle) * radius
      };
    }
    
    return {
      action: 'move',
      targetPos: targetPos,
      duration: 2000
    };
  }
}

// 注册全局访问点
export function registerMockData(game) {
  game.registry.mockData = {
    getNPCConfigurations,
    getMockNPCAction
  };
}
```

2. 在入口文件中注册模拟数据
```javascript
// 修改 src/main.js

import Phaser from 'phaser';
import PreloadScene from './scenes/PreloadScene';
import GameScene from './scenes/GameScene';
import { registerMockData } from './utils/mockData';

const config = {
  // ... 现有配置 ...
};

const game = new Phaser.Game(config);

// 注册模拟数据
registerMockData(game);
```

**验收标准**：
- 模拟数据系统能够提供多种NPC配置
- 每个NPC有独特的对话内容和行为模式
- 交互系统能正确获取和使用模拟数据
- 数据结构符合设计规范，为未来API集成做好准备

### 任务4：音效和视觉增强

**描述**：为交互系统添加音效和视觉反馈

**步骤**：
1. 添加交互音效
```javascript
// 在PreloadScene.js中添加音效加载

preload() {
  // ... 现有代码 ...
  
  // 加载交互音效
  this.load.audio('interact', 'assets/audio/interact.wav');
  this.load.audio('chat', 'assets/audio/chat.wav');
  this.load.audio('move', 'assets/audio/move.wav');
  
  // ... 现有代码 ...
}
```

2. 添加视觉反馈
```javascript
// 在GameScene.js的interactWithNPC方法中添加

interactWithNPC(npc) {
  // ... 现有代码 ...
  
  // 根据行为添加特定音效和视觉效果
  if (action.action === 'speak') {
    // 播放对话音效
    this.sound.play('chat', { volume: 0.5 });
    
    // 对话气泡动画（淡入）
    npc.showSpeechBubble(action.dialogue, action.duration || 3000);
    
    // 添加表情图标（可选）
    this.addEmoticon(npc.x, npc.y - 40, 'question');
  } else if (action.action === 'move') {
    // 播放移动音效
    this.sound.play('move', { volume: 0.3 });
    
    // 移动路径视觉提示（可选）
    this.showPathIndicator(npc.x, npc.y, action.targetPos.x, action.targetPos.y);
    
    npc.moveToPosition(action.targetPos.x, action.targetPos.y);
  }
  
  // 玩家反馈：简单的图标或动画
  this.cameras.main.flash(100, 255, 255, 255, 0.2);
}

// 添加表情图标
addEmoticon(x, y, type) {
  const emoticon = this.add.sprite(x, y, 'emoticons', this.getEmoticonFrame(type));
  emoticon.setDepth(200);
  
  // 缩放动画
  this.tweens.add({
    targets: emoticon,
    scale: { from: 0, to: 1 },
    duration: 300,
    ease: 'Back.easeOut'
  });
  
  // 自动消失
  this.time.delayedCall(1500, () => {
    this.tweens.add({
      targets: emoticon,
      alpha: 0,
      scale: 1.5,
      duration: 200,
      onComplete: () => emoticon.destroy()
    });
  });
}

// 获取表情图标帧
getEmoticonFrame(type) {
  const types = {
    'happy': 0,
    'sad': 1,
    'angry': 2,
    'question': 3,
    'exclamation': 4
  };
  return types[type] || 0;
}

// 显示路径指示器
showPathIndicator(startX, startY, endX, endY) {
  const pathGraphics = this.add.graphics();
  pathGraphics.lineStyle(1, 0xffff00, 0.5);
  pathGraphics.lineBetween(startX, startY, endX, endY);
  pathGraphics.setDepth(50);
  
  // 目标点标记
  const marker = this.add.circle(endX, endY, 5, 0xffff00, 0.7);
  marker.setDepth(51);
  
  // 动画和自动消失
  this.tweens.add({
    targets: [pathGraphics, marker],
    alpha: 0,
    duration: 1000,
    delay: 1000,
    onComplete: () => {
      pathGraphics.destroy();
      marker.destroy();
    }
  });
}
```

**验收标准**：
- 交互时播放适当的音效
- NPC对话气泡有动画效果
- 移动路径有视觉指示
- 界面反馈清晰，增强用户体验

## 测试计划

### 单元测试

- 测试NPC行为状态机
- 测试模拟数据生成
- 测试交互触发条件

### 功能测试

| 测试场景 | 预期结果 | 测试方法 |
|---------|----------|---------|
| 接近NPC | 显示交互提示和图标 | 手动测试 |
| 按E键交互 | NPC根据数据作出反应 | 手动测试 |
| NPC对话 | 显示对话气泡和文本 | 手动测试 |
| NPC移动 | NPC平滑移动到目标位置 | 手动测试 |
| 多NPC场景 | 正确识别最近的NPC | 手动测试 |
| 交互冷却 | 短时间内不重复触发交互 | 手动测试 |

### 兼容性测试

- 在不同浏览器中测试NPC动画和交互效果
- 在不同分辨率下测试UI元素位置

## 设计文档

### NPC状态机

```
                 +-------+
                 | Idle  |<---------+
                 +-------+          |
                    |  ^            |
          随机移动  |  | 到达目标     |
                    v  |            |
                 +-------+          |
                 | Moving |         |
                 +-------+          |
                     ^              |
                     |              |
                     v              |
                 +--------+         |
    玩家交互 --->| Talking |--------+
                 +--------+    对话结束
```

### 交互系统流程图

```
玩家移动 -> 检测NPC距离 -> 小于交互半径?
                          |
                          v
                      显示交互提示
                          |
                          v
                      按下E键?
                          |
                          v
                      NPC冷却结束?
                          |
                          v
                      获取模拟数据
                     /           \
                    /             \
               speak              move
                /                   \
               v                     v
          显示对话气泡            NPC移动
               |                     |
               v                     v
            播放音效              播放音效
               |                     |
               v                     v
          设置冷却时间           设置冷却时间
```

## 资源清单

1. **NPC精灵表**：
   - `npc-resident.png` - 居民NPC精灵表
   - `npc-visitor.png` - 访客NPC精灵表
   - `npc-pet.png` - 宠物NPC精灵表

2. **UI元素**：
   - `icons.png` - 交互图标精灵表
   - `emoticons.png` - 表情图标精灵表

3. **音效文件**：
   - `interact.wav` - 一般交互音效
   - `chat.wav` - 对话开始音效
   - `move.wav` - NPC移动音效

## 风险与缓解策略

| 风险 | 严重程度 | 缓解策略 |
|-----|----------|---------|
| 多NPC同时交互冲突 | 中 | 实现最近NPC优先交互逻辑 |
| 对话气泡重叠 | 中 | 错开显示位置或透明度调整 |
| NPC寻路卡住 | 高 | 添加超时检测，遇障碍自动取消移动 |
| 模拟数据大小问题 | 低 | 分块加载，延迟初始化 |

## 阶段成果物

完成本阶段后，应当交付：

1. 功能完整的NPC系统，包括多种类型NPC
2. 玩家与NPC的交互系统
3. 对话气泡和视觉反馈系统
4. 模拟数据驱动的NPC行为
5. 交互音效系统

## 下一阶段准备

成功完成本阶段后，为阶段4(API集成与优化)准备：

1. 设计后端API接口规范
2. 创建API请求和响应结构文档
3. 规划模拟数据到实际API的过渡策略
4. 准备错误处理和加载状态UI设计

## 参考资料

- [Phaser 3 游戏对象与物理系统](https://photonstorm.github.io/phaser3-docs/Phaser.Physics.Arcade.html)
- [状态机设计模式](https://gameprogrammingpatterns.com/state.html)
- [对话系统设计最佳实践](https://www.gamedeveloper.com/design/best-practices-for-game-dialogues)
- [像素风游戏UI设计指南](https://www.retronator.com/pixel-art-academy)
