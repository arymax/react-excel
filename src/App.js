import React, { useState } from 'react';
import SharedEditing from './ShareEditing';
import DataAnalysis from './DataAnalysis';
import { motion } from 'framer-motion';
import './App.css';

function App() {
  const [showComponent, setShowComponent] = useState('');

  // 用于切换显示组件的函数
  const handleComponentSwitch = (componentName) => {
    setShowComponent(componentName);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className={`app-container ${!showComponent ? 'home-container' : ''}`}
    >
      {!showComponent && (
        <div className="welcome-container">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1 }}
            className="welcome-message"
          >
            歡迎來到雲端資料平台
          </motion.div>
          <div className="button-container">
            <button onClick={() => handleComponentSwitch('sharedEditing')} className="app-button">共用Excel</button>
            <button onClick={() => handleComponentSwitch('dataAnalysis')} className="app-button">資料分析</button>
          </div>
        </div>
      )}

      {showComponent === 'sharedEditing' && <SharedEditing />}
      {showComponent === 'dataAnalysis' && <DataAnalysis />}
    </motion.div>
  );
}

export default App;
