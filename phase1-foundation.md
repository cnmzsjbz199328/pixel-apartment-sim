# 项目阶段1：基础架构开发文档

## 阶段概述

**版本**：Alpha 0.1  
**时间跨度**：1-2周  
**主要目标**：建立基本的游戏框架和环境，实现资源加载和基础场景切换

## 详细技术规格

### 环境要求

- **Node.js**：16.0.0+ LTS
- **NPM**：8.0.0+
- **编辑器**：VS Code 1.60+
- **浏览器**：Chrome 90+（开发环境）

### 依赖库与版本

| 依赖 | 版本 | 用途 |
|------|------|------|
| Phaser | 3.55.2 | 游戏引擎 |
| Vite | 4.3.0+ | 构建工具 |
| ESLint | 8.0.0+ | 代码质量检查 |

## 任务分解

### 任务1：项目初始化

**描述**：创建基本的项目结构和配置文件

**步骤**：
1. 使用Vite创建项目
   ```bash
   npm create vite@latest my-pixel-game --template vanilla
   cd my-pixel-game
   ```

2. 安装核心依赖
   ```bash
   npm install phaser@3.55.2
   npm install --save-dev eslint
   ```

3.创建核心组件
├── components/
│   ├── GameContainer.jsx    # Phaser 游戏容器
│   ├── CharacterList.jsx    # 居民列表组件
│   ├── CommandLine.jsx      # 命令行组件
│   └── CharacterDetails.jsx # 人物详情组件

4. 实现 Phaser 游戏基础功能
在完成整体布局后，再专注于游戏实现:
├── game/
│   ├── scenes/
│   │   ├── PreloadScene.js  # 预加载场景
│   │   ├── GameScene.js     # 游戏主场景
│   ├── utils/
│   │   └── EventBridge.js   # 游戏与UI通信桥

**验收标准**：
- 项目能够成功初始化
- 所有依赖安装成功且无冲突
- 目录结构符合设计规范

### 任务2：配置Vite和ESLint

**描述**：为项目创建必要的配置文件

**具体实现**：

1. 创建Vite配置文件（vite.config.js）：
```javascript
export default {
  base: './',
  server: {
    open: true,
    port: 3000
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  }
};
```

2. 创建ESLint配置文件（.eslintrc.js）：
```javascript
module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  rules: {
    'indent': ['error', 2],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always']
  }
};
```

**验收标准**：
- Vite服务器可以正常启动
- ESLint能够检测代码格式问题

### 任务3：创建HTML入口文件

**描述**：创建游戏的HTML容器

**实现**：
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>2D像素风公寓游戏</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #333;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      color: white;
      font-family: Arial, sans-serif;
    }
    #game {
      box-shadow: 0 0 10px rgba(0,0,0,0.5);
    }
  </style>
</head>
<body>
  <div id="game"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

**验收标准**：
- HTML文件结构正确
- 提供了游戏容器元素
- 样式定义合理且美观

### 任务4：创建基础场景类

**描述**：实现游戏的基础场景系统

1. **PreloadScene.js**

```javascript
import Phaser from 'phaser';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    // 创建加载进度条
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 4, height / 2 - 30, width / 2, 50);
    
    const loadingText = this.add.text(width / 2, height / 2 - 50, '加载中...', {
      font: '20px monospace',
      fill: '#ffffff'
    });
    loadingText.setOrigin(0.5, 0.5);
    
    // 注册加载事件
    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(width / 4 + 10, height / 2 - 20, (width / 2 - 20) * value, 30);
    });
    
    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });
    
    // 加载测试资源
    this.load.image('logo', 'assets/phaser-logo.png');
  }

  create() {
    this.add.text(10, 10, '基础资源加载完成！', { fill: '#ffffff' });
    
    // 延迟2秒后跳转到游戏场景
    this.time.delayedCall(2000, () => {
      this.scene.start('GameScene');
    });
  }
}
```

2. **GameScene.js**

```javascript
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
    
    this.add.text(width / 2, height - 50, '基础游戏场景', {
      font: '24px Arial',
      fill: '#ffffff'
    }).setOrigin(0.5);
    
    // 添加简单交互
    logo.setInteractive();
    logo.on('pointerdown', () => {
      logo.setTint(Math.random() * 0xffffff);
    });
  }

  update() {
    // 留空，稍后添加游戏逻辑
  }
}
```

3. **main.js**

```javascript
import Phaser from 'phaser';
import PreloadScene from './scenes/PreloadScene';
import GameScene from './scenes/GameScene';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game',
  backgroundColor: '#2d2d2d',
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [PreloadScene, GameScene]
};

window.addEventListener('load', () => {
  new Phaser.Game(config);
});
```

**验收标准**：
- 场景类结构符合Phaser 3规范
- 场景之间的切换顺利进行
- 显示加载进度条并正确加载资源

## 测试计划

### 单元测试

- 检查场景加载和切换功能
- 验证资源加载流程

### 功能测试

| 测试场景 | 预期结果 | 测试方法 |
|---------|----------|---------|
| 启动应用 | 显示PreloadScene并加载资源 | 手动测试 |
| 加载完成 | 2秒后自动切换到GameScene | 手动测试 |
| 点击Logo | Logo颜色随机变化 | 手动测试 |
| 窗口调整大小 | 游戏画布自动缩放适应 | 手动测试 |

### 兼容性测试

在以下环境中测试：
- Chrome 最新版
- Firefox 最新版
- Safari 最新版
- Edge 最新版

## 资源清单

为了完成这个阶段，需要准备以下资源：

1. **测试图像**：
   - `phaser-logo.png` - Phaser官方Logo，用于测试资源加载

2. **未来阶段资源规划**：
   - 创建资源命名规范文档
   - 准备像素风艺术风格指南

## 风险与缓解策略

| 风险 | 严重程度 | 缓解策略 |
|-----|----------|---------|
| 依赖版本兼容性问题 | 中 | 锁定依赖版本，创建详细的环境配置文档 |
| Phaser API变更 | 低 | 参考官方文档，设置特定版本 |
| 性能问题 | 低 | 从简单场景开始，逐步增加复杂度 |

## 阶段成果物

完成本阶段后，应当交付：

1. 功能完整的项目基础架构
2. 可运行的测试场景
3. 清晰的代码结构和注释
4. 可用的构建和开发流程

## 下一阶段准备

成功完成本阶段后，需要为阶段2准备：

1. 收集和制作瓦片地图资源
2. 设计并绘制玩家角色精灵
3. 规划玩家移动和碰撞系统
4. 研究Phaser的动画和物理引擎特性

## 参考资料

- [Phaser 3官方文档](https://photonstorm.github.io/phaser3-docs/)
- [Vite官方指南](https://vitejs.dev/guide/)
- [现代JavaScript项目结构最佳实践](https://blog.logrocket.com/organizing-your-code-modern-javascript-project/)
