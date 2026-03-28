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
          className="window-control-btn"
          title="Minimizar"
        >
          <Minus size={16} strokeWidth={1.5} />
        </button>
        <button 
          onClick={handleMaximize}
          className="window-control-btn"
          title="Maximizar"
        >
          <Square size={12} strokeWidth={1.5} />
        </button>
        <button 
          onClick={handleClose}
          className="window-control-btn close-btn"
          title="Cerrar"
        >
          <X size={16} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
};

export default TitleBar;
