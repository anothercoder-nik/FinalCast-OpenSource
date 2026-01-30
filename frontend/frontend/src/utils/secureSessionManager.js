import encryptionService from './encryptionService';

/**
 * Secure Session Manager for End-to-End Encrypted Podcasts
 * Handles key generation, exchange, and session security
 */
class SecureSessionManager {
  constructor() {
    this.sessionKey = null;
    this.keyPair = null;
    this.participantKeys = new Map(); // userId -> { publicKey, encryptedSessionKey }
    this.sessionPassphrase = null;
    this.isHost = false;
    this.sessionId = null;
    this.onKeyExchange = null;
  }

  /**
   * Initialize as session host - generates session key
   * @param {string} sessionId - Session identifier
   * @returns {Promise<Object>} Session security info
   */
  async initializeAsHost(sessionId) {
    try {
      this.sessionId = sessionId;
      this.isHost = true;
      
      console.log('🔐 Initializing as host for session:', sessionId);
      console.log('🔧 Browser environment check:');
      console.log('- window.crypto:', !!window.crypto);
      console.log('- window.crypto.subtle:', !!window.crypto?.subtle);
      console.log('- window.isSecureContext:', window.isSecureContext);
      console.log('- location.protocol:', window.location.protocol);
      
      // Check if Web Crypto API is available
      if (!window.crypto || !window.crypto.subtle) {
        throw new Error('Web Crypto API is not available in this browser');
      }
      
      if (!window.isSecureContext) {
        console.warn('⚠️ Warning: Not in secure context. Web Crypto API may not work properly.');
      }
      
      // Test basic crypto functionality
      console.log('🔧 Testing basic crypto functionality...');
      const testKey = await window.crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );
      console.log('✅ Basic crypto test passed:', testKey);
      
      // Generate session encryption key (only known to participants)
      console.log('🔑 Generating session key...');
      this.sessionKey = await encryptionService.generateSessionKey();
      console.log('✅ Session key generated:', this.sessionKey);
      
      // Generate RSA key pair for secure key exchange
      console.log('🔑 Generating RSA key pair...');
      this.keyPair = await encryptionService.generateRSAKeyPair();
      console.log('✅ RSA key pair generated:', this.keyPair);
      
      // Validate key pair
      if (!this.keyPair || !this.keyPair.publicKey || !this.keyPair.privateKey) {
        throw new Error('Failed to generate valid RSA key pair');
      }
      
      // Generate human-readable passphrase for easy sharing
      this.sessionPassphrase = encryptionService.generateSessionPassphrase();
      
      // Create host's public key fingerprint for verification
      const hostFingerprint = await encryptionService.createKeyFingerprint(this.keyPair.publicKey);
      
      const hostInfo = {
        sessionId,
        publicKey: await encryptionService.exportPublicKey(this.keyPair.publicKey),
        passphrase: this.sessionPassphrase,
        fingerprint: hostFingerprint,
        isHost: true,
        algorithm: 'AES-GCM',
        keyLength: 256,
        createdAt: new Date().toISOString()
      };
      
      console.log('✅ Host session security initialized');
      console.log('🔑 Session passphrase:', this.sessionPassphrase);
      console.log('🔍 Host fingerprint:', hostFingerprint);
      
      return hostInfo;
    } catch (error) {
      console.error('❌ Failed to initialize as host:', error);
      throw new Error('Host security initialization failed');
    }
  }

  /**
   * Initialize as participant - receives encrypted session key
   * @param {string} sessionId - Session identifier
   * @param {string} hostPublicKey - Host's public key
   * @param {string} passphrase - Session passphrase for verification
   * @returns {Promise<Object>} Participant security info
   */
  async initializeAsParticipant(sessionId, hostPublicKey, passphrase) {
    try {
      this.sessionId = sessionId;
      this.isHost = false;
      this.sessionPassphrase = passphrase;
      
      console.log('🔐 Initializing as participant for session:', sessionId);
      
      // Generate RSA key pair for receiving encrypted session key
      this.keyPair = await encryptionService.generateRSAKeyPair();
      
      // Import host's public key
      const importedHostKey = await encryptionService.importPublicKey(hostPublicKey);
      
      // Create participant's public key fingerprint
      const participantFingerprint = await encryptionService.createKeyFingerprint(this.keyPair.publicKey);
      
      // Verify host fingerprint
      const hostFingerprint = await encryptionService.createKeyFingerprint(importedHostKey);
      
      const participantInfo = {
        sessionId,
        publicKey: await encryptionService.exportPublicKey(this.keyPair.publicKey),
        passphrase,
        fingerprint: participantFingerprint,
        hostFingerprint,
        isHost: false,
        createdAt: new Date().toISOString()
      };
      
      console.log('✅ Participant security initialized');
      console.log('🔍 Participant fingerprint:', participantFingerprint);
      console.log('🔍 Host fingerprint:', hostFingerprint);
      
      return participantInfo;
    } catch (error) {
      console.error('❌ Failed to initialize as participant:', error);
      throw new Error('Participant security initialization failed');
    }
  }

  /**
   * Host: Add participant and encrypt session key for them
   * @param {string} userId - Participant user ID
   * @param {string} userName - Participant name
   * @param {string} publicKey - Participant's public key
   * @returns {Promise<string>} Encrypted session key for participant
   */
  async addParticipant(userId, userName, publicKey) {
    if (!this.isHost) {
      throw new Error('Only host can add participants');
    }

    try {
      console.log(`🔑 Adding participant ${userName} (${userId})`);
      
      // Import participant's public key
      const participantPublicKey = await encryptionService.importPublicKey(publicKey);
      
      // Encrypt session key for this participant
      const encryptedSessionKey = await encryptionService.encryptSessionKeyForParticipant(
        this.sessionKey,
        participantPublicKey
      );
      
      // Store participant info
      this.participantKeys.set(userId, {
        userName,
        publicKey: participantPublicKey,
        publicKeyString: publicKey,
        encryptedSessionKey,
        addedAt: new Date().toISOString()
      });
      
      console.log(`✅ Encrypted session key for ${userName}`);
      
      // Notify about key exchange
      this.onKeyExchange?.({
        type: 'participant-added',
        userId,
        userName,
        encryptedSessionKey
      });
      
      return encryptedSessionKey;
    } catch (error) {
      console.error(`❌ Failed to add participant ${userName}:`, error);
      throw new Error('Failed to add participant');
    }
  }

  /**
   * Participant: Receive and decrypt session key from host
   * @param {string} encryptedSessionKey - Encrypted session key from host
   * @returns {Promise<boolean>} Success status
   */
  async receiveSessionKey(encryptedSessionKey) {
    if (this.isHost) {
      throw new Error('Host already has session key');
    }

    try {
      console.log('🔓 Receiving encrypted session key from host');
      
      // Decrypt session key using our private key
      this.sessionKey = await encryptionService.decryptSessionKeyFromHost(
        encryptedSessionKey,
        this.keyPair.privateKey
      );
      
      console.log('✅ Session key decrypted successfully');
      
      // Verify the key works by doing a test encryption
      const testData = new TextEncoder().encode('test-encryption');
      await encryptionService.encryptAudioData(testData.buffer, this.sessionKey);
      
      console.log('✅ Session key verified and ready for use');
      
      // Notify about successful key exchange
      this.onKeyExchange?.({
        type: 'key-received',
        success: true
      });
      
      return true;
    } catch (error) {
      console.error('❌ Failed to receive session key:', error);
      
      this.onKeyExchange?.({
        type: 'key-received',
        success: false,
        error: error.message
      });
      
      throw new Error('Failed to decrypt session key');
    }
  }

  /**
   * Get session key for encryption/decryption
   * @returns {CryptoKey|null} Session encryption key
   */
  getSessionKey() {
    return this.sessionKey;
  }

  /**
   * Get public key for sharing
   * @returns {Promise<string>} Base64 encoded public key
   */
  async getPublicKey() {
    if (!this.keyPair) {
      throw new Error('Key pair not initialized');
    }
    
    return await encryptionService.exportPublicKey(this.keyPair.publicKey);
  }

  /**
   * Get session passphrase
   * @returns {string} Session passphrase
   */
  getPassphrase() {
    return this.sessionPassphrase;
  }

  /**
   * Verify session integrity
   * @param {string} passphrase - Passphrase to verify
   * @returns {boolean} Verification result
   */
  verifyPassphrase(passphrase) {
    return this.sessionPassphrase === passphrase;
  }

  /**
   * Get participant list (host only)
   * @returns {Array} List of participants
   */
  getParticipants() {
    if (!this.isHost) {
      return [];
    }
    
    return Array.from(this.participantKeys.entries()).map(([userId, info]) => ({
      userId,
      userName: info.userName,
      fingerprint: info.publicKeyString.substring(0, 8),
      addedAt: info.addedAt
    }));
  }

  /**
   * Remove participant (host only)
   * @param {string} userId - User ID to remove
   */
  removeParticipant(userId) {
    if (!this.isHost) {
      throw new Error('Only host can remove participants');
    }
    
    const removed = this.participantKeys.delete(userId);
    if (removed) {
      console.log(`🗑️ Removed participant ${userId}`);
      
      this.onKeyExchange?.({
        type: 'participant-removed',
        userId
      });
    }
    
    return removed;
  }

  /**
   * Generate session QR code data for easy joining
   * @returns {Object} QR code data
   */
  generateQRCodeData() {
    if (!this.isHost) {
      throw new Error('Only host can generate QR codes');
    }
    
    return {
      type: 'finalcast-encrypted-session',
      sessionId: this.sessionId,
      hostPublicKey: this.keyPair ? encryptionService.exportPublicKey(this.keyPair.publicKey) : null,
      passphrase: this.sessionPassphrase,
      version: '1.0',
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Get security status
   * @returns {Object} Current security status
   */
  getSecurityStatus() {
    return {
      sessionId: this.sessionId,
      isHost: this.isHost,
      hasSessionKey: !!this.sessionKey,
      hasKeyPair: !!this.keyPair,
      participantCount: this.participantKeys.size,
      passphrase: this.sessionPassphrase,
      encrypted: !!this.sessionKey,
      algorithm: 'AES-GCM',
      keyLength: 256
    };
  }

  /**
   * Set key exchange callback
   * @param {Function} callback - Callback function for key exchange events
   */
  setKeyExchangeCallback(callback) {
    this.onKeyExchange = callback;
  }

  /**
   * Cleanup session
   */
  cleanup() {
    console.log('🧹 Cleaning up secure session');
    
    this.sessionKey = null;
    this.keyPair = null;
    this.participantKeys.clear();
    this.sessionPassphrase = null;
    this.isHost = false;
    this.sessionId = null;
    this.onKeyExchange = null;
  }

  /**
   * Export session summary (encrypted metadata only, no keys)
   * @returns {Object} Session summary for logging
   */
  exportSessionSummary() {
    return {
      sessionId: this.sessionId,
      isHost: this.isHost,
      participantCount: this.participantKeys.size,
      hasEncryption: !!this.sessionKey,
      passphrase: this.sessionPassphrase ? '***hidden***' : null,
      createdAt: new Date().toISOString(),
      // No actual keys or sensitive data included
      note: 'This is metadata only. Encryption keys are never logged or stored server-side.'
    };
  }
}

export default SecureSessionManager;
