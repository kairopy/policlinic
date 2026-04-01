/**
 * Logger Service
 * Centralized logging utility for the frontend.
 * Sends logs to the backend server to be displayed in the terminal.
 */

const API_BASE_URL = 'http://127.0.0.1:3001';

class Logger {
  private async sendToBackend(level: 'INFO' | 'WARN' | 'ERROR', msg: string, data?: any) {
    // Also log to browser console for local debugging
    const logFn = level === 'ERROR' ? console.error : level === 'WARN' ? console.warn : console.log;
    logFn(`[${level}] ${msg}`, data || '');

    try {
      await fetch(`${API_BASE_URL}/api/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          msg: `[${level}] ${msg}`,
          data: data
        })
      });
    } catch (err) {
      // If backend is unreachable, we silenty fail on the network but keep the local log
      console.warn('Logger: Could not send log to backend', err);
    }
  }

  info(msg: string, data?: any) {
    this.sendToBackend('INFO', msg, data);
  }

  warn(msg: string, data?: any) {
    this.sendToBackend('WARN', msg, data);
  }

  error(msg: string, error?: any) {
    // If it's a real Error object, extract message and stack
    const errorData = error instanceof Error ? { 
      message: error.message, 
      stack: error.stack,
      name: error.name 
    } : error;
    
    this.sendToBackend('ERROR', msg, errorData);
  }
}

export const logger = new Logger();
