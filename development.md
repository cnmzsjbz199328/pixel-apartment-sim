# 2D像素风网页游戏开发项目文档

## 项目概述与目标

本项目旨在开发一个2D像素风网页游戏，玩家可以在虚拟公寓中自主移动和与NPC互动。游戏采用Phaser 3作为核心游戏框架，结合Vite进行项目构建，并内置模拟数据以支持前期开发和测试。

### 项目范围定义

**包含在范围内：**
- 2D像素风公寓场景渲染
- 玩家角色移动控制系统
- NPC基本AI和互动系统
- 模拟数据到API的过渡支持
- 基础的音效系统

**不包含在范围内：**
- 多人联机功能
- 角色进度保存系统
- 复杂的AI行为树
- 物品收集与背包系统
- 战斗系统

## 技术栈

在Next.js中嵌入Phaser 3（推荐）
优势:

可以保留您模板中的UI元素（角色列表、命令行等）
充分利用Next.js的路由和状态管理
游戏和UI可以方便地交互和共享数据
部署更灵活，支持服务器端渲染
实现方式:

使用一个专门的容器（如div#game）来挂载Phaser游戏
UI部分使用React组件构建
通过React状态或Context在游戏和UI间传递数据

	•	核心框架: Phaser 3
	◦	理由：专为2D游戏设计，支持像素风美术，内置物理引擎、瓦片地图和动画系统，非常适合网页游戏开发。
	•	构建工具: Vite
	◦	理由：提供快速的开发服务器和热模块替换（HMR），提升开发效率。
	•	资源管理:
	◦	Tiled: 用于创建和管理公寓的瓦片地图。
	◦	Aseprite 或 Piskel: 绘制像素风精灵（如玩家、NPC、家具等）。
	•	代码编辑器: VS Code
	◦	理由：支持JavaScript、Phaser插件和Vite集成，提供良好的开发体验。

### 详细技术规格

- **核心框架**: 
  - Phaser 3.55.2+ (最新稳定版)
  - Canvas渲染模式优先
  - 物理引擋: Arcade Physics

- **构建工具**: 
  - Vite 4.3.0+
  - Node.js 16.0.0+ LTS

- **代码规范**:
  - ES6+标准
  - 代码风格: Airbnb JavaScript风格指南
  - 注释规范: JSDoc格式
  - 代码组织: 模块化设计，单一职责原则

- **性能期望**:
  - 帧率: 稳定60FPS
  - 初始加载时间: <3秒 (关键资源)
  - 内存占用: <500MB
  - 响应式布局: 支持分辨率800x600至1920x1080

## 目录结构
一个清晰的目录结构有助于项目管理和维护，以下是推荐结构：
my-pixel-game/
├── public/                   # 静态资源
│   ├── assets/               # 游戏资源
│   │   ├── tileset.png       # 瓦片集
│   │   ├── apartment.json    # Tiled地图文件
│   │   ├── player.png        # 玩家精灵图
│   │   ├── npc.png           # NPC精灵图
│   │   └── step.wav          # 音效（示例）
│   └── index.html            # 入口HTML文件
├── src/                      # 源代码
│   ├── scenes/               # Phaser场景
│   │   ├── PreloadScene.js   # 资源加载场景
│   │   ├── GameScene.js      # 主游戏场景
│   ├── utils/                # 工具函数
│   │   └── mockData.js       # 模拟数据
│   └── main.js               # Phaser游戏入口
├── vite.config.js            # Vite配置文件
├── package.json              # 项目依赖和脚本
└── README.md                 # 项目说明

## 核心功能
	•	场景渲染: 显示像素风公寓地图（墙壁、地板、家具等）。
	•	玩家控制: 使用键盘控制玩家移动，支持行走和闲置动画。
	•	NPC展示: 显示NPC精灵，支持简单动画。
	•	交互模拟: 玩家靠近NPC时，触发模拟的对话或移动效果。
	•	模拟数据: 内置NPC行为数据（对话、移动），后期替换为API响应。

### 用户故事与用例

#### 用户故事1: 玩家移动
**作为** 游戏玩家，  
**我想要** 使用方向键控制角色在公寓中移动，  
**以便** 探索游戏环境并与对象互动。

**验收标准:**
1. 按下上下左右方向键时，玩家角色应向相应方向移动
2. 移动速度应保持在100像素/秒
3. 移动时应播放行走动画，停止时播放闲置动画
4. 玩家不能穿过墙壁和家具
5. 移动时应播放脚步声音效

**边界条件:**
- 玩家同时按下相对方向键时（如上+下），应优先响应最后按下的键
- 玩家触碰地图边界时应停止移动
- 网络延迟时应保持本地移动流畅度

#### 用户故事2: NPC互动
**作为** 游戏玩家，  
**我想要** 当接近NPC时触发互动，  
**以便** 体验游戏的社交元素。

**验收标准:**
1. 玩家角色进入NPC 30像素范围内时触发互动
2. NPC互动包括对话或移动两种行为
3. 对话内容应显示在NPC头顶，持续3秒后消失
4. NPC移动应有平滑的动画过渡

**交互流程:**
1. 玩家使用方向键移动角色接近NPC
2. 系统检测到玩家进入互动范围
3. 系统从模拟数据/API获取NPC行为
4. 系统执行相应的NPC行为动画和效果
5. 玩家可以继续移动或选择留在交互区域

### 数据规格与验证规则

#### 玩家数据规格
```javascript
{
  position: { x: Number, y: Number }, // 玩家位置，单位:像素
  velocity: { x: Number, y: Number }, // 移动速度，范围:-100至100
  direction: String, // 枚举值: 'up', 'down', 'left', 'right'
  state: String, // 枚举值: 'idle', 'walking', 'interacting'
  interaction: { 
    active: Boolean, 
    target: String, // NPC的唯一ID
    duration: Number // 交互持续时间，单位:毫秒
  }
}
```

#### NPC数据规格
```javascript
{
  id: String, // 唯一标识符
  position: { x: Number, y: Number }, // NPC位置
  type: String, // NPC类型，用于决定外观
  actions: [
    {
      action: String, // 'speak' 或 'move'
      dialogue?: String, // action为'speak'时的对话文本
      targetPos?: { x: Number, y: Number }, // action为'move'时的目标位置
      duration?: Number // 动作持续时间，单位:毫秒
    }
  ],
  interactionRadius: Number, // 玩家能触发互动的距离
  cooldown: Number // 两次互动间的冷却时间，单位:毫秒
}
```

**数据验证规则:**
- 位置坐标不得超出地图边界(0,0至地图最大尺寸)
- 对话文本长度限制为5-100个字符
- 移动目标位置必须是可到达的(非碰撞区域)
- 互动半径最小10像素，最大100像素
- 冷却时间最短500毫秒，最长10000毫秒

**安全考虑:**
- 所有用户输入(如自定义对话)需进行XSS过滤
- 向API请求数据时使用HTTPS
- 本地存储的游戏数据需使用浏览器安全存储机制

### 接口定义

#### 1. NPC行为API

**端点:** `/api/npc-actions`  
**方法:** GET  
**参数:**
```
npcId: String (必填) - NPC的唯一标识符
playerPosition: {x: Number, y: Number} - 玩家当前位置
```

**返回值:**
```javascript
{
  action: String, // "speak" 或 "move"
  dialogue?: String, // 当action为"speak"时的对话内容
  targetPos?: { x: Number, y: Number }, // 当action为"move"时的目标位置
  duration: Number // 动作持续时间(毫秒)
}
```

**错误处理:**
```javascript
{
  error: String, // 错误类型
  message: String, // 错误详细信息
  code: Number // 错误代码
}
```

#### 本地模拟数据实现:
```javascript
export function getMockNPCAction(npcId, playerPosition) {
  // 根据npcId和playerPosition计算适当的行为
  const distanceFromPlayer = Math.sqrt(
    Math.pow(playerPosition.x - npc.position.x, 2) + 
    Math.pow(playerPosition.y - npc.position.y, 2)
  );
  
  // 基于距离选择不同行为
  if (distanceFromPlayer < 50) {
    return { 
      action: 'speak', 
      dialogue: '你好，玩家！距离真近啊。', 
      duration: 3000 
    };
  } else {
    return { 
      action: 'move', 
      targetPos: { x: playerPosition.x - 30, y: playerPosition.y - 30 }, 
      duration: 2000 
    };
  }
}
```

### 测试标准

#### 单元测试
- 使用Jest进行单元测试
- 所有工具函数必须有至少80%的测试覆盖率
- 模拟数据生成函数必须测试所有可能的输出类型

#### 功能测试
**场景渲染测试:**
- 地图正确加载，所有图层显示正确
- 碰撞区域设置正确，玩家无法穿墙
- 瓦片动画(如流水)正确播放

**玩家控制测试:**
1. 每个方向键都能正确控制玩家移动
2. 玩家移动时动画正确切换
3. 玩家碰撞检测正确工作
4. 音效在移动开始时正确触发

**NPC互动测试:**
1. 玩家进入指定范围时触发互动
2. NPC对话气泡正确显示和消失
3. NPC移动路径正确且无碰撞
4. 多个NPC同时存在时互动不冲突

**成功标准:**
- 游戏在Chrome, Firefox, Safari最新版中能流畅运行(60FPS)
- 加载时间少于3秒(在标准网络环境下)
- 玩家操作响应时间小于16ms(一帧)

### 代码示例与参考

#### Phaser场景切换示例
```javascript
class GameManager {
  constructor() {
    this.scenes = {
      boot: BootScene,
      preload: PreloadScene,
      main: GameScene,
      ui: UIScene
    };
  }
  
  switchToScene(sceneName, data = {}) {
    if (this.scenes[sceneName]) {
      this.game.scene.start(sceneName, data);
      this.game.scene.bringToTop(sceneName);
      // 可选：停止其他场景
      Object.keys(this.scenes).forEach(key => {
        if (key !== sceneName && key !== 'ui') {
          this.game.scene.pause(key);
        }
      });
    }
  }
}
```

#### NPC行为状态机示例
```javascript
class NPCController {
  constructor(sprite, config) {
    this.sprite = sprite;
    this.config = config;
    this.state = 'idle';
    this.stateHandlers = {
      idle: this.handleIdleState.bind(this),
      walking: this.handleWalkingState.bind(this),
      talking: this.handleTalkingState.bind(this)
    };
  }
  
  update(time, delta) {
    // 调用当前状态的处理函数
    if (this.stateHandlers[this.state]) {
      this.stateHandlers[this.state](time, delta);
    }
  }
  
  changeState(newState, stateData = {}) {
    this.state = newState;
    this.stateData = stateData;
    // 播放对应状态的动画
    this.sprite.anims.play(`npc-${this.state}`, true);
  }
  
  // 示例状态处理函数
  handleWalkingState(time, delta) {
    const { targetX, targetY } = this.stateData;
    // 实现平滑移动逻辑
  }
}
```

#### 期望输出示例

**NPC对话气泡:**
```
 _________________________
|                         |
| 欢迎来到我的公寓！      |
|_________________________|
        |
        |
     [NPC精灵]
```

**调试信息面板:**
```
FPS: 60
玩家位置: x=120, y=150
当前场景: GameScene
活动NPC: 3
内存使用: 150MB
```

## 实现步骤
步骤 1：设置项目环境
	1	初始化项目
	◦	使用Vite创建项目： npm create vite@latest my-pixel-game --template vanilla
	◦	cd my-pixel-game
	◦	
	◦	安装Phaser： npm install phaser
	◦	
	2	配置Vite
	◦	编辑 vite.config.js： export default {
	◦	  base: './',
	◦	  server: {
	◦	    open: true,
	◦	  },
	◦	};
	◦	
	3	创建入口HTML
	◦	编辑 public/index.html：
	◦	
	◦	
	◦	  	
	◦	  	
	◦	  	
	◦	  	
	◦	
	◦	
	◦	  	
	◦	  	
	◦	
	◦	
	◦	
步骤 2：实现资源加载场景（PreloadScene）
	•	创建 src/scenes/PreloadScene.js： import Phaser from 'phaser';
	•	
	•	export default class PreloadScene extends Phaser.Scene {
	•	  constructor() {
	•	    super({ key: 'PreloadScene' });
	•	  }
	•	
	•	  preload() {
	•	    this.load.image('tiles', 'assets/tileset.png');
	•	    this.load.tilemapTiledJSON('map', 'assets/apartment.json');
	•	    this.load.spritesheet('player', 'assets/player.png', { frameWidth: 16, frameHeight: 16 });
	•	    this.load.spritesheet('npc', 'assets/npc.png', { frameWidth: 16, frameHeight: 16 });
	•	    this.load.audio('step', 'assets/step.wav');
	•	  }
	•	
	•	  create() {
	•	    this.scene.start('GameScene');
	•	  }
	•	}
	•	
步骤 3：实现主游戏场景（GameScene）
	•	创建 src/scenes/GameScene.js： import Phaser from 'phaser';
	•	import { getMockNPCAction } from '../utils/mockData';
	•	
	•	export default class GameScene extends Phaser.Scene {
	•	  constructor() {
	•	    super({ key: 'GameScene' });
	•	  }
	•	
	•	  create() {
	•	    // 加载地图
	•	    const map = this.make.tilemap({ key: 'map' });
	•	    const tileset = map.addTilesetImage('tileset', 'tiles');
	•	    const groundLayer = map.createLayer('Ground', tileset, 0, 0);
	•	    const decorLayer = map.createLayer('Decor', tileset, 0, 0);
	•	    const collisionLayer = map.createLayer('Collision', tileset, 0, 0);
	•	    collisionLayer.setCollisionByExclusion([-1]);
	•	
	•	    // 玩家
	•	    this.player = this.physics.add.sprite(100, 100, 'player');
	•	    this.physics.add.collider(this.player, collisionLayer);
	•	    this.cameras.main.startFollow(this.player);
	•	
	•	    // NPC
	•	    this.npc = this.physics.add.sprite(200, 200, 'npc');
	•	    this.physics.add.collider(this.npc, collisionLayer);
	•	
	•	    // 动画
	•	    this.anims.create({
	•	      key: 'walk-down',
	•	      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 2 }),
	•	      frameRate: 10,
	•	      repeat: -1
	•	    });
	•	    this.anims.create({ key: 'idle', frames: [{ key: 'player', frame: 0 }] });
	•	
	•	    // 交互：玩家靠近NPC时触发模拟行为
	•	    this.physics.add.overlap(this.player, this.npc, () => {
	•	      const mockData = getMockNPCAction();
	•	      if (mockData.action === 'move') {
	•	        this.tweens.add({
	•	          targets: this.npc,
	•	          x: mockData.targetPos.x,
	•	          y: mockData.targetPos.y,
	•	          duration: 1000,
	•	          onUpdate: () => this.npc.anims.play('walk-down', true)
	•	        });
	•	      } else if (mockData.action === 'speak') {
	•	        this.add.text(this.npc.x, this.npc.y - 20, mockData.dialogue, {
	•	          color: '#fff',
	•	          fontSize: '12px'
	•	        }).setDepth(10);
	•	      }
	•	    });
	•	  }
	•	
	•	  update() {
	•	    const cursors = this.input.keyboard.createCursorKeys();
	•	    const speed = 100;
	•	    this.player.setVelocity(0);
	•	
	•	    if (cursors.left.isDown) {
	•	      this.player.setVelocityX(-speed);
	•	      this.player.anims.play('walk-down', true);
	•	      if (!this.sound.get('step').isPlaying) this.sound.play('step');
	•	    } else if (cursors.right.isDown) {
	•	      this.player.setVelocityX(speed);
	•	      this.player.anims.play('walk-down', true);
	•	      if (!this.sound.get('step').isPlaying) this.sound.play('step');
	•	    } else if (cursors.up.isDown) {
	•	      this.player.setVelocityY(-speed);
	•	      this.player.anims.play('walk-down', true);
	•	      if (!this.sound.get('step').isPlaying) this.sound.play('step');
	•	    } else if (cursors.down.isDown) {
	•	      this.player.setVelocityY(speed);
	•	      this.player.anims.play('walk-down', true);
	•	      if (!this.sound.get('step').isPlaying) this.sound.play('step');
	•	    } else {
	•	      this.player.anims.play('idle', true);
	•	    }
	•	  }
	•	}
	•	
步骤 4：实现模拟数据
	•	创建 src/utils/mockData.js： export function getMockNPCAction() {
	•	  const actions = [
	•	    { action: 'speak', dialogue: '欢迎来到我的公寓！' },
	•	    { action: 'speak', dialogue: '很高兴再次见到你！' },
	•	    { action: 'move', targetPos: { x: 300, y: 200 } },
	•	    { action: 'move', targetPos: { x: 150, y: 150 } }
	•	  ];
	•	  return actions[Math.floor(Math.random() * actions.length)];
	•	}
	•	
	◦	后期替换为API：将 getMockNPCAction() 替换为API调用，例如： async function getNPCAction() {
	◦	  const response = await fetch('https://my-game-api.com/npc-action');
	◦	  return await response.json();
	◦	}
	◦	
步骤 5：游戏入口
	•	编辑 src/main.js： import Phaser from 'phaser';
	•	import PreloadScene from './scenes/PreloadScene';
	•	import GameScene from './scenes/GameScene';
	•	
	•	const config = {
	•	  type: Phaser.AUTO,
	•	  width: 800,
	•	  height: 600,
	•	  parent: 'game',
	•	  physics: { default: 'arcade', arcade: { gravity: { y: 0 } } },
	•	  scene: [PreloadScene, GameScene],
	•	  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }
	•	};
	•	
	•	new Phaser.Game(config);
	•	
步骤 6：测试与运行
	•	运行开发服务器： npm run dev
	•	
	•	访问 http://localhost:5173/，测试游戏功能（玩家移动、NPC交互等）。

## 模拟数据的优势与替换
	•	当前阶段: 使用 mockData.js 提供内置模拟数据，确保前端逻辑（如玩家与NPC交互）无需依赖后端即可运行和测试。
	•	后期替换: 当后端API就绪后，只需将 getMockNPCAction() 替换为真实的API调用（如使用 fetch 或 axios），无需修改其他核心逻辑，保证无缝切换。

## 资源准备
	•	瓦片集: 从 OpenGameArt 或 Kenney Assets 获取免费像素风瓦片。
	•	精灵图: 使用 Aseprite 绘制玩家和NPC的像素风动画。
	•	音效: 从 Freesound 下载免费音效（如脚步声）。

## 建议
	•	分阶段开发:
	1	先实现地图加载和玩家移动。
	2	添加NPC和模拟交互逻辑。
	3	测试模拟数据，确保交互正常。
	•	调试: 使用Chrome DevTools检查动画、碰撞和模拟数据触发情况。
	•	美术风格: 保持像素风一致性，建议参考《星露谷物语》的调色板和设计。

这个项目大纲为你提供了一个完整的前端开发框架，内置模拟数据（mockData.js）确保前端可以独立运行和测试，同时为后期API集成预留了空间。如果你需要更详细的代码、资源推荐或有其他问题，请随时告诉我！
