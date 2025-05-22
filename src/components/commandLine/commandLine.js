import React, { useState, useRef, useEffect } from 'react';

const CommandLine = ({ history = [], onSubmit }) => {
  const [command, setCommand] = useState('');
  const outputRef = useRef(null);
  
  useEffect(() => {
    // 滚动到底部
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [history]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && command.trim()) {
      onSubmit(command);
      setCommand('');
    }
  };

  return (
    <div className="pixel-border command-line h-[600px] flex flex-col">
      <div 
        className="p-4 flex-1 overflow-y-auto pixel-scrollbar" 
        ref={outputRef}
        id="commandOutput"
      >
        {history.map((text, index) => (
          <div key={index} className="command-text mb-2">
            <span className="command-prompt">&gt;</span> {text}
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-gray-700 flex items-center">
        <span className="command-prompt mr-2">&gt;</span>
        <input 
          type="text" 
          className="command-input" 
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="输入命令..."
        />
        <span className="cursor-blink ml-1">_</span>
      </div>
    </div>
  );
};

export default CommandLine;