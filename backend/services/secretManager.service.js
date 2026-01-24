import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const ENCRYPTION_KEY = process.env.MASTER_KEY || crypto.randomBytes(32);
const IV_LENGTH = 16;

class SecretManager {
  constructor() {
    this.encryptedSecretsPath = path.join(process.cwd(), '.secrets.enc');
    this.secrets = new Map();
  }

  encrypt(text) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  decrypt(encryptedText) {
    const textParts = encryptedText.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encrypted = textParts.join(':');
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  setSecret(key, value) {
    this.secrets.set(key, this.encrypt(value));
    this.saveSecrets();
  }

  getSecret(key) {
    const encrypted = this.secrets.get(key);
    return encrypted ? this.decrypt(encrypted) : null;
  }

  saveSecrets() {
    const secretsObj = Object.fromEntries(this.secrets);
    fs.writeFileSync(this.encryptedSecretsPath, JSON.stringify(secretsObj));
  }

  loadSecrets() {
    try {
      if (fs.existsSync(this.encryptedSecretsPath)) {
        const data = fs.readFileSync(this.encryptedSecretsPath, 'utf8');
        const secretsObj = JSON.parse(data);
        this.secrets = new Map(Object.entries(secretsObj));
      }
    } catch (error) {
      console.warn('Could not load encrypted secrets:', error.message);
    }
  }

  rotateSecret(key) {
    const currentValue = this.getSecret(key);
    if (currentValue) {
      // Generate new secret based on type
      let newValue;
      if (key.includes('JWT')) {
        newValue = crypto.randomBytes(64).toString('hex');
      } else if (key.includes('SECRET')) {
        newValue = crypto.randomBytes(32).toString('hex');
      } else {
        newValue = crypto.randomBytes(16).toString('hex');
      }
      
      this.setSecret(key, newValue);
      return newValue;
    }
    return null;
  }

  // Initialize with current .env values
  migrateFromEnv() {
    const sensitiveKeys = [
      'JWT_SECRET',
      'REFRESH_TOKEN_SECRET',
      'SESSION_SECRET',
      'GOOGLE_CLIENT_SECRET',
      'EMAIL_PASS'
    ];

    sensitiveKeys.forEach(key => {
      if (process.env[key] && !this.secrets.has(key)) {
        this.setSecret(key, process.env[key]);
      }
    });
  }
}

export default new SecretManager();