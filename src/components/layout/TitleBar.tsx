import React from 'react';
import { Minus, Square, X } from 'lucide-react';

const TitleBar: React.FC = () => {
  const win = window as unknown as { 
    process?: { type?: string };
    require?: (module: string) => { ipcRenderer: { send: (channel: string) => void } }
  };
  const isElectron = win.process && win.process.type === 'renderer';

  if (!isElectron) return null;

  const handleMinimize = () => {
    if (win.require) win.require('electron').ipcRenderer.send('window-minimize');
  };

  const handleMaximize = () => {
    if (win.require) win.require('electron').ipcRenderer.send('window-maximize');
  };

  const handleClose = () => {
    if (win.require) win.require('electron').ipcRenderer.send('window-close');
  };

  return (
    <div 
      className="electron-titlebar"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '32px',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        background: 'transparent',
        WebkitAppRegion: 'drag',
        pointerEvents: 'none'
      } as React.CSSProperties}
    >
      <div 
        className="window-controls"
        style={{
          display: 'flex',
          height: '100%',
          WebkitAppRegion: 'no-drag',
          pointerEvents: 'auto'
        } as React.CSSProperties}
      >
        <button 
          onClick={handleMinimize}
          className="hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex items-center justify-center"
          style={{
            width: '46px',
            height: '100%',
            background: 'transparent',
            border: 'none',
            color: 'var(--color-text-main)',
            cursor: 'default',
          }}
        >
          <Minus size={16} strokeWidth={1.5} />
        </button>
        <button 
          onClick={handleMaximize}
          className="hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex items-center justify-center"
          style={{
            width: '46px',
            height: '100%',
            background: 'transparent',
            border: 'none',
            color: 'var(--color-text-main)',
            cursor: 'default',
          }}
        >
          <Square size={12} strokeWidth={1.5} />
        </button>
        <button 
          onClick={handleClose}
          className="hover:bg-[#e81123] hover:text-white transition-colors flex items-center justify-center"
          style={{
            width: '46px',
            height: '100%',
            background: 'transparent',
            border: 'none',
            color: 'var(--color-text-main)',
            cursor: 'default',
          }}
        >
          <X size={16} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
};

export default TitleBar;
