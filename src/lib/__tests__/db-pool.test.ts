/**
 * Connection Pool Tests
 * Tests for connection pool initialization, query execution, error handling,
 * and graceful shutdown
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  initializePool,
  query,
  transaction,
  closePool,
  healthCheck,
  setupShutdownHandlers,
} from '../db-pool';

// Mock the pg module
vi.mock('pg', () => {
  const mockPool = {
    query: vi.fn(),
    connect: vi.fn(),
    end: vi.fn(),
    on: vi.fn(),
  };
  
  class MockPool {
    query = mockPool.query;
    connect = mockPool.connect;
    end = mockPool.end;
    on = mockPool.on;
  }
  
  return {
    Pool: vi.fn(function() {
      return mockPool;
    }),
  };
});

describe('Connection Pool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment variables
    process.env.DATABASE_URL = 'postgresql://test:test@localhost/test';
    process.env.DATABASE_POOL_MIN = '5';
    process.env.DATABASE_POOL_MAX = '20';
    process.env.QUERY_TIMEOUT_MS = '30000';
    process.env.LOG_SLOW_QUERIES_MS = '1000';
  });

  afterEach(async () => {
    try {
      await closePool();
    } catch (e) {
      // Ignore errors during cleanup
    }
  });

  describe('Pool Initialization', () => {
    it('should initialize with configured min/max connections', async () => {
      const { Pool } = await import('pg');
      await initializePool();

      expect(Pool).toHaveBeenCalledWith(
        expect.objectContaining({
          connectionString: 'postgresql://test:test@localhost/test',
          max: 20,
          min: 5,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 2000,
          query_timeout: 30000,
        })
      );
    });

    it('should use default values when environment variables are not set', async () => {
      delete process.env.DATABASE_POOL_MIN;
      delete process.env.DATABASE_POOL_MAX;
      delete process.env.QUERY_TIMEOUT_MS;

      const { Pool } = await import('pg');
      await initializePool();

      expect(Pool).toHaveBeenCalledWith(
        expect.objectContaining({
          max: 20,
          min: 5,
          query_timeout: 30000,
        })
      );
    });

    it('should not reinitialize if already initialized', async () => {
      const { Pool } = await import('pg');
      await initializePool();
      const firstCallCount = (Pool as any).mock.calls.length;

      await initializePool();
      const secondCallCount = (Pool as any).mock.calls.length;

      expect(firstCallCount).toBe(secondCallCount);
    });

    it('should set up error handler for idle clients', async () => {
      const { Pool } = await import('pg');
      await initializePool();

      const mockPoolInstance = (Pool as any).mock.results[0].value;
      expect(mockPoolInstance.on).toHaveBeenCalledWith('error', expect.any(Function));
    });
  });

  describe('Query Execution', () => {
    beforeEach(async () => {
      await initializePool();
    });

    it('should execute query and return results', async () => {
      const { Pool } = await import('pg');
      const mockPoolInstance = (Pool as any).mock.results[0].value;
      const mockResult = {
        rows: [{ id: 1, name: 'test' }],
        rowCount: 1,
      };
      mockPoolInstance.query.mockResolvedValue(mockResult);

      const result = await query('SELECT * FROM test', []);

      expect(result).toEqual(mockResult);
      expect(mockPoolInstance.query).toHaveBeenCalledWith('SELECT * FROM test', []);
    });

    it('should handle query with parameters', async () => {
      const { Pool } = await import('pg');
      const mockPoolInstance = (Pool as any).mock.results[0].value;
      const mockResult = { rows: [{ id: 1 }], rowCount: 1 };
      mockPoolInstance.query.mockResolvedValue(mockResult);

      const result = await query('SELECT * FROM test WHERE id = $1', [1]);

      expect(result).toEqual(mockResult);
      expect(mockPoolInstance.query).toHaveBeenCalledWith(
        'SELECT * FROM test WHERE id = $1',
        [1]
      );
    });

    it('should log metrics for query execution', async () => {
      const { Pool } = await import('pg');
      const mockPoolInstance = (Pool as any).mock.results[0].value;
      const mockResult = { rows: [{ id: 1 }], rowCount: 1 };
      mockPoolInstance.query.mockResolvedValue(mockResult);

      // Set development mode
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await query('SELECT * FROM test', []);

      // Metrics should be logged in development mode
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
      
      process.env.NODE_ENV = originalEnv;
    });

    it('should throw error if pool not initialized', async () => {
      await closePool();

      await expect(query('SELECT 1')).rejects.toThrow(
        'Connection pool not initialized'
      );
    });
  });

  describe('Transaction Support', () => {
    beforeEach(async () => {
      await initializePool();
    });

    it('should execute transaction with BEGIN and COMMIT', async () => {
      const { Pool } = await import('pg');
      const mockPoolInstance = (Pool as any).mock.results[0].value;

      const mockClient = {
        query: vi.fn().mockResolvedValue({ rows: [] }),
        release: vi.fn(),
      };
      mockPoolInstance.connect.mockResolvedValue(mockClient);

      const callback = vi.fn().mockResolvedValue('result');

      const result = await transaction(callback);

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(callback).toHaveBeenCalledWith(mockClient);
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();
      expect(result).toBe('result');
    });

    it('should rollback on error', async () => {
      const { Pool } = await import('pg');
      const mockPoolInstance = (Pool as any).mock.results[0].value;

      const mockClient = {
        query: vi.fn().mockResolvedValue({ rows: [] }),
        release: vi.fn(),
      };
      mockPoolInstance.connect.mockResolvedValue(mockClient);

      const callback = vi.fn().mockRejectedValue(new Error('Test error'));

      await expect(transaction(callback)).rejects.toThrow('Test error');

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('Health Check', () => {
    beforeEach(async () => {
      await initializePool();
    });

    it('should return true on successful health check', async () => {
      const { Pool } = await import('pg');
      const mockPoolInstance = (Pool as any).mock.results[0].value;
      mockPoolInstance.query.mockResolvedValue({ rows: [{ '?column?': 1 }] });

      const result = await healthCheck();

      expect(result).toBe(true);
      expect(mockPoolInstance.query).toHaveBeenCalledWith('SELECT 1');
    });

    it('should return false on health check failure', async () => {
      const { Pool } = await import('pg');
      const mockPoolInstance = (Pool as any).mock.results[0].value;
      mockPoolInstance.query.mockRejectedValue(new Error('Connection failed'));

      const result = await healthCheck();

      expect(result).toBe(false);
    });
  });

  describe('Graceful Shutdown', () => {
    it('should close pool gracefully', async () => {
      await initializePool();
      
      const { Pool } = await import('pg');
      const mockPoolInstance = (Pool as any).mock.results[(Pool as any).mock.results.length - 1].value;
      mockPoolInstance.end.mockResolvedValue(undefined);

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await closePool();

      expect(mockPoolInstance.end).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('Connection pool closed gracefully');
      consoleSpy.mockRestore();
    });

    it('should handle close errors gracefully', async () => {
      await initializePool();
      
      const { Pool } = await import('pg');
      const mockPoolInstance = (Pool as any).mock.results[(Pool as any).mock.results.length - 1].value;
      mockPoolInstance.end.mockRejectedValue(new Error('Close failed'));

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(closePool()).rejects.toThrow('Close failed');

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Shutdown Handlers', () => {
    it('should set up signal handlers', () => {
      const processSpy = vi.spyOn(process, 'on');

      setupShutdownHandlers();

      expect(processSpy).toHaveBeenCalledWith('SIGTERM', expect.any(Function));
      expect(processSpy).toHaveBeenCalledWith('SIGINT', expect.any(Function));

      processSpy.mockRestore();
    });
  });
});
