/**
 * Client-side End-to-End Encryption Service
 * Ensures that only session participants can decrypt podcast content
 * The server/company cannot access encrypted content
 */

class EncryptionService {
  constructor() {
    this.algorithm = 'AES-GCM';
    this.keyLength = 256;
    this.ivLength = 12; // 96 bits for GCM
  }

  /**
   * Generate a secure session key for E2E encryption
   * This key is generated client-side and shared only with participants
   * @returns {Promise<CryptoKey>} Session encryption key
   */
  async generateSessionKey() {
    try {
      const key = await window.crypto.subtle.generateKey(
        {
          name: this.algorithm,
          length: this.keyLength
        },
        true, // extractable
        ['encrypt', 'decrypt']
      );
      
      console.log('🔐 Generated new session encryption key');
      return key;
    } catch (error) {
      console.error('❌ Failed to generate session key:', error);
      throw new Error('Failed to generate encryption key');
    }
  }

  /**
   * Generate RSA key pair for secure key exchange
   * @returns {Promise<Object>} Public and private key pair
   */
  async generateRSAKeyPair() {
    try {
      console.log('🔧 Starting RSA key pair generation...');
      
      // Check Web Crypto API availability
      if (!window.crypto || !window.crypto.subtle) {
        throw new Error('Web Crypto API is not available');
      }
      
      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: 'RSA-OAEP',
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: 'SHA-256'
        },
        true,
        ['encrypt', 'decrypt']
      );

      console.log('🔑 Generated RSA key pair for secure exchange:', keyPair);
      
      // Validate the key pair
      if (!keyPair || !keyPair.publicKey || !keyPair.privateKey) {
        throw new Error('Invalid key pair generated');
      }
      
      return keyPair;
    } catch (error) {
      console.error('❌ Failed to generate RSA key pair:', error);
      throw new Error('Failed to generate key exchange keys');
    }
  }

  /**
   * Export session key as base64 for sharing
   * @param {CryptoKey} key - Session key to export
   * @returns {Promise<string>} Base64 encoded key
   */
  async exportSessionKey(key) {
    try {
      const exported = await window.crypto.subtle.exportKey('raw', key);
      return this.arrayBufferToBase64(exported);
    } catch (error) {
      console.error('❌ Failed to export session key:', error);
      throw new Error('Failed to export encryption key');
    }
  }

  /**
   * Import session key from base64
   * @param {string} keyData - Base64 encoded key
   * @returns {Promise<CryptoKey>} Imported session key
   */
  async importSessionKey(keyData) {
    try {
      const keyBuffer = this.base64ToArrayBuffer(keyData);
      return await window.crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: this.algorithm },
        false,
        ['encrypt', 'decrypt']
      );
    } catch (error) {
      console.error('❌ Failed to import session key:', error);
      throw new Error('Failed to import encryption key');
    }
  }

  /**
   * Encrypt audio data with session key
   * @param {ArrayBuffer} audioData - Raw audio data
   * @param {CryptoKey} sessionKey - Session encryption key
   * @returns {Promise<Object>} Encrypted data with metadata
   */
  async encryptAudioData(audioData, sessionKey) {
    try {
      const iv = window.crypto.getRandomValues(new Uint8Array(this.ivLength));
      
      const encrypted = await window.crypto.subtle.encrypt(
        {
          name: this.algorithm,
          iv: iv
        },
        sessionKey,
        audioData
      );

      const encryptedData = {
        data: this.arrayBufferToBase64(encrypted),
        iv: this.arrayBufferToBase64(iv.buffer),
        algorithm: this.algorithm,
        timestamp: Date.now(),
        size: audioData.byteLength
      };

      console.log(`🔒 Encrypted audio chunk: ${audioData.byteLength} bytes`);
      return encryptedData;
    } catch (error) {
      console.error('❌ Audio encryption failed:', error);
      throw new Error('Failed to encrypt audio data');
    }
  }

  /**
   * Decrypt audio data with session key
   * @param {Object} encryptedData - Encrypted data object
   * @param {CryptoKey} sessionKey - Session decryption key
   * @returns {Promise<ArrayBuffer>} Decrypted audio data
   */
  async decryptAudioData(encryptedData, sessionKey) {
    try {
      const encrypted = this.base64ToArrayBuffer(encryptedData.data);
      const iv = this.base64ToArrayBuffer(encryptedData.iv);

      const decrypted = await window.crypto.subtle.decrypt(
        {
          name: this.algorithm,
          iv: new Uint8Array(iv)
        },
        sessionKey,
        encrypted
      );

      console.log(`🔓 Decrypted audio chunk: ${decrypted.byteLength} bytes`);
      return decrypted;
    } catch (error) {
      console.error('❌ Audio decryption failed:', error);
      throw new Error('Failed to decrypt audio data');
    }
  }

  /**
   * Encrypt session key with participant's public key
   * @param {CryptoKey} sessionKey - Session key to encrypt
   * @param {CryptoKey} publicKey - Participant's public key
   * @returns {Promise<string>} Encrypted session key
   */
  async encryptSessionKeyForParticipant(sessionKey, publicKey) {
    try {
      const sessionKeyData = await this.exportSessionKey(sessionKey);
      const sessionKeyBuffer = this.base64ToArrayBuffer(sessionKeyData);
      
      const encrypted = await window.crypto.subtle.encrypt(
        { name: 'RSA-OAEP' },
        publicKey,
        sessionKeyBuffer
      );

      return this.arrayBufferToBase64(encrypted);
    } catch (error) {
      console.error('❌ Failed to encrypt session key:', error);
      throw new Error('Failed to encrypt session key for participant');
    }
  }

  /**
   * Decrypt session key with private key
   * @param {string} encryptedSessionKey - Encrypted session key
   * @param {CryptoKey} privateKey - Participant's private key
   * @returns {Promise<CryptoKey>} Decrypted session key
   */
  async decryptSessionKeyFromHost(encryptedSessionKey, privateKey) {
    try {
      const encryptedBuffer = this.base64ToArrayBuffer(encryptedSessionKey);
      
      const decrypted = await window.crypto.subtle.decrypt(
        { name: 'RSA-OAEP' },
        privateKey,
        encryptedBuffer
      );

      const sessionKeyData = this.arrayBufferToBase64(decrypted);
      return await this.importSessionKey(sessionKeyData);
    } catch (error) {
      console.error('❌ Failed to decrypt session key:', error);
      throw new Error('Failed to decrypt session key');
    }
  }

  /**
   * Export public key for sharing
   * @param {CryptoKey} publicKey - Public key to export
   * @returns {Promise<string>} Base64 encoded public key
   */
  async exportPublicKey(publicKey) {
    try {
      const exported = await window.crypto.subtle.exportKey('spki', publicKey);
      return this.arrayBufferToBase64(exported);
    } catch (error) {
      console.error('❌ Failed to export public key:', error);
      throw new Error('Failed to export public key');
    }
  }

  /**
   * Import public key from base64
   * @param {string} publicKeyData - Base64 encoded public key
   * @returns {Promise<CryptoKey>} Imported public key
   */
  async importPublicKey(publicKeyData) {
    try {
      const keyBuffer = this.base64ToArrayBuffer(publicKeyData);
      return await window.crypto.subtle.importKey(
        'spki',
        keyBuffer,
        {
          name: 'RSA-OAEP',
          hash: 'SHA-256'
        },
        false,
        ['encrypt']
      );
    } catch (error) {
      console.error('❌ Failed to import public key:', error);
      throw new Error('Failed to import public key');
    }
  }

  /**
   * Create encrypted media recorder for secure podcast recording
   * @param {MediaStream} stream - Media stream to encrypt
   * @param {CryptoKey} sessionKey - Session encryption key
   * @param {Function} onEncryptedData - Callback for encrypted chunks
   * @returns {Object} Encrypted media recorder controller
   */
  createEncryptedMediaRecorder(stream, sessionKey, onEncryptedData) {
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm;codecs=opus',
      audioBitsPerSecond: 128000
    });

    let chunkCount = 0;

    mediaRecorder.ondataavailable = async (event) => {
      if (event.data.size > 0) {
        try {
          const audioBuffer = await event.data.arrayBuffer();
          const encryptedData = await this.encryptAudioData(audioBuffer, sessionKey);
          
          onEncryptedData({
            ...encryptedData,
            chunkId: ++chunkCount,
            mimeType: mediaRecorder.mimeType
          });
          
          console.log(`🔒 Encrypted chunk ${chunkCount}: ${audioBuffer.byteLength} → ${encryptedData.data.length} chars`);
        } catch (error) {
          console.error('❌ Failed to encrypt media chunk:', error);
        }
      }
    };

    return {
      recorder: mediaRecorder,
      start: (timeslice = 1000) => {
        console.log('🎙️ Starting encrypted recording...');
        mediaRecorder.start(timeslice);
      },
      stop: () => {
        console.log('⏹️ Stopping encrypted recording...');
        mediaRecorder.stop();
      },
      pause: () => mediaRecorder.pause(),
      resume: () => mediaRecorder.resume(),
      getState: () => mediaRecorder.state
    };
  }

  /**
   * Generate session passphrase for easy sharing
   * @returns {string} Human-readable passphrase
   */
  generateSessionPassphrase() {
    const words = [
      'alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot', 'golf', 'hotel',
      'india', 'juliet', 'kilo', 'lima', 'mike', 'november', 'oscar', 'papa',
      'quebec', 'romeo', 'sierra', 'tango', 'uniform', 'victor', 'whiskey', 'xray', 'yankee', 'zulu'
    ];
    
    const passphrase = [];
    for (let i = 0; i < 4; i++) {
      const randomIndex = Math.floor(Math.random() * words.length);
      passphrase.push(words[randomIndex]);
    }
    
    return passphrase.join('-');
  }

  /**
   * Utility: Convert ArrayBuffer to Base64
   */
  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Utility: Convert Base64 to ArrayBuffer
   */
  base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Create fingerprint for key verification
   * @param {CryptoKey} key - Key to fingerprint
   * @returns {Promise<string>} Key fingerprint
   */
  async createKeyFingerprint(key) {
    try {
      const exported = await window.crypto.subtle.exportKey('spki', key);
      const hash = await window.crypto.subtle.digest('SHA-256', exported);
      const hashArray = new Uint8Array(hash);
      const hashBase64 = this.arrayBufferToBase64(hash);
      
      // Return first 8 characters for display
      return hashBase64.substring(0, 8);
    } catch (error) {
      console.error('❌ Failed to create key fingerprint:', error);
      return 'unknown';
    }
  }
}

// Export singleton instance
export default new EncryptionService();
