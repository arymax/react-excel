import React, { useState } from 'react';
import './App.css';

function SharedEditing() {
  const [embedUrl, setEmbedUrl] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [showIframe, setShowIframe] = useState(false);

  const handleUrlChange = (event) => {
    setInputUrl(event.target.value);
  };

  const updateUrl = () => {
    setEmbedUrl(inputUrl);
    setShowIframe(true);
  };

  return (
    <div className="content-container">
      {!showIframe && (
        <div className="input-container">
          <input type="text" value={inputUrl} onChange={handleUrlChange} placeholder="輸入google sheet網址" className="input-field" />
          <button onClick={updateUrl} className="submit-button">確認</button>
        </div>
      )}
      {showIframe && (
        <div className="iframe-container">
          <iframe src={embedUrl} title="Google Sheets" className="excel-iframe"></iframe>
        </div>
      )}
    </div>
  );
}

export default SharedEditing;