# 项目阶段2：核心游戏机制开发文档

## 阶段概述

**版本**：Alpha 0.2  
**时间跨度**：2-3周  
**主要目标**：实现基本的游戏机制和交互，包括瓦片地图渲染、玩家移动控制、碰撞检测和基础动画系统

## 详细技术规格

### 瓦片地图系统

- **地图尺寸**：800x600像素（50x38瓦片，每瓦片16x16像素）
- **图层结构**：
  1. 地面层 (Ground) - 基础地板、地毯等
  2. 装饰层 (Decoration) - 家具、装饰品等
  3. 碰撞层 (Collision) - 不可通过区域
  4. 上层装饰 (Overlay) - 玩家可以走到下面的物体（如桌子顶部）
- **技术实现**：使用Tiled创建地图，导出为JSON格式
- **边界处理**：地图边缘设置为不可穿越，防止玩家离开地图区域

### 玩家控制系统

- **移动机制**：
  - 方向键控制（上、下、左、右）
  - 移动速度：100像素/秒
  - 对角线移动速度需标准化防止高速移动
- **物理系统**：
  - 使用Arcade Physics
  - 玩家碰撞体积：矩形，尺寸为12x12像素（比角色精灵小）
  - 碰撞检测：与地图碰撞层和物体进行碰撞
- **动画状态**：
  - 上下左右四个方向各有行走动画（3帧）
  - 四个方向的闲置状态（1帧）
  - 帧率：10fps（行走动画）

### 相机系统

- **跟随逻辑**：相机平滑跟随玩家，延迟200ms
- **边界限制**：相机不超出地图边界
- **缩放行为**：保持像素完美渲染，避免模糊
- **过渡效果**：场景切换时有淡入淡出效果（300ms）

## 任务分解

### 任务1：瓦片地图实现

**描述**：创建并导入公寓场景的瓦片地图

**步骤**：
1. 准备瓦片集资源
   - 下载或创建16x16像素公寓内部瓦片集
   - 组织瓦片集图像文件，确保包含地板、墙壁、家具等元素

2. 使用Tiled创建地图
   ```
   - 创建新地图（50x38瓦片，每瓦片16x16像素）
   - 导入准备好的瓦片集
   - 创建4个图层：Ground, Decoration, Collision, Overlay
   - 绘制公寓场景
   - 在Collision层标记不可通过区域
   ```

3. 导出地图文件
   ```
   - 导出为JSON格式 (apartment.json)
   - 确保引用的瓦片集路径正确
   - 将文件放入 public/assets/ 目录
   ```

4. 在GameScene中加载地图
```javascript
// 地图加载与渲染代码
create() {
  // 加载Tiled地图
  const map = this.make.tilemap({ key: 'map' });
  const tileset = map.addTilesetImage('apartment-tileset', 'tiles');
  
  // 创建图层
  this.groundLayer = map.createLayer('Ground', tileset, 0, 0);
  this.decorLayer = map.createLayer('Decoration', tileset, 0, 0);
  this.collisionLayer = map.createLayer('Collision', tileset, 0, 0);
  this.overlayLayer = map.createLayer('Overlay', tileset, 0, 0);
  
  // 设置碰撞
  this.collisionLayer.setCollisionByExclusion([-1]);
  
  // 设置深度，确保覆盖层在玩家上方
  this.overlayLayer.setDepth(10);
  
  // 设置世界边界
  this.physics.world.bounds.width = map.widthInPixels;
  this.physics.world.bounds.height = map.heightInPixels;
}
```

**验收标准**：
- 地图正确加载并显示所有图层
- 碰撞层正常工作，玩家不能穿过墙壁
- 各图层深度正确，玩家可以走到某些物体下方

### 任务2：玩家角色实现

**描述**：创建可控制的玩家角色，支持移动和动画

**步骤**：
1. 创建玩家精灵素材
   - 创建16x16像素的角色精灵
   - 准备四个方向的行走动画（每个方向3帧）
   - 准备四个方向的闲置状态（每个方向1帧）
   - 导出为精灵表 (player.png)

2. 在GameScene中实现玩家对象
```javascript
// 玩家对象实现代码
create() {
  // ... 地图代码 ...
  
  // 创建玩家精灵
  this.player = this.physics.add.sprite(100, 100, 'player', 0);
  
  // 设置玩家碰撞体积
  this.player.body.setSize(12, 12);
  this.player.body.offset.x = 2;
  this.player.body.offset.y = 4;
  
  // 设置玩家碰撞
  this.physics.add.collider(this.player, this.collisionLayer);
  
  // 设置玩家不能离开世界边界
  this.player.setCollideWorldBounds(true);
  
  // 创建玩家动画
  this.createPlayerAnimations();
  
  // 设置相机跟随玩家
  this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
  this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
}

// 创建玩家动画
createPlayerAnimations() {
  // 向下行走
  this.anims.create({
    key: 'walk-down',
    frames: this.anims.generateFrameNumbers('player', { start: 0, end: 2 }),
    frameRate: 10,
    repeat: -1
  });
  
  // 向左行走
  this.anims.create({
    key: 'walk-left',
    frames: this.anims.generateFrameNumbers('player', { start: 3, end: 5 }),
    frameRate: 10,
    repeat: -1
  });
  
  // 向右行走
  this.anims.create({
    key: 'walk-right',
    frames: this.anims.generateFrameNumbers('player', { start: 6, end: 8 }),
    frameRate: 10,
    repeat: -1
  });
  
  // 向上行走
  this.anims.create({
    key: 'walk-up',
    frames: this.anims.generateFrameNumbers('player', { start: 9, end: 11 }),
    frameRate: 10,
    repeat: -1
  });
  
  // 闲置动画
  this.anims.create({ key: 'idle-down', frames: [{ key: 'player', frame: 0 }] });
  this.anims.create({ key: 'idle-left', frames: [{ key: 'player', frame: 3 }] });
  this.anims.create({ key: 'idle-right', frames: [{ key: 'player', frame: 6 }] });
  this.anims.create({ key: 'idle-up', frames: [{ key: 'player', frame: 9 }] });
}
```

3. 实现玩家移动逻辑
```javascript
// 玩家移动逻辑
update() {
  // 获取方向键输入
  const cursors = this.input.keyboard.createCursorKeys();
  
  // 设置默认速度
  const speed = 100;
  let velocity = { x: 0, y: 0 };
  let direction = this.playerDirection || 'down'; // 记住玩家朝向
  
  // 根据按键设置速度和方向
  if (cursors.left.isDown) {
    velocity.x = -speed;
    direction = 'left';
  } else if (cursors.right.isDown) {
    velocity.x = speed;
    direction = 'right';
  }
  
  if (cursors.up.isDown) {
    velocity.y = -speed;
    direction = 'up';
  } else if (cursors.down.isDown) {
    velocity.y = speed;
    direction = 'down';
  }
  
  // 对角线移动速度标准化
  if (velocity.x !== 0 && velocity.y !== 0) {
    const factor = 1 / Math.sqrt(2); // 约 0.7071
    velocity.x *= factor;
    velocity.y *= factor;
  }
  
  // 设置玩家速度
  this.player.setVelocity(velocity.x, velocity.y);
  this.playerDirection = direction;
  
  // 播放适当的动画
  if (velocity.x !== 0 || velocity.y !== 0) {
    this.player.anims.play(`walk-${direction}`, true);
  } else {
    this.player.anims.play(`idle-${direction}`, true);
  }
}
```

**验收标准**：
- 玩家角色在屏幕上正确显示
- 使用方向键可以控制玩家向四个方向移动
- 玩家动画根据移动状态和方向正确切换
- 玩家与墙壁等碰撞区域发生物理碰撞

### 任务3：音效系统实现

**描述**：为玩家移动和环境添加基础音效

**步骤**：
1. 准备音效资源
   - 收集脚步声音效
   - 准备环境背景音效（如室内环境音）
   - 将音效文件放入 public/assets/audio/ 目录

2. 在PreloadScene中加载音效
```javascript
// 音效加载代码
preload() {
  // ... 其他资源加载 ...
  
  // 加载音效
  this.load.audio('footsteps', 'assets/audio/footsteps.wav');
  this.load.audio('ambient', 'assets/audio/ambient.mp3');
}
```

3. 在GameScene中实现音效播放
```javascript
// 音效实现代码
create() {
  // ... 其他初始化代码 ...
  
  // 创建音效对象
  this.footstepSound = this.sound.add('footsteps', { 
    volume: 0.3,
    rate: 1.2,
    loop: false 
  });
  
  this.ambientSound = this.sound.add('ambient', {
    volume: 0.1,
    loop: true
  });
  
  // 播放环境音
  this.ambientSound.play();
  
  // 玩家移动状态跟踪
  this.isPlayerMoving = false;
}

update() {
  // ... 获取玩家输入 ...
  
  // 检测玩家是否移动
  const isMovingNow = velocity.x !== 0 || velocity.y !== 0;
  
  // 玩家从静止开始移动时播放脚步声
  if (isMovingNow && !this.isPlayerMoving) {
    this.footstepSound.play();
  } 
  // 玩家停止移动时停止脚步声
  else if (!isMovingNow && this.isPlayerMoving) {
    this.footstepSound.stop();
  }
  
  // 更新移动状态
  this.isPlayerMoving = isMovingNow;
}
```

**验收标准**：
- 玩家开始移动时播放脚步声音效
- 玩家停止移动时停止脚步声音效
- 环境音乐在场景开始时自动播放

## 测试计划

### 单元测试

- 测试瓦片地图加载与渲染
- 测试玩家输入处理
- 测试动画状态切换
- 测试碰撞检测系统

### 功能测试

| 测试场景 | 预期结果 | 测试方法 |
|---------|----------|---------|
| 玩家移动 | 玩家角色平滑移动，动画正确切换 | 手动测试 |
| 碰撞检测 | 玩家不能穿墙，不能离开地图 | 手动测试 |
| 图层深度 | 玩家可以走到某些物体下方 | 手动测试 |
| 音效播放 | 移动开始播放脚步声，停止时音效停止 | 手动测试 |
| 输入响应 | 按键响应流畅，没有明显延迟 | 手动测试 |

### 性能测试

- 地图渲染性能：确保在目标帧率(60 FPS)下流畅渲染
- 内存使用：监控游戏运行时内存占用，确保不超过预期

## 设计文档

### 类图

```
GameScene
├── create()
│   ├── 初始化地图
│   ├── 创建玩家
│   ├── 设置碰撞
│   ├── 设置摄像机
│   └── 初始化音效
├── update()
│   ├── 处理玩家输入
│   ├── 更新玩家位置和动画
│   └── 更新音效状态
└── createPlayerAnimations()
    └── 创建所有玩家动画
```

### 玩家状态机

```
Idle (Down)  <---+
    |            |
    v            |
Walking (Down) --+

Idle (Up)    <---+
    |            |
    v            |
Walking (Up)   --+

Idle (Left)  <---+
    |            |
    v            |
Walking (Left) --+

Idle (Right) <---+
    |            |
    v            |
Walking (Right)--+
```

## 资源清单

1. **瓦片集**：
   - `tileset.png` - 公寓内部瓦片集，包含地板、墙壁、家具等

2. **精灵表**：
   - `player.png` - 玩家角色精灵表，包含四个方向的行走和闲置动画

3. **地图文件**：
   - `apartment.json` - Tiled导出的公寓地图JSON文件

4. **音效文件**：
   - `footsteps.wav` - 脚步声音效
   - `ambient.mp3` - 室内环境背景音

## 风险与缓解策略

| 风险 | 严重程度 | 缓解策略 |
|-----|----------|---------|
| 瓦片地图性能问题 | 中 | 减少图层数量，优化瓦片集大小 |
| 动画帧率不稳定 | 中 | 减少同时播放的动画，优化精灵尺寸 |
| 物理碰撞不准确 | 高 | 调整碰撞体积，使用调试工具可视化碰撞 |
| 输入延迟 | 高 | 简化输入处理逻辑，使用预测机制 |

## 阶段成果物

完成本阶段后，应当交付：

1. 完整的瓦片地图资源和配置
2. 可控制的玩家角色系统
3. 正常工作的碰撞检测系统
4. 基础的音效系统
5. 相机跟随功能

## 下一阶段准备

成功完成本阶段后，为阶段3(NPC与交互系统)准备：

1. 设计NPC行为模式和互动机制
2. 准备NPC精灵资源和动画
3. 规划对话系统的UI设计
4. 构思模拟数据结构，为API设计做准备

## 参考资料

- [Phaser 3 Tilemap 文档](https://photonstorm.github.io/phaser3-docs/Phaser.Tilemaps.Tilemap.html)
- [Tiled Map Editor 官方指南](https://doc.mapeditor.org/en/stable/)
- [像素动画最佳实践](https://medium.com/pixel-grimoire/how-to-start-making-pixel-art-2d1e31a5ceab)
- [游戏音效设计基础](https://www.gamedeveloper.com/audio/a-basic-guide-to-game-audio)
