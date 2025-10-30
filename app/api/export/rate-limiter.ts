/**
 * Simple in-memory rate limiter for CSV exports
 * Tracks requests per IP + entity combination with a time-based sliding window
 */

interface RateLimitEntry {
  timestamps: number[];
}

// Store rate limit data in memory
const rateLimitStore = new Map<string, RateLimitEntry>();

// Configuration
const RATE_LIMIT = Number.isInteger(parseInt(process.env.MAX_EXPORT_TO_CSV || '')) ? parseInt(process.env.MAX_EXPORT_TO_CSV!) : 3; // requests
const RATE_WINDOW = 60 * 1000; // 1 minute in milliseconds

/**
 * Check if a request should be rate limited
 * @param ip The IP address of the requester
 * @param entity The entity being requested
 * @returns true if rate limit exceeded, false otherwise
 */
export function isRateLimited(ip: string, entity: string): boolean {
  if (process.env.DO_NOT_RATE_LIMIT === 'true') {
    return false;
  }

  const now = Date.now();
  // Use IP + entity for the key to rate limit per IP per entity
  const key = `export:${ip}:${entity}`;

  // Get or create entry for this IP + entity
  let entry = rateLimitStore.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    rateLimitStore.set(key, entry);
  }

  // Remove timestamps older than the rate window
  entry.timestamps = entry.timestamps.filter((timestamp) => now - timestamp < RATE_WINDOW);

  // Check if we've exceeded the limit
  if (entry.timestamps.length >= RATE_LIMIT) {
    return true;
  }

  // Add current timestamp
  entry.timestamps.push(now);

  return false;
}

/**
 * Get remaining requests for an IP + entity (for debugging/monitoring)
 */
export function getRemainingRequests(ip: string, entity: string): number {
  const now = Date.now();
  const key = `export:${ip}:${entity}`;
  const entry = rateLimitStore.get(key);

  if (!entry) {
    return RATE_LIMIT;
  }

  // Count valid timestamps within the window
  const validTimestamps = entry.timestamps.filter((timestamp) => now - timestamp < RATE_WINDOW);
  return Math.max(0, RATE_LIMIT - validTimestamps.length);
}

/**
 * Clear all rate limit data (useful for testing)
 */
export function clearRateLimits(): void {
  rateLimitStore.clear();
}

/**
 * Clean up old entries periodically to prevent memory leaks
 * Should be called periodically (e.g., every 5 minutes)
 */
export function cleanupRateLimits(): void {
  const now = Date.now();

  rateLimitStore.forEach((entry, key) => {
    entry.timestamps = entry.timestamps.filter((timestamp) => now - timestamp < RATE_WINDOW);

    // Remove entries with no recent activity
    if (entry.timestamps.length === 0) {
      rateLimitStore.delete(key);
    }
  });
}

// Cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimits, 5 * 60 * 1000);
}
