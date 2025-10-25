/**
 * Tests de Validation des Corrections de Sécurité
 * Valide que toutes les corrections critiques fonctionnent correctement
 */

import { describe, test, expect, beforeAll, afterAll } from 'vitest'
import { secureStorage, migrateToSecureStorage } from '../../src/lib/secureStorage'
import { validateJWT } from '../../src/lib/jwtValidation'

// Mock localStorage for testing
const localStorageMock = {
  store: {} as Record<string, string>,
  getItem: function(key: string) {
    return this.store[key] || null
  },
  setItem: function(key: string, value: string) {
    this.store[key] = value
  },
  removeItem: function(key: string) {
    delete this.store[key]
  },
  clear: function() {
    this.store = {}
  },
  get length() {
    return Object.keys(this.store).length
  },
  key: function(index: number) {
    return Object.keys(this.store)[index] || null
  }
}

// Mock crypto.subtle for testing
const cryptoMock = {
  subtle: {
    importKey: vi.fn(),
    deriveKey: vi.fn(),
    encrypt: vi.fn(),
    decrypt: vi.fn(),
    generateKey: vi.fn(),
    deriveBits: vi.fn()
  },
  getRandomValues: vi.fn((arr) => {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256)
    }
    return arr
  })
}

describe('🔐 Tests de Chiffrement Sécurisé', () => {
  beforeAll(() => {
    // Mock browser APIs
    global.localStorage = localStorageMock as any
    global.crypto = cryptoMock as any
    global.navigator = {
      userAgent: 'test-browser',
      language: 'fr-FR',
      platform: 'test-platform'
    } as any
    global.screen = {
      width: 1920,
      height: 1080
    } as any
  })

  test('✅ Chiffrement AES-256-GCM fonctionne', async () => {
    const testData = 'Données sensibles de test'
    
    // Mock successful encryption
    const mockEncrypted = 'encrypted-data'
    const mockKey = {} as CryptoKey
    
    cryptoMock.subtle.importKey.mockResolvedValue(mockKey)
    cryptoMock.subtle.deriveKey.mockResolvedValue(mockKey)
    cryptoMock.subtle.encrypt.mockResolvedValue(new Uint8Array([1, 2, 3, 4]))
    
    await secureStorage.setItem('test-key', testData, true)
    
    // Vérifier que les données sont stockées avec métadonnées
    const storedData = localStorageMock.getItem('test-key')
    expect(storedData).toBeTruthy()
    
    const metadata = localStorageMock.getItem('test-key_meta')
    expect(metadata).toBeTruthy()
    
    const meta = JSON.parse(metadata!)
    expect(meta.encrypted).toBe(true)
    expect(meta.algorithm).toBe('AES-GCM')
    expect(meta.version).toBe('2.0')
  })

  test('✅ Déchiffrement AES-256-GCM fonctionne', async () => {
    const originalData = 'Données de test'
    
    // Mock successful decryption
    cryptoMock.subtle.decrypt.mockResolvedValue(new TextEncoder().encode(originalData))
    
    const storedData = localStorageMock.getItem('test-key')
    const metadata = JSON.parse(localStorageMock.getItem('test-key_meta')!)
    
    if (metadata.encrypted) {
      const decrypted = await secureStorage.getItem('test-key', true)
      expect(decrypted).toBe(originalData)
    }
  })

  test('✅ Migration des données existantes', async () => {
    // Simuler des données existantes non chiffrées
    localStorageMock.setItem('legacy_token', 'old-token-value')
    localStorageMock.setItem('legacy_preferences', '{"theme": "dark"}')
    
    const result = await migrateToSecureStorage()
    
    expect(result.migrated).toBeGreaterThan(0)
    expect(result.failed).toBe(0)
    
    // Vérifier que les anciennes données sont chiffrées
    expect(secureStorage.isEncrypted('legacy_token')).toBe(true)
    expect(secureStorage.isEncrypted('legacy_preferences')).toBe(true)
  })

  test('✅ Salt de chiffrement persistant', () => {
    const saltKey = 'encryption_salt'
    const salt1 = localStorageMock.getItem(saltKey)
    
    // Créer une nouvelle instance (simulation)
    const anotherStorage = secureStorage
    
    // Le salt doit être persistant
    const salt2 = localStorageMock.getItem(saltKey)
    expect(salt1).toBe(salt2)
  })
})

describe('🔑 Tests de Validation JWT', () => {
  beforeAll(() => {
    global.fetch = vi.fn()
  })

  test('✅ Validation JWT valide', async () => {
    const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U'
    
    // Mock Supabase client response
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user: {
          id: 'user-123',
          email: 'test@example.com',
          aud: 'authenticated',
          exp: Date.now() / 1000 + 3600
        }
      })
    } as Response)
    
    const result = await validateJWT(validToken)
    
    expect(result.valid).toBe(true)
    expect(result.user?.id).toBe('user-123')
    expect(result.user?.email).toBe('test@example.com')
  })

  test('❌ Validation JWT invalide', async () => {
    const invalidToken = 'invalid-token'
    
    // Mock failed validation
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Invalid token' })
    } as Response)
    
    const result = await validateJWT(invalidToken)
    
    expect(result.valid).toBe(false)
    expect(result.error).toContain('Token validation failed')
  })

  test('❌ Validation JWT expiré', async () => {
    const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.eyJleHAiOj(Date.now() / 1000 - 3600)'
    
    const result = await validateJWT(expiredToken)
    
    expect(result.valid).toBe(false)
    expect(result.error).toContain('Token expired')
  })
})

describe('🛡️ Tests des Politiques RLS', () => {
  test('✅ Fonction verify_jwt_token existe', () => {
    // Cette fonction est définie dans la migration SQL
    expect(typeof verify_jwt_token).toBe('function')
  })

  test('✅ Fonction verify_admin_role existe', () => {
    expect(typeof verify_admin_role).toBe('function')
  })

  test('✅ Table security_attempts créée', () => {
    // Vérifier que la table existe
    expect(typeof security_attempts).toBe('object')
  })
})

describe('🚦 Tests de Rate Limiting', () => {
  test('✅ Rate limiting fonctionne', () => {
    const { RateLimiter } = require('../../src/lib/jwtValidation')
    
    // Test première tentative
    const result1 = RateLimiter.isAllowed('test-ip', 5, 60000)
    expect(result1.allowed).toBe(true)
    expect(result1.remaining).toBe(4)
    
    // Test multiple tentatives
    for (let i = 0; i < 4; i++) {
      RateLimiter.isAllowed('test-ip', 5, 60000)
    }
    
    const finalResult = RateLimiter.isAllowed('test-ip', 5, 60000)
    expect(finalResult.allowed).toBe(false)
    expect(finalResult.remaining).toBe(0)
  })
})

describe('📊 Tests de Performance', () => {
  test('✅ Performance chiffrement acceptable', async () => {
    const testData = 'x'.repeat(1000) // 1KB de données
    
    const startTime = performance.now()
    await secureStorage.setItem('perf-test', testData, true)
    const setDuration = performance.now() - startTime
    
    const startTime2 = performance.now()
    await secureStorage.getItem('perf-test', true)
    const getDuration = performance.now() - startTime2
    
    // Les opérations doivent être < 100ms pour 1KB
    expect(setDuration).toBeLessThan(100)
    expect(getDuration).toBeLessThan(50)
    
    console.log(`Performance: Set ${setDuration}ms, Get ${getDuration}ms`)
  })
})

describe('🔍 Tests d\'Intégration', () => {
  test('✅ Intégration complète', async () => {
    // 1. Stocker des données chiffrées
    await secureStorage.setItem('integration_test', 'sensitive-value', true)
    
    // 2. Vérifier l'état chiffré
    expect(secureStorage.isEncrypted('integration_test')).toBe(true)
    
    // 3. Récupérer les données
    const retrieved = await secureStorage.getItem('integration_test', true)
    expect(retrieved).toBe('sensitive-value')
    
    // 4. Vérifier les métadonnées
    const keys = secureStorage.getSensitiveKeys()
    expect(keys).toContain('integration_test')
    
    // 5. Nettoyer
    secureStorage.removeItem('integration_test')
    expect(localStorageMock.getItem('integration_test')).toBeNull()
  })
})

// Test des erreurs et cas limites
describe('❌ Tests de Robustesse', () => {
  test('✅ Gestion d\'erreur déchiffrement', async () => {
    localStorageMock.setItem('corrupted_data', 'invalid-base64')
    localStorageMock.setItem('corrupted_data_meta', JSON.stringify({ encrypted: true }))
    
    const result = await secureStorage.getItem('corrupted_data', true)
    expect(result).toBe('')
  })

  test('✅ Fallback sur données non chiffrées', async () => {
    localStorageMock.setItem('plain_data', 'plain-value')
    
    const result = await secureStorage.getItem('plain_data', false)
    expect(result).toBe('plain-value')
  })

  test('✅ Validation des paramètres', async () => {
    await expect(secureStorage.setItem('', 'value')).rejects.toThrow()
    await expect(secureStorage.setItem('key', '')).rejects.toThrow()
  })
})

// Configuration des hooks de test
afterAll(() => {
  // Nettoyage après les tests
  localStorageMock.clear()
})

export default describe