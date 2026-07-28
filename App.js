import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [showUploader, setShowUploader] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('uploads');

  // 🕒 HISTORY STATE
  const [history, setHistory] = useState([]);

  // ⚙️ SETTINGS STATE
  const [maxFileSize, setMaxFileSize] = useState(5); // MBs
  const [darkMode, setDarkMode] = useState(true);
  const [autoClear, setAutoClear] = useState(false);

  // Text / ASCII Progress Bar Generator
  const renderTextProgressBar = (percent) => {
    const totalBlocks = 15;
    const filledBlocks = Math.round((percent / 100) * totalBlocks);
    const emptyBlocks = totalBlocks - filledBlocks;
    return '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);
  };

  const handleFile = (file) => {
    setError('');
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('❌ Only image files (PNG, JPG, JPEG) are allowed!');
      return;
    }

    if (file.size > maxFileSize * 1024 * 1024) {
      setError(`❌ File size exceeds ${maxFileSize}MB limit!`);
      return;
    }

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select an image first!');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      setLoading(true);
      setError('');
      setProgress(0);

      let currentProgress = 0;
      const progressInterval = setInterval(() => {
        currentProgress += 10;
        if (currentProgress <= 90) {
          setProgress(currentProgress);
        }
      }, 150);

      const response = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      clearInterval(progressInterval);
      setProgress(100);

      setTimeout(() => {
        const newUrl = response.data.fileUrl;
        setUploadedUrl(newUrl);
        setLoading(false);

        // 🟢 SAVE TO HISTORY AUTOMATICALLY
        const newHistoryItem = {
          id: Date.now(),
          fileName: selectedFile.name,
          fileSize: (selectedFile.size / (1024 * 1024)).toFixed(2) + ' MB',
          url: newUrl,
          timestamp: new Date().toLocaleString()
        };

        setHistory((prev) => [newHistoryItem, ...prev]);

        if (autoClear) {
          setTimeout(() => {
            handleReset();
          }, 3000);
        }

      }, 400);

    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Upload failed! Make sure backend is running.');
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreview(null);
    setUploadedUrl('');
    setProgress(0);
    setError('');
  };

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear upload history?")) {
      setHistory([]);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        * {
          box-sizing: border-box;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        body {
          margin: 0;
          background: ${darkMode ? '#0d1117' : '#f1f5f9'};
          color: ${darkMode ? '#f8fafc' : '#0f172a'};
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow-x: hidden;
          transition: background 0.3s ease, color 0.3s ease;
        }

        /* 🌸 PURPLE MOBILE SPLASH SCREEN */
        .mobile-splash-bg {
          width: 100vw;
          height: 100vh;
          background: linear-gradient(135deg, #a855f7 0%, #7e22ce 50%, #581c87 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .bg-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.6;
        }

        .blob-1 {
          width: 350px;
          height: 350px;
          background: #f472b6;
          top: -50px;
          right: -50px;
        }

        .blob-2 {
          width: 400px;
          height: 400px;
          background: #3b82f6;
          bottom: -100px;
          left: -100px;
        }

        .phone-mockup {
          width: 320px;
          height: 600px;
          background: #ffffff;
          border-radius: 40px;
          border: 10px solid #ffffff;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.35);
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          z-index: 10;
        }

        .speaker-notch {
          width: 90px;
          height: 6px;
          background: #e2e8f0;
          border-radius: 10px;
          margin: 8px auto 0 auto;
        }

        .splash-content {
          flex: 1;
          background: #f8fafc;
          padding: 30px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          position: relative;
          text-align: center;
          color: #1e293b;
        }

        .phone-wave {
          position: absolute;
          border-radius: 50%;
          z-index: 1;
        }

        .wave-top {
          width: 220px;
          height: 220px;
          background: #f472b644;
          top: -80px;
          right: -80px;
        }

        .wave-bottom {
          width: 280px;
          height: 280px;
          background: #e9d5ff;
          bottom: -100px;
          left: -80px;
        }

        .illustration-box {
          margin-top: 40px;
          position: relative;
          z-index: 2;
          width: 140px;
          height: 140px;
          background: linear-gradient(135deg, #f3e8ff, #fae8ff);
          border-radius: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 25px rgba(168, 85, 247, 0.15);
        }

        /* 🖼️ DUAL PICS STYLING */
        .pics-container {
          position: relative;
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pic-card {
          position: absolute;
          width: 58px;
          height: 58px;
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 6px 15px rgba(126, 34, 206, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          border: 2px solid #f3e8ff;
        }

        .pic-1 {
          transform: rotate(-12deg) translate(-10px, -5px);
          z-index: 1;
        }

        .pic-2 {
          transform: rotate(10deg) translate(10px, 5px);
          z-index: 2;
          background: #faf5ff;
        }

        .sparkle {
          position: absolute;
          color: #c084fc;
          font-size: 14px;
        }

        .sp-1 { top: 10px; right: 15px; }
        .sp-2 { bottom: 15px; left: 15px; }
        .sp-3 { top: 25px; left: 20px; font-size: 20px; }

        .text-section {
          z-index: 2;
          margin-top: 20px;
        }

        .text-section h2 {
          font-size: 20px;
          font-weight: 800;
          color: #2e1065;
          letter-spacing: 1px;
          margin-bottom: 10px;
        }

        .text-section p {
          font-size: 12px;
          color: #64748b;
          line-height: 1.6;
          padding: 0 10px;
        }

        .bottom-action {
          width: 100%;
          display: flex;
          justify-content: flex-end;
          z-index: 2;
          margin-bottom: 10px;
        }

        .next-pill-btn {
          background: #ffffff;
          border: none;
          padding: 6px 6px 6px 20px;
          border-radius: 30px;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .next-pill-btn:hover {
          transform: translateY(-2px);
        }

        .next-pill-btn span {
          font-size: 12px;
          font-weight: 700;
          color: #6b21a8;
          letter-spacing: 1px;
        }

        .arrow-circle {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #a855f7, #7e22ce);
          color: #ffffff !important;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        }

        /* 🖥️ MAIN DASHBOARD STYLES */
        .dashboard-container {
          display: flex;
          width: 90vw;
          max-width: 1200px;
          height: 85vh;
          background: ${darkMode ? '#161b22' : '#ffffff'};
          border-radius: 16px;
          border: 1px solid ${darkMode ? '#30363d' : '#e2e8f0'};
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.3);
          overflow: hidden;
          margin: auto;
        }

        .sidebar {
          width: 220px;
          background: ${darkMode ? '#0d1117' : '#f8fafc'};
          border-right: 1px solid ${darkMode ? '#21262d' : '#e2e8f0'};
          padding: 20px 15px;
          display: flex;
          flex-direction: column;
        }

        .window-dots {
          display: flex;
          gap: 8px;
          margin-bottom: 30px;
        }

        .dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .dot.red { background: #ff5f56; }
        .dot.yellow { background: #ffbd2e; }
        .dot.green { background: #27c93f; }

        .nav-menu {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          background: transparent;
          border: none;
          color: ${darkMode ? '#8b949e' : '#64748b'};
          padding: 10px 16px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .nav-item:hover, .nav-item.active {
          background: ${darkMode ? '#21262d' : '#e2e8f0'};
          color: ${darkMode ? '#f0f6fc' : '#0f172a'};
        }

        .sidebar-footer {
          margin-top: auto;
        }

        .back-splash-btn {
          background: transparent;
          border: 1px solid ${darkMode ? '#30363d' : '#cbd5e1'};
          color: ${darkMode ? '#8b949e' : '#64748b'};
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 12px;
          width: 100%;
        }

        .main-content {
          flex: 1;
          padding: 25px 35px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .top-search-bar {
          background: ${darkMode ? '#0d1117' : '#f8fafc'};
          border: 1px solid ${darkMode ? '#30363d' : '#cbd5e1'};
          border-radius: 12px;
          padding: 10px 16px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .top-search-bar input {
          background: transparent;
          border: none;
          color: ${darkMode ? '#f0f6fc' : '#0f172a'};
          font-size: 14px;
          width: 100%;
          outline: none;
        }

        .top-search-bar input::placeholder {
          color: #6e7681;
        }

        .storage-widget {
          background: ${darkMode ? '#0d1117' : '#f8fafc'};
          border: 1px solid ${darkMode ? '#21262d' : '#e2e8f0'};
          border-radius: 14px;
          padding: 18px 20px;
        }

        .multi-bar {
          display: flex;
          height: 12px;
          border-radius: 10px;
          overflow: hidden;
          background: #21262d;
          margin-bottom: 12px;
        }

        .bar-segment.pink { background: #ff2a85; }
        .bar-segment.cyan { background: #00f2fe; }
        .bar-segment.gray { background: #484f58; }

        .storage-legends {
          display: flex;
          gap: 20px;
          font-size: 12px;
          color: ${darkMode ? '#8b949e' : '#64748b'};
          flex-wrap: wrap;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .color-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .color-dot.pink { background: #ff2a85; }
        .color-dot.cyan { background: #00f2fe; }
        .color-dot.gray { background: #484f58; }

        .folder-header {
          margin-top: 5px;
        }

        .folder-title {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .folder-title h2 {
          margin: 0;
          font-size: 20px;
        }

        .breadcrumb {
          font-size: 13px;
          color: #6e7681;
          margin-top: 4px;
        }

        .upload-workspace {
          margin-top: 10px;
        }

        .drop-zone {
          border: 2px dashed #00f2fe;
          border-radius: 16px;
          padding: 30px;
          text-align: center;
          background: rgba(0, 242, 254, 0.02);
          transition: all 0.2s ease;
        }

        .drop-zone:hover {
          background: rgba(0, 242, 254, 0.05);
        }

        .upload-icon {
          font-size: 36px;
          margin-bottom: 8px;
        }

        .browse-btn, .start-btn, .upload-btn, .clear-btn {
          background: linear-gradient(135deg, #00f2fe, #4f46e5);
          color: #ffffff;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          display: inline-block;
          margin-top: 10px;
        }

        .clear-btn {
          background: #ef4444;
        }

        .preview-container, .success-container {
          margin-top: 20px;
          background: ${darkMode ? '#0d1117' : '#f8fafc'};
          padding: 20px;
          border-radius: 14px;
          border: 1px solid ${darkMode ? '#21262d' : '#e2e8f0'};
        }

        .preview-header {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          color: #8b949e;
          margin-bottom: 12px;
        }

        .image-wrapper {
          width: 100%;
          max-height: 200px;
          overflow: hidden;
          border-radius: 10px;
          margin-bottom: 15px;
        }

        .image-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .ascii-bar {
          font-family: monospace;
          font-size: 16px;
          color: #00f2fe;
          letter-spacing: 2px;
          margin-bottom: 8px;
          text-align: center;
          background: ${darkMode ? '#161b22' : '#ffffff'};
          padding: 8px;
          border-radius: 6px;
          border: 1px solid ${darkMode ? '#30363d' : '#cbd5e1'};
        }

        .progress-bar-bg {
          width: 100%;
          height: 8px;
          background: #21262d;
          border-radius: 10px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #ff2a85, #00f2fe);
          transition: width 0.2s ease-in-out;
        }

        .error-badge {
          background: rgba(239, 68, 68, 0.15);
          color: #f87171;
          padding: 10px;
          border-radius: 8px;
          font-size: 13px;
          margin-top: 15px;
        }

        .url-box {
          background: ${darkMode ? '#161b22' : '#ffffff'};
          padding: 10px;
          border-radius: 8px;
          word-break: break-all;
          font-size: 12px;
          margin-bottom: 15px;
          border: 1px solid ${darkMode ? '#30363d' : '#cbd5e1'};
        }

        .url-box a {
          color: #00f2fe;
        }

        /* 🕒 HISTORY UI STYLES */
        .history-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 15px;
        }

        .history-card {
          display: flex;
          align-items: center;
          gap: 15px;
          background: ${darkMode ? '#0d1117' : '#f8fafc'};
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid ${darkMode ? '#21262d' : '#e2e8f0'};
        }

        .history-thumb {
          width: 50px;
          height: 50px;
          border-radius: 8px;
          object-fit: cover;
        }

        .history-info {
          flex: 1;
        }

        .history-info h4 {
          margin: 0 0 4px 0;
          font-size: 14px;
        }

        .history-info p {
          margin: 0;
          font-size: 11px;
          color: #6e7681;
        }

        .view-btn {
          color: #00f2fe;
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
        }

        /* ⚙️ SETTINGS UI STYLES */
        .settings-card {
          background: ${darkMode ? '#0d1117' : '#f8fafc'};
          padding: 20px;
          border-radius: 12px;
          border: 1px solid ${darkMode ? '#21262d' : '#e2e8f0'};
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .setting-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .setting-item label {
          font-size: 14px;
          font-weight: 600;
        }

        .setting-item select, .setting-item input[type="checkbox"] {
          padding: 6px 12px;
          border-radius: 6px;
          background: ${darkMode ? '#161b22' : '#ffffff'};
          color: ${darkMode ? '#ffffff' : '#000000'};
          border: 1px solid ${darkMode ? '#30363d' : '#cbd5e1'};
          cursor: pointer;
        }
      `}</style>

      {/* 🌸 SPLASH SCREEN STATE */}
      {!showUploader ? (
        <div className="mobile-splash-bg">
          <div className="bg-blob blob-1"></div>
          <div className="bg-blob blob-2"></div>

          <div className="phone-mockup">
            <div className="speaker-notch"></div>
            
            <div className="splash-content">
              <div className="phone-wave wave-top"></div>
              <div className="phone-wave wave-bottom"></div>

              {/* 🖼️ UPDATED: DUAL PICTURES ILLUSTRATION */}
              <div className="illustration-box">
                <div className="pics-container">
                  <div className="pic-card pic-1">🏞️</div>
                  <div className="pic-card pic-2">🖼️</div>
                </div>
                <div className="sparkle sp-1">✦</div>
                <div className="sparkle sp-2">✦</div>
                <div className="sparkle sp-3">•</div>
              </div>

              {/* 📝 UPDATED TEXT */}
              <div className="text-section">
                <h2>UPLOAD IMAGES</h2>
                <p>Upload, manage, and store your media seamlessly in high-speed cloud storage.</p>
              </div>

              <div className="bottom-action">
                <button className="next-pill-btn" onClick={() => setShowUploader(true)}>
                  <span>NEXT</span>
                  <span className="arrow-circle">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* 🖥️ DASHBOARD WORKSPACE STATE */
        <div className="dashboard-container">
          <aside className="sidebar">
            <div className="window-dots">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
            </div>

            <nav className="nav-menu">
              <button 
                className={`nav-item ${activeTab === 'uploads' ? 'active' : ''}`}
                onClick={() => setActiveTab('uploads')}
              >
                <span className="nav-icon">📤</span> Uploads
              </button>
              <button 
                className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
              >
                <span className="nav-icon">🕒</span> History ({history.length})
              </button>
              <button 
                className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                <span className="nav-icon">⚙️</span> Settings
              </button>
            </nav>

            <div className="sidebar-footer">
              <button className="back-splash-btn" onClick={() => setShowUploader(false)}>
                ← Back to Splash
              </button>
            </div>
          </aside>

          <main className="main-content">
            <div className="top-search-bar">
              <span className="search-icon">🔍</span>
              <input 
                type="text" 
                placeholder="Search for container..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="storage-widget">
              <div className="multi-bar">
                <div className="bar-segment pink" style={{ width: '45%' }}></div>
                <div className="bar-segment cyan" style={{ width: '15%' }}></div>
                <div className="bar-segment gray" style={{ width: '40%' }}></div>
              </div>

              <div className="storage-legends">
                <span className="legend-item">
                  <span className="color-dot pink"></span> Library is using: 886 GB out of 2TB
                </span>
                <span className="legend-item">
                  <span className="color-dot cyan"></span> In-progress uploads: 0.18 TB
                </span>
                <span className="legend-item">
                  <span className="color-dot gray"></span> Space available: 1.1 TB
                </span>
              </div>
            </div>

            <div className="folder-header">
              <div className="folder-title">
                <span className="folder-icon">📁</span>
                <h2>Colourful</h2>
              </div>
              <div className="breadcrumb">
                📋 / 2025 / Abstract / Colourful
              </div>
            </div>

            {/* TAB 1: UPLOAD WORKSPACE */}
            {activeTab === 'uploads' && (
              <div className="upload-workspace">
                {!uploadedUrl && (
                  <div 
                    className="drop-zone"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                  >
                    <div className="upload-icon">☁️</div>
                    <h3>Drag & Drop your image here</h3>
                    <p>Supports PNG, JPG, JPEG (Max Limit: {maxFileSize}MB)</p>
                    <input 
                      type="file" 
                      accept="image/*" 
                      id="fileInput"
                      onChange={(e) => handleFile(e.target.files[0])}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="fileInput" className="browse-btn">
                      Browse File
                    </label>
                  </div>
                )}

                {error && <div className="error-badge">{error}</div>}

                {preview && !uploadedUrl && (
                  <div className="preview-container">
                    <div className="preview-header">
                      <span>Selected File</span>
                      <span className="file-size">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                    </div>
                    
                    <div className="image-wrapper">
                      <img src={preview} alt="Selected" />
                    </div>

                    {loading && (
                      <div className="progress-section">
                        <div className="progress-label">
                          <span>Uploading...</span>
                          <span>{progress}%</span>
                        </div>

                        <div className="ascii-bar">
                          {renderTextProgressBar(progress)}
                        </div>

                        <div className="progress-bar-bg">
                          <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                        </div>
                      </div>
                    )}

                    {!loading && (
                      <button className="upload-btn" onClick={handleUpload}>
                        Upload to Container ⬆️
                      </button>
                    )}
                  </div>
                )}

                {uploadedUrl && (
                  <div className="success-container">
                    <div className="success-icon">✅</div>
                    <h3>Upload Completed! Saved to History 🕒</h3>
                    <div className="image-wrapper">
                      <img src={uploadedUrl} alt="Uploaded Result" />
                    </div>
                    <div className="url-box">
                      <p><strong>Storage Path:</strong></p>
                      <a href={uploadedUrl} target="_blank" rel="noreferrer">{uploadedUrl}</a>
                    </div>
                    <button className="start-btn" onClick={handleReset}>
                      Upload Another Image
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: HISTORY TAB */}
            {activeTab === 'history' && (
              <div className="history-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3>Upload History ({history.length})</h3>
                  {history.length > 0 && (
                    <button className="clear-btn" onClick={clearHistory}>
                      Clear History 🗑️
                    </button>
                  )}
                </div>

                {history.length === 0 ? (
                  <p style={{ color: '#6e7681', textAlign: 'center', marginTop: '40px' }}>
                    No uploads yet. Upload an image to see it listed here!
                  </p>
                ) : (
                  <div className="history-list">
                    {history
                      .filter(item => item.fileName.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((item) => (
                        <div key={item.id} className="history-card">
                          <img src={item.url} alt={item.fileName} className="history-thumb" />
                          <div className="history-info">
                            <h4>{item.fileName}</h4>
                            <p>{item.fileSize} • Uploaded at: {item.timestamp}</p>
                          </div>
                          <a href={item.url} target="_blank" rel="noreferrer" className="view-btn">
                            View 🔗
                          </a>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: SETTINGS TAB */}
            {activeTab === 'settings' && (
              <div className="settings-section">
                <h3>Console Preferences</h3>
                <div className="settings-card">
                  <div className="setting-item">
                    <label>Maximum File Size Limit (MB):</label>
                    <select value={maxFileSize} onChange={(e) => setMaxFileSize(Number(e.target.value))}>
                      <option value={2}>2 MB</option>
                      <option value={5}>5 MB</option>
                      <option value={10}>10 MB</option>
                    </select>
                  </div>

                  <div className="setting-item">
                    <label>Theme Mode:</label>
                    <select value={darkMode ? 'dark' : 'light'} onChange={(e) => setDarkMode(e.target.value === 'dark')}>
                      <option value="dark">🌙 Dark Mode</option>
                      <option value="light">☀️ Light Mode</option>
                    </select>
                  </div>

                  <div className="setting-item">
                    <label>Auto-clear Preview after Success:</label>
                    <input 
                      type="checkbox" 
                      checked={autoClear} 
                      onChange={(e) => setAutoClear(e.target.checked)} 
                    />
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      )}
    </>
  );
}

export default App;