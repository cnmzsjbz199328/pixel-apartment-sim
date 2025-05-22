import React from 'react';

const CharacterDetails = ({ character }) => {
  if (!character) {
    return (
      <div className="pixel-border p-4 bg-gray-900 h-[600px] overflow-y-auto pixel-scrollbar">
        <h2 className="text-lg mb-4 text-center">人物详情</h2>
        <p className="text-center text-gray-500">点击左侧人物查看详情</p>
      </div>
    );
  }

  return (
    <div className="pixel-border p-4 bg-gray-900 h-[600px] overflow-y-auto pixel-scrollbar">
      <h2 className="text-lg mb-4 text-center">{character.name}的详情</h2>
      
      <div className="mb-4 flex justify-center">
        <div className={`w-16 h-16 rounded-full bg-${character.color}-500 flex items-center justify-center text-2xl`}>
          {character.name.charAt(0)}
        </div>
      </div>
      
      <div className="mb-4">
        <h3 className="text-sm text-gray-400 mb-1">基本信息</h3>
        <p>年龄: {character.age}岁</p>
        <p>性别: {character.gender}</p>
        <p>当前位置: {character.currentRoom}</p>
      </div>
      
      <div className="mb-4">
        <h3 className="text-sm text-gray-400 mb-1">性格</h3>
        <p>{character.personality}</p>
      </div>
      
      <div className="mb-4">
        <h3 className="text-sm text-gray-400 mb-1">技能</h3>
        <ul className="list-disc list-inside">
          {character.skills.map((skill, index) => (
            <li key={index}>{skill}</li>
          ))}
        </ul>
      </div>
      
      {/* 其他详细信息... */}
    </div>
  );
};

export default CharacterDetails;