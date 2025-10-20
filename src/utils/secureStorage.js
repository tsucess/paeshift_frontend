/**
 * Secure storage utility for handling sensitive data
 * Provides encryption and validation for localStorage operations
 */

import { logger } from './logger.js';

// Simple encryption/decryption (for basic obfuscation)
// Note: For production, consider using a proper encryption library
const STORAGE_KEY_PREFIX = 'paeshift_';
const ENCRYPTION_KEY = 'paeshift_2024_secure_key'; // In production, this should be dynamic

class SecureStorage {
  constructor() {
    this.prefix = STORAGE_KEY_PREFIX;
  }

  /**
   * Simple encryption (base64 encoding for basic obfuscation)
   * In production, use proper encryption
   */
  encrypt(data) {
    try {
      const jsonString = JSON.stringify(data);
      return btoa(jsonString);
    } catch (error) {
      logger.error('Encryption failed:', error);
      return null;
    }
  }

  /**
   * Simple decryption
   */
  decrypt(encryptedData) {
    try {
      const jsonString = atob(encryptedData);
      return JSON.parse(jsonString);
    } catch (error) {
      logger.error('Decryption failed:', error);
      return null;
    }
  }

  /**
   * Get prefixed key
   */
  getKey(key) {
    return `${this.prefix}${key}`;
  }

  /**
   * Set item in localStorage with encryption
   */
  setItem(key, value) {
    try {
      const prefixedKey = this.getKey(key);
      const encryptedValue = this.encrypt(value);
      
      if (encryptedValue) {
        localStorage.setItem(prefixedKey, encryptedValue);
        logger.debug(`Stored item: ${key}`);
        return true;
      }
      return false;
    } catch (error) {
      logger.error(`Failed to store item ${key}:`, error);
      return false;
    }
  }

  /**
   * Get item from localStorage with decryption
   */
  getItem(key) {
    try {
      const prefixedKey = this.getKey(key);
      const encryptedValue = localStorage.getItem(prefixedKey);
      
      if (!encryptedValue) {
        return null;
      }

      const decryptedValue = this.decrypt(encryptedValue);
      logger.debug(`Retrieved item: ${key}`);
      return decryptedValue;
    } catch (error) {
      logger.error(`Failed to retrieve item ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove item from localStorage
   */
  removeItem(key) {
    try {
      const prefixedKey = this.getKey(key);
      localStorage.removeItem(prefixedKey);
      logger.debug(`Removed item: ${key}`);
      return true;
    } catch (error) {
      logger.error(`Failed to remove item ${key}:`, error);
      return false;
    }
  }

  /**
   * Clear all app-related items from localStorage
   */
  clear() {
    try {
      const keys = Object.keys(localStorage);
      const appKeys = keys.filter(key => key.startsWith(this.prefix));
      
      appKeys.forEach(key => {
        localStorage.removeItem(key);
      });
      
      logger.debug(`Cleared ${appKeys.length} items from storage`);
      return true;
    } catch (error) {
      logger.error('Failed to clear storage:', error);
      return false;
    }
  }

  /**
   * Check if item exists
   */
  hasItem(key) {
    const prefixedKey = this.getKey(key);
    return localStorage.getItem(prefixedKey) !== null;
  }

  /**
   * Get all app-related keys
   */
  getAllKeys() {
    try {
      const keys = Object.keys(localStorage);
      return keys
        .filter(key => key.startsWith(this.prefix))
        .map(key => key.replace(this.prefix, ''));
    } catch (error) {
      logger.error('Failed to get all keys:', error);
      return [];
    }
  }

  /**
   * Store user authentication data
   */
  setAuthData(authData) {
    const success = this.setItem('auth', {
      access_token: authData.access_token,
      refresh_token: authData.refresh_token,
      user_id: authData.user_id,
      role: authData.role,
      email: authData.email,
      first_name: authData.first_name,
      last_name: authData.last_name,
      timestamp: Date.now()
    });

    if (success) {
      logger.info('Authentication data stored successfully');
    }
    return success;
  }

  /**
   * Get user authentication data
   */
  getAuthData() {
    const authData = this.getItem('auth');
    
    if (authData && authData.timestamp) {
      // Check if token is older than 24 hours (example expiry check)
      const tokenAge = Date.now() - authData.timestamp;
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      if (tokenAge > maxAge) {
        logger.warn('Authentication token expired');
        this.clearAuthData();
        return null;
      }
    }
    
    return authData;
  }

  /**
   * Clear authentication data
   */
  clearAuthData() {
    this.removeItem('auth');
    logger.info('Authentication data cleared');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    const authData = this.getAuthData();
    return authData && authData.access_token && authData.user_id;
  }
}

// Export singleton instance
export const secureStorage = new SecureStorage();
export default secureStorage;
