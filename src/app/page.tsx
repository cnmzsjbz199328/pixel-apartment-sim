"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';

// 组件
import CharacterList from '../components/characterList/characterList';
import CharacterDetails from '../components/characterList/CharacterDetails';
import CommandLine from '../components/commandLine/commandLine';

// 模拟数据
import initialCharacters from '../mock/characters';

// 类型定义
interface Character {
  id: number;
  name: string;
  age: number;
  gender: string;
  personality: string;
  skills: string[];
  relationships: Record<string, string>;
  shortTermMemory: string[];
  longTermMemory: string[];
  currentRoom: string;
  color: string;
}

// 使用类型断言解决dynamic导入问题
const Game = dynamic(() => import('../components/Game'), { ssr: false }) as any;

export default function Home() {
  const [characters] = useState<Character[]>(initialCharacters);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [commandHistory, setCommandHistory] = useState<string[]>([
    '系统初始化中...',
    '加载公寓数据...',
    '生成5位居民...',
    '欢迎来到像素公寓生活模拟器!',
    '输入"help"获取命令列表'
  ]);
  
  // 处理游戏事件
  const handleGameEvent = (type: string, data: any) => {
    switch (type) {
      case 'loading-progress':
        console.log(`加载进度: ${data}%`);
        break;
      case 'loading-complete':
        addCommandOutput('游戏资源加载完成!');
        break;
      case 'command-output':
        addCommandOutput(data);
        break;
      case 'command-response':
        addCommandOutput(data);
        break;
      default:
        console.log('未处理的游戏事件:', type, data);
    }
  };
  
  // 添加命令输出
  const addCommandOutput = (text: string) => {
    setCommandHistory(prev => [...prev, text]);
  };
  
  // 处理命令输入
  const handleCommand = (command: string) => {
    addCommandOutput(command);
    
    // 处理命令
    processCommand(command);
  };
  
  // 处理角色选择
  const handleCharacterSelect = (id: number) => {
    const character = characters.find(c => c.id === id);
    if (character) {
      setSelectedCharacter(character);
      addCommandOutput(`查看人物: ${character.name}的详细信息`);
    }
  };
  
  // 处理命令逻辑
  const processCommand = (command: string) => {
    // 基本命令处理
    if (command.toLowerCase() === 'help') {
      addCommandOutput('可用命令:');
      addCommandOutput('help - 显示帮助信息');
      addCommandOutput('list - 列出所有居民');
      addCommandOutput('view [名字] - 查看居民详情');
      addCommandOutput('clear - 清除命令行输出');
    } 
    else if (command.toLowerCase() === 'list') {
      addCommandOutput('公寓居民列表:');
      characters.forEach(char => {
        addCommandOutput(`${char.name} (${char.age}岁, ${char.gender}, 在${char.currentRoom})`);
      });
    }
    else if (command.toLowerCase() === 'clear') {
      setCommandHistory([]);
    }
    else if (command.startsWith('view ')) {
      const name = command.substring(5).trim();
      const character = characters.find(c => c.name === name);
      if (character) {
        setSelectedCharacter(character);
        addCommandOutput(`查看人物: ${character.name}的详细信息`);
      } else {
        addCommandOutput(`错误: 找不到名为"${name}"的居民`);
      }
    }
    else {
      // 将未处理的命令发送到游戏引擎
      const gameWindow = window as any;
      if (gameWindow.game && gameWindow.game.scene.scenes[1]) {
        gameWindow.game.scene.scenes[1].processCommand(command);
      } else {
        addCommandOutput(`错误: 未知命令"${command}"，输入"help"获取帮助`);
      }
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <div className="container mx-auto p-4">
        <h1 className="text-2xl md:text-3xl mb-6 text-center text-green-400">像素公寓生活模拟器</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1 space-y-4">
            {/* 地图区域 - Phaser游戏 */}
            <Game onGameEvent={handleGameEvent} />
            
            {/* 角色列表 */}
            <CharacterList 
              characters={characters} 
              onCharacterSelect={handleCharacterSelect}
            />
          </div>
          
          <div className="lg:col-span-1">
            {/* 命令行界面 */}
            <CommandLine 
              history={commandHistory} 
              onSubmit={handleCommand} 
            />
          </div>

          <div className="lg:col-span-1">
            {/* 角色详情 */}
            <CharacterDetails character={selectedCharacter} />
          </div>
        </div>
      </div>
    </div>
  );
}