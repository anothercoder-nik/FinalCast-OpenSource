import EventEmitter from 'events';

class MemoryManager extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50); // Prevent memory leak warnings
    this.activeConnections = new Map();
    this.timers = new Set();
    this.intervals = new Set();
    this.cleanupTasks = new Set();
    
    // Monitor memory usage
    this.startMemoryMonitoring();
    
    // Setup cleanup on process exit
    this.setupGracefulShutdown();
  }

  // Track active connections
  trackConnection(id, connection) {
    this.activeConnections.set(id, {
      connection,
      createdAt: Date.now(),
      lastActivity: Date.now()
    });
  }

  // Remove connection
  removeConnection(id) {
    const conn = this.activeConnections.get(id);
    if (conn) {
      try {
        if (conn.connection && typeof conn.connection.close === 'function') {
          conn.connection.close();
        }
      } catch (error) {
        console.warn(`Error closing connection ${id}:`, error.message);
      }
      this.activeConnections.delete(id);
    }
  }

  // Track timers to prevent leaks
  trackTimer(timer) {
    this.timers.add(timer);
    return timer;
  }

  // Track intervals
  trackInterval(interval) {
    this.intervals.add(interval);
    return interval;
  }

  // Clear timer
  clearTimer(timer) {
    clearTimeout(timer);
    this.timers.delete(timer);
  }

  // Clear interval
  clearInterval(interval) {
    clearInterval(interval);
    this.intervals.delete(interval);
  }

  // Add cleanup task
  addCleanupTask(task) {
    this.cleanupTasks.add(task);
  }

  // Memory monitoring
  startMemoryMonitoring() {
    const interval = setInterval(() => {
      const memUsage = process.memoryUsage();
      const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
      
      // Log memory usage if high
      if (heapUsedMB > 100) {
        console.warn(`High memory usage: ${heapUsedMB}MB`);
      }
      
      // Force garbage collection if available and memory is high
      if (global.gc && heapUsedMB > 200) {
        global.gc();
        console.log('Forced garbage collection');
      }
      
      // Clean up stale connections
      this.cleanupStaleConnections();
      
    }, 30000); // Check every 30 seconds
    
    this.trackInterval(interval);
  }

  // Cleanup stale connections
  cleanupStaleConnections() {
    const now = Date.now();
    const staleTimeout = 5 * 60 * 1000; // 5 minutes
    
    for (const [id, conn] of this.activeConnections.entries()) {
      if (now - conn.lastActivity > staleTimeout) {
        console.log(`Cleaning up stale connection: ${id}`);
        this.removeConnection(id);
      }
    }
  }

  // Update connection activity
  updateConnectionActivity(id) {
    const conn = this.activeConnections.get(id);
    if (conn) {
      conn.lastActivity = Date.now();
    }
  }

  // Graceful shutdown
  setupGracefulShutdown() {
    const shutdown = async (signal) => {
      console.log(`Received ${signal}. Starting graceful shutdown...`);
      
      // Clear all timers
      for (const timer of this.timers) {
        clearTimeout(timer);
      }
      
      // Clear all intervals
      for (const interval of this.intervals) {
        clearInterval(interval);
      }
      
      // Close all connections
      for (const [id] of this.activeConnections) {
        this.removeConnection(id);
      }
      
      // Run cleanup tasks
      for (const task of this.cleanupTasks) {
        try {
          await task();
        } catch (error) {
          console.error('Cleanup task error:', error);
        }
      }
      
      console.log('Graceful shutdown completed');
      process.exit(0);
    };
    
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      shutdown('uncaughtException');
    });
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      shutdown('unhandledRejection');
    });
  }

  // Get memory stats
  getMemoryStats() {
    const memUsage = process.memoryUsage();
    return {
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024),
      activeConnections: this.activeConnections.size,
      activeTimers: this.timers.size,
      activeIntervals: this.intervals.size
    };
  }
}

export default new MemoryManager();