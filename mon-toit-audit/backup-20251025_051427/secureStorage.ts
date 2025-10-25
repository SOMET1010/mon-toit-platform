/**
 * Secure Storage Utility
 * Provides AES-256-GCM encryption for sensitive localStorage data
 * Implements Web Crypto API for cryptographically secure encryption
 */

class SecureStorage {
  private static instance: SecureStorage;
  private encryptionKey: CryptoKey | null = null;
  private readonly ALGORITHM = 'AES-GCM';
  private readonly KEY_LENGTH = 256;
  private readonly IV_LENGTH = 12; // GCM standard IV length
  private readonly SALT_LENGTH = 16;

  private constructor() {
    this.initializeEncryptionKey();
  }

  public static getInstance(): SecureStorage {
    if (!SecureStorage.instance) {
      SecureStorage.instance = new SecureStorage();
    }
    return SecureStorage.instance;
  }

  /**
   * Initialize encryption key using PBKDF2
   */
  private async initializeEncryptionKey(): Promise<void> {
    try {
      // Generate a secure key from browser fingerprint + random salt
      const salt = this.getOrCreateSalt();
      const keyMaterial = await this.deriveKeyMaterial(salt);
      
      this.encryptionKey = await crypto.subtle.importKey(
        'raw',
        keyMaterial,
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
      );

      // Derive the actual encryption key
      this.encryptionKey = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: 100000,
          hash: 'SHA-256'
        },
        this.encryptionKey,
        {
          name: this.ALGORITHM,
          length: this.KEY_LENGTH
        },
        false,
        ['encrypt', 'decrypt']
      );
    } catch (error) {
      console.error('Failed to initialize encryption key:', error);
      throw new Error('Encryption initialization failed');
    }
  }

  /**
   * Get or create a salt for key derivation
   */
  private getOrCreateSalt(): Uint8Array {
    const saltKey = 'encryption_salt';
    const existingSalt = localStorage.getItem(saltKey);
    
    if (existingSalt) {
      return new Uint8Array(JSON.parse(existingSalt));
    }
    
    const newSalt = crypto.getRandomValues(new Uint8Array(this.SALT_LENGTH));
    localStorage.setItem(saltKey, JSON.stringify(Array.from(newSalt)));
    return newSalt;
  }

  /**
   * Derive key material from browser fingerprint
   */
  private async deriveKeyMaterial(salt: Uint8Array): Promise<ArrayBuffer> {
    // Create a unique fingerprint combining multiple browser characteristics
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      navigator.platform,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset().toString()
    ].join('|');

    // Use PBKDF2 to derive a strong key material
    const encoder = new TextEncoder();
    const keyMaterial = encoder.encode(fingerprint);
    
    return crypto.subtle.importKey(
      'raw',
      keyMaterial,
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    ).then(async (baseKey) => {
      return crypto.subtle.deriveBits(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: 100000,
          hash: 'SHA-256'
        },
        baseKey,
        256 // 256 bits for AES-256
      );
    });
  }

  /**
   * Encrypt data using AES-256-GCM
   */
  private async encrypt(text: string): Promise<string> {
    if (!this.encryptionKey) {
      await this.initializeEncryptionKey();
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));

    const encrypted = await crypto.subtle.encrypt(
      {
        name: this.ALGORITHM,
        iv: iv
      },
      this.encryptionKey!,
      data
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encrypted), iv.length);

    // Base64 encode for storage
    return btoa(String.fromCharCode(...combined));
  }

  /**
   * Decrypt data using AES-256-GCM
   */
  private async decrypt(encryptedText: string): Promise<string> {
    try {
      if (!this.encryptionKey) {
        await this.initializeEncryptionKey();
      }

      // Decode base64
      const combined = new Uint8Array(
        atob(encryptedText).split('').map(char => char.charCodeAt(0))
      );

      // Extract IV and encrypted data
      const iv = combined.slice(0, this.IV_LENGTH);
      const encrypted = combined.slice(this.IV_LENGTH);

      const decrypted = await crypto.subtle.decrypt(
        {
          name: this.ALGORITHM,
          iv: iv
        },
        this.encryptionKey!,
        encrypted
      );

      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      console.error('Failed to decrypt data:', error);
      return '';
    }
  }

  /**
   * Store an item in localStorage with optional encryption
   */
  async setItem(key: string, value: string, isSensitive = false): Promise<void> {
    try {
      if (isSensitive) {
        const encryptedValue = await this.encrypt(value);
        localStorage.setItem(key, encryptedValue);
        
        // Store metadata to track encryption status
        localStorage.setItem(`${key}_meta`, JSON.stringify({
          encrypted: true,
          algorithm: this.ALGORITHM,
          keyLength: this.KEY_LENGTH,
          timestamp: Date.now(),
          version: '2.0' // Track encryption version
        }));
      } else {
        localStorage.setItem(key, value);
      }
    } catch (error) {
      console.error('Failed to store data:', error);
      throw new Error('Storage operation failed');
    }
  }

  /**
   * Retrieve an item from localStorage with optional decryption
   */
  async getItem(key: string, isSensitive = false): Promise<string | null> {
    try {
      if (isSensitive) {
        const metaData = localStorage.getItem(`${key}_meta`);
        if (metaData) {
          const meta = JSON.parse(metaData);
          if (meta.encrypted) {
            const encryptedValue = localStorage.getItem(key);
            if (encryptedValue) {
              return await this.decrypt(encryptedValue);
            }
          }
        }
      }
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Failed to retrieve data:', error);
      return null;
    }
  }

  /**
   * Remove an item and its metadata
   */
  removeItem(key: string): void {
    localStorage.removeItem(key);
    localStorage.removeItem(`${key}_meta`);
  }

  /**
   * Clear all sensitive data
   */
  clear(): void {
    const keysToKeep = ['user_preferences', 'app_settings', 'encryption_salt'];
    const allKeys = Object.keys(localStorage);

    allKeys.forEach(key => {
      if (!keysToKeep.includes(key) && !key.endsWith('_meta')) {
        localStorage.removeItem(key);
        localStorage.removeItem(`${key}_meta`);
      }
    });
  }

  /**
   * Get all sensitive keys (those with _meta)
   */
  getSensitiveKeys(): string[] {
    return Object.keys(localStorage)
      .filter(key => key.endsWith('_meta'))
      .map(key => key.replace('_meta', ''));
  }

  /**
   * Check if a key is encrypted
   */
  isEncrypted(key: string): boolean {
    const metaData = localStorage.getItem(`${key}_meta`);
    if (metaData) {
      try {
        const meta = JSON.parse(metaData);
        return meta.encrypted === true;
      } catch {
        return false;
      }
    }
    return false;
  }

  /**
   * Migrate from old XOR encryption to new AES-256 encryption
   */
  async migrateFromLegacyEncryption(): Promise<{
    migrated: number;
    failed: number;
    details: Array<{ key: string; status: 'success' | 'error'; error?: string }>;
  }> {
    const result = {
      migrated: 0,
      failed: 0,
      details: [] as Array<{ key: string; status: 'success' | 'error'; error?: string }>
    };

    // Keys that might be encrypted with old method
    const sensitiveKeys = ['auth_token', 'user_preferences', 'session_data'];
    
    for (const key of sensitiveKeys) {
      try {
        // Check if data exists and is not already encrypted with new method
        const existingData = localStorage.getItem(key);
        const metaData = localStorage.getItem(`${key}_meta`);
        
        if (existingData && (!metaData || !JSON.parse(metaData).encrypted)) {
          // Try to decrypt with old method
          const legacyKey = this.getLegacyKey();
          const decrypted = this.legacyDecrypt(existingData, legacyKey);
          
          if (decrypted) {
            // Re-encrypt with new method
            await this.setItem(key, decrypted, true);
            localStorage.removeItem(`${key}_old`); // Clean up old data
            result.migrated++;
            result.details.push({ key, status: 'success' });
          } else {
            result.failed++;
            result.details.push({ key, status: 'error', error: 'Decryption failed' });
          }
        }
      } catch (error) {
        result.failed++;
        result.details.push({ key, status: 'error', error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }

    return result;
  }

  /**
   * Legacy decryption for migration purposes only
   */
  private legacyDecrypt(encryptedText: string, key: string): string | null {
    try {
      const text = atob(encryptedText);
      let result = '';
      for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(
          text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
        );
      }
      return result;
    } catch {
      return null;
    }
  }

  /**
   * Generate legacy key for migration
   */
  private getLegacyKey(): string {
    const userAgent = navigator.userAgent;
    const language = navigator.language;
    const timestamp = Math.floor(Date.now() / (1000 * 60 * 60));
    return btoa(`${userAgent}-${language}-${timestamp}`).slice(0, 32);
  }
}

// Export singleton instance
export const secureStorage = SecureStorage.getInstance();

// Helper functions for common use cases
export const secureTokenStorage = {
  setToken: async (token: string) => {
    await secureStorage.setItem('auth_token', token, true);
  },
  getToken: async (): Promise<string | null> => {
    return await secureStorage.getItem('auth_token', true);
  },
  removeToken: () => {
    secureStorage.removeItem('auth_token');
  }
};

export const secureUserStorage = {
  setUserPreferences: async (preferences: Record<string, any>) => {
    await secureStorage.setItem('user_preferences', JSON.stringify(preferences), true);
  },
  getUserPreferences: async (): Promise<Record<string, any> | null> => {
    const prefs = await secureStorage.getItem('user_preferences', true);
    return prefs ? JSON.parse(prefs) : null;
  },
  removeUserPreferences: () => {
    secureStorage.removeItem('user_preferences');
  }
};

// Migration utility function
export const migrateToSecureStorage = async () => {
  try {
    console.log('🔐 Starting migration to secure storage...');
    const result = await secureStorage.migrateFromLegacyEncryption();
    
    console.log('✅ Migration completed:', result);
    
    if (result.migrated > 0) {
      console.log(`🎉 Successfully migrated ${result.migrated} items`);
    }
    
    if (result.failed > 0) {
      console.warn(`⚠️ Failed to migrate ${result.failed} items:`, result.details.filter(d => d.status === 'error'));
    }
    
    return result;
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

// Auto-migrate on module load if needed
if (typeof window !== 'undefined') {
  // Check if we have any legacy encrypted data
  const hasLegacyData = Object.keys(localStorage).some(key => 
    localStorage.getItem(key) && !localStorage.getItem(`${key}_meta`)
  );
  
  if (hasLegacyData) {
    // Trigger migration after a short delay to allow for initialization
    setTimeout(() => {
      migrateToSecureStorage().catch(console.error);
    }, 100);
  }
}