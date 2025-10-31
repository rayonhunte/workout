import React, { useState, useEffect } from 'react';
import { FiX, FiDownload, FiTrash2 } from 'react-icons/fi';
import logger from '../utils/logger';
import { auth } from '../firebase';

/**
 * Debug Console - displays and manages application logs
 * Only visible in local development or when rayon.hunte@gmail.com is logged in
 * Access via keyboard shortcut (Ctrl+Shift+L or Cmd+Shift+L on Mac)
 */
export default function DebugConsole() {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('ERROR'); // ERROR, WARN, INFO, DEBUG, ALL
  const [autoScroll, setAutoScroll] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authorized to see debug console
  useEffect(() => {
    const checkAuthorization = () => {
      const isLocalDev = import.meta.env.DEV || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      // Check if current user is authorized
      const unsubscribe = auth.onAuthStateChanged((user) => {
        const isAuthorizedUser = user?.email === 'rayon.hunte@gmail.com';
        setIsAuthorized(isLocalDev || isAuthorizedUser);
        setIsLoading(false);
      });

      return unsubscribe;
    };

    const unsubscribe = checkAuthorization();
    return () => unsubscribe?.();
  }, []);

  // Load logs when console opens
  useEffect(() => {
    if (isOpen && isAuthorized) {
      loadLogs();
    }
  }, [isOpen, isAuthorized]);

  const loadLogs = async () => {
    const allLogs = await logger.getLogs(100);
    setLogs(allLogs);
  };

  const handleExport = () => {
    logger.exportLogs();
  };

  const handleClear = async () => {
    if (window.confirm('Are you sure you want to clear all logs?')) {
      await logger.clearLogs();
      setLogs([]);
    }
  };

  const handleRefresh = () => {
    loadLogs();
  };

  // Setup keyboard shortcut (Cmd+Shift+L on Mac, Ctrl+Shift+L on others)
  useEffect(() => {
    if (!isAuthorized) return;

    const handleKeyPress = (e) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isModifierKey = isMac ? e.metaKey : e.ctrlKey;

      if (isModifierKey && e.shiftKey && e.key === 'L') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isAuthorized]);

  const filteredLogs =
    filter === 'ALL' ? logs : logs.filter((log) => log.level === filter);

  const getLevelColor = (level) => {
    switch (level) {
      case 'ERROR':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      case 'WARN':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
      case 'INFO':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
      case 'DEBUG':
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  // Don't render if not authorized or still loading
  if (isLoading || !isAuthorized) {
    return null;
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 px-3 py-2 bg-gray-800 dark:bg-gray-700 text-white text-xs rounded-lg hover:bg-gray-900 transition z-40 hover:scale-105"
        title="Open Debug Console (Cmd+Shift+L)"
      >
        🐛 Logs
      </button>
    );
  }

  return (
    <div className="fixed bottom-0 right-0 w-full md:w-2/3 lg:w-1/2 h-96 bg-white dark:bg-gray-900 shadow-2xl border-t border-l border-gray-200 dark:border-gray-700 flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-bold text-gray-900 dark:text-white">Debug Console</h3>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-xs px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded"
          >
            <option value="ALL">All</option>
            <option value="ERROR">Errors</option>
            <option value="WARN">Warnings</option>
            <option value="INFO">Info</option>
            <option value="DEBUG">Debug</option>
          </select>
          <label className="text-xs flex items-center gap-1 text-gray-600 dark:text-gray-400">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="w-3 h-3"
            />
            Auto-scroll
          </label>
          <button
            onClick={handleRefresh}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-lg"
            title="Refresh logs"
          >
            🔄
          </button>
          <button
            onClick={handleExport}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            title="Export logs"
          >
            <FiDownload size={18} />
          </button>
          <button
            onClick={handleClear}
            className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
            title="Clear logs"
          >
            <FiTrash2 size={18} />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <FiX size={18} />
          </button>
        </div>
      </div>

      {/* Logs Container */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50 dark:bg-gray-950 font-mono text-xs">
        {filteredLogs.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400 italic">
            No logs to display
          </div>
        ) : (
          filteredLogs.map((log, idx) => (
            <div
              key={idx}
              className={`p-2 rounded border border-gray-200 dark:border-gray-700 ${getLevelColor(
                log.level
              )}`}
            >
              <div className="flex justify-between">
                <span className="font-bold">[{log.level}]</span>
                <span className="text-gray-500 dark:text-gray-400">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="mt-1">{log.message}</div>
              {Object.keys(log.data).length > 0 && (
                <details className="mt-1 cursor-pointer">
                  <summary className="text-gray-600 dark:text-gray-400 hover:underline">
                    Details
                  </summary>
                  <pre className="mt-1 overflow-auto bg-white dark:bg-gray-800 p-2 rounded text-xs">
                    {JSON.stringify(log.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400">
        Showing {filteredLogs.length} of {logs.length} logs • Press Cmd+Shift+L to toggle
      </div>
    </div>
  );
}
