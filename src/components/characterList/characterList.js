import React from 'react';

const CharacterList = ({ characters = [], onCharacterSelect }) => {
  return (
    <div className="pixel-border p-4 bg-gray-900">
      <h2 className="text-lg mb-2 text-center">公寓居民</h2>
      <div className="grid grid-cols-2 gap-2" id="characterList">
        {characters.map(character => (
          <div 
            key={character.id}
            className={`character-card p-2 rounded bg-gray-800 border-l-4 border-${character.color}-500`}
            onClick={() => onCharacterSelect(character.id)}
          >
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full bg-${character.color}-500 mr-2`}></div>
              <div>
                <h3 className="text-sm">{character.name}</h3>
                <p className="text-xs text-gray-400">{character.currentRoom}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CharacterList;