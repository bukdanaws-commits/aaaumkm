/**
 * Feature Flag Tests
 * Tests for feature flag reading from environment variables,
 * flag toggling behavior, and all supported endpoints
 */

import { useDirectSql, getAllFeatureFlags, isFeatureEnabled } from '../feature-flags';

describe('Feature Flags', () => {
  // Save original env vars
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset env vars before each test
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    // Restore original env vars
    process.env = originalEnv;
  });

  describe('useDirectSql', () => {
    it('should read feature flags from environment variables', () => {
      process.env.USE_DIRECT_SQL_LANDING = 'true';
      expect(useDirectSql('landing')).toBe(true);
    });

    it('should return false when flag is not set', () => {
      delete process.env.USE_DIRECT_SQL_LANDING;
      expect(useDirectSql('landing')).toBe(false);
    });

    it('should return false when flag is set to false', () => {
      process.env.USE_DIRECT_SQL_LANDING = 'false';
      expect(useDirectSql('landing')).toBe(false);
    });

    it('should return true when flag is set to true', () => {
      process.env.USE_DIRECT_SQL_LANDING = 'true';
      expect(useDirectSql('landing')).toBe(true);
    });

    it('should support landing endpoint flag', () => {
      process.env.USE_DIRECT_SQL_LANDING = 'true';
      expect(useDirectSql('landing')).toBe(true);
    });

    it('should support listing endpoint flag', () => {
      process.env.USE_DIRECT_SQL_LISTING = 'true';
      expect(useDirectSql('listing')).toBe(true);
    });

    it('should support categories endpoint flag', () => {
      process.env.USE_DIRECT_SQL_CATEGORIES = 'true';
      expect(useDirectSql('categories')).toBe(true);
    });

    it('should support detail endpoint flag', () => {
      process.env.USE_DIRECT_SQL_DETAIL = 'true';
      expect(useDirectSql('detail')).toBe(true);
    });

    it('should be case-insensitive for endpoint names', () => {
      process.env.USE_DIRECT_SQL_LANDING = 'true';
      expect(useDirectSql('LANDING')).toBe(true);
      expect(useDirectSql('Landing')).toBe(true);
    });

    it('should return false for any value other than "true"', () => {
      process.env.USE_DIRECT_SQL_LANDING = '1';
      expect(useDirectSql('landing')).toBe(false);

      process.env.USE_DIRECT_SQL_LANDING = 'yes';
      expect(useDirectSql('landing')).toBe(false);

      process.env.USE_DIRECT_SQL_LANDING = 'True';
      expect(useDirectSql('landing')).toBe(false);
    });
  });

  describe('getAllFeatureFlags', () => {
    it('should get all feature flag statuses', () => {
      process.env.USE_DIRECT_SQL_LANDING = 'true';
      process.env.USE_DIRECT_SQL_LISTING = 'false';
      process.env.USE_DIRECT_SQL_CATEGORIES = 'true';
      process.env.USE_DIRECT_SQL_DETAIL = 'false';

      const flags = getAllFeatureFlags();

      expect(flags).toEqual({
        landing: true,
        listing: false,
        categories: true,
        detail: false,
      });
    });

    it('should return all false when no flags are set', () => {
      delete process.env.USE_DIRECT_SQL_LANDING;
      delete process.env.USE_DIRECT_SQL_LISTING;
      delete process.env.USE_DIRECT_SQL_CATEGORIES;
      delete process.env.USE_DIRECT_SQL_DETAIL;

      const flags = getAllFeatureFlags();

      expect(flags).toEqual({
        landing: false,
        listing: false,
        categories: false,
        detail: false,
      });
    });

    it('should return all true when all flags are set to true', () => {
      process.env.USE_DIRECT_SQL_LANDING = 'true';
      process.env.USE_DIRECT_SQL_LISTING = 'true';
      process.env.USE_DIRECT_SQL_CATEGORIES = 'true';
      process.env.USE_DIRECT_SQL_DETAIL = 'true';

      const flags = getAllFeatureFlags();

      expect(flags).toEqual({
        landing: true,
        listing: true,
        categories: true,
        detail: true,
      });
    });
  });

  describe('isFeatureEnabled', () => {
    it('should be an alias for useDirectSql', () => {
      process.env.USE_DIRECT_SQL_LANDING = 'true';
      expect(isFeatureEnabled('landing')).toBe(useDirectSql('landing'));
    });

    it('should return true when feature is enabled', () => {
      process.env.USE_DIRECT_SQL_LISTING = 'true';
      expect(isFeatureEnabled('listing')).toBe(true);
    });

    it('should return false when feature is disabled', () => {
      process.env.USE_DIRECT_SQL_LISTING = 'false';
      expect(isFeatureEnabled('listing')).toBe(false);
    });
  });

  describe('Dynamic flag toggling', () => {
    it('should reflect flag changes without restart', () => {
      process.env.USE_DIRECT_SQL_LANDING = 'false';
      expect(useDirectSql('landing')).toBe(false);

      // Toggle flag
      process.env.USE_DIRECT_SQL_LANDING = 'true';
      expect(useDirectSql('landing')).toBe(true);

      // Toggle back
      process.env.USE_DIRECT_SQL_LANDING = 'false';
      expect(useDirectSql('landing')).toBe(false);
    });

    it('should support toggling multiple flags independently', () => {
      process.env.USE_DIRECT_SQL_LANDING = 'true';
      process.env.USE_DIRECT_SQL_LISTING = 'false';

      expect(useDirectSql('landing')).toBe(true);
      expect(useDirectSql('listing')).toBe(false);

      // Toggle landing
      process.env.USE_DIRECT_SQL_LANDING = 'false';
      expect(useDirectSql('landing')).toBe(false);
      expect(useDirectSql('listing')).toBe(false);

      // Toggle listing
      process.env.USE_DIRECT_SQL_LISTING = 'true';
      expect(useDirectSql('landing')).toBe(false);
      expect(useDirectSql('listing')).toBe(true);
    });
  });
});
