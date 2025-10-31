/**
 * Centralized logging utility for error tracking and debugging
 * Stores logs in IndexedDB and console, with optional remote logging capability
 */

const LOG_LEVELS = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR'
};

const MAX_LOGS = 500; // Keep last 500 logs
const DB_NAME = 'workout_logs';
const STORE_NAME = 'logs';

class Logger {
  constructor() {
    this.db = null;
    this.initDB();
    this.setupGlobalErrorHandlers();
  }

  /**
   * Initialize IndexedDB for persistent logging
   */
  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);

      request.onerror = () => {
        console.warn('Failed to initialize logging database');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  /**
   * Store log in IndexedDB
   */
  async saveToDB(logEntry) {
    if (!this.db) return;

    try {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      store.add(logEntry);

      // Clean up old logs if exceeding MAX_LOGS
      const countRequest = store.count();
      countRequest.onsuccess = () => {
        if (countRequest.result > MAX_LOGS) {
          const getAllKeys = store.getAllKeys();
          getAllKeys.onsuccess = () => {
            const keysToDelete = getAllKeys.result.slice(0, countRequest.result - MAX_LOGS);
            keysToDelete.forEach((key) => store.delete(key));
          };
        }
      };
    } catch (error) {
      console.error('Failed to save log to DB:', error);
    }
  }

  /**
   * Format log entry with metadata
   */
  formatEntry(level, message, data = {}) {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      userAgent: navigator.userAgent,
      url: window.location.href,
      data,
    };
  }

  /**
   * Core logging method
   */
  log(level, message, data = {}) {
    const entry = this.formatEntry(level, message, data);
    
    // Log to console based on level
    const consoleMethod = level === 'ERROR' ? 'error' : level === 'WARN' ? 'warn' : 'log';
    console[consoleMethod](`[${entry.timestamp}] ${level}: ${message}`, data);

    // Save to IndexedDB
    this.saveToDB(entry);

    // Optional: Send critical errors to remote logging service
    if (level === 'ERROR') {
      this.sendToRemote(entry);
    }

    return entry;
  }

  /**
   * Public logging methods
   */
  debug(message, data) {
    return this.log(LOG_LEVELS.DEBUG, message, data);
  }

  info(message, data) {
    return this.log(LOG_LEVELS.INFO, message, data);
  }

  warn(message, data) {
    return this.log(LOG_LEVELS.WARN, message, data);
  }

  error(message, error, additionalData = {}) {
    const errorData = {
      ...additionalData,
      errorMessage: error?.message || String(error),
      errorStack: error?.stack || '',
      errorName: error?.name || 'UnknownError',
    };
    return this.log(LOG_LEVELS.ERROR, message, errorData);
  }

  /**
   * Send critical errors to remote logging service
   * (e.g., Sentry, LogRocket, custom backend)
   * Implement based on your monitoring service
   */
  async sendToRemote(entry) {
    // Example implementation (disabled by default):
    // if (process.env.REACT_APP_LOG_ENDPOINT) {
    //   try {
    //     await fetch(process.env.REACT_APP_LOG_ENDPOINT, {
    //       method: 'POST',
    //       headers: { 'Content-Type': 'application/json' },
    //       body: JSON.stringify(entry),
    //     });
    //   } catch (err) {
    //     console.error('Failed to send remote log:', err);
    //   }
    // }
  }

  /**
   * Retrieve logs from IndexedDB
   */
  async getLogs(limit = 100) {
    return new Promise((resolve) => {
      if (!this.db) {
        resolve([]);
        return;
      }

      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const logs = request.result;
        resolve(logs.slice(-limit).reverse()); // Return most recent first
      };

      request.onerror = () => {
        console.error('Failed to retrieve logs');
        resolve([]);
      };
    });
  }

  /**
   * Clear all logs
   */
  async clearLogs() {
    return new Promise((resolve) => {
      if (!this.db) {
        resolve();
        return;
      }

      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        console.log('Logs cleared');
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to clear logs');
        resolve();
      };
    });
  }

  /**
   * Setup global error handlers
   */
  setupGlobalErrorHandlers() {
    // Handle uncaught errors
    window.addEventListener('error', (event) => {
      this.error('Uncaught Error', event.error, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.error('Unhandled Promise Rejection', event.reason, {
        type: 'unhandledrejection',
      });
    });
  }

  /**
   * Export logs for debugging (download as JSON)
   */
  async exportLogs() {
    const logs = await this.getLogs(500);
    const dataStr = JSON.stringify(logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `logs-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
}

// Export singleton instance
export default new Logger();
