import AWS from 'aws-sdk';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* storage types */
export const STORAGE_PROVIDERS = {
  AWS_S3: 'aws_s3',
  CLOUDINARY: 'cloudinary',
  LOCAL: 'local'
};

/* pick provider */
const STORAGE_PROVIDER =
  process.env.STORAGE_PROVIDER || STORAGE_PROVIDERS.LOCAL;

/* local upload path */
const UPLOAD_DIR = path.join(__dirname, '../../uploads/recordings');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/* -------------------- AWS S3 SETUP -------------------- */

let s3 = null;

if (STORAGE_PROVIDER === STORAGE_PROVIDERS.AWS_S3) {
  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1'
  });

  s3 = new AWS.S3();
  console.log('AWS S3 connected');
}

/* -------------------- CLOUDINARY SETUP -------------------- */

if (STORAGE_PROVIDER === STORAGE_PROVIDERS.CLOUDINARY) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });

  console.log('Cloudinary connected');
}

/* -------------------- MULTER STORAGE -------------------- */

export const createStorageConfig = () => {
  if (STORAGE_PROVIDER === STORAGE_PROVIDERS.AWS_S3) {
    return multerS3({
      s3,
      bucket: process.env.AWS_S3_BUCKET_NAME,
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: (req, file, cb) => {
        const { recordingId, participantId } = req.body;
        const ext = path.extname(file.originalname);
        cb(
          null,
          `recordings/${recordingId}/${participantId}_${Date.now()}${ext}`
        );
      }
    });
  }

  // default local storage
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(UPLOAD_DIR, req.body.recordingId);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${req.body.participantId}_${Date.now()}${ext}`);
    }
  });
};

export const createUploadMiddleware = () =>
  multer({
    storage: createStorageConfig(),
    limits: { fileSize: 500 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowed = [
        'video/mp4',
        'video/webm',
        'video/quicktime',
        'audio/mpeg',
        'audio/wav'
      ];

      if (!allowed.includes(file.mimetype)) {
        return cb(new Error('File type not allowed'), false);
      }

      cb(null, true);
    }
  });

/* -------------------- STORAGE SERVICE -------------------- */

export class CloudStorageService {
  constructor() {
    this.provider = STORAGE_PROVIDER;
  }

  async uploadFile(filePath, destination, metadata = {}) {
    if (this.provider === STORAGE_PROVIDERS.AWS_S3) {
      return this.uploadToS3(filePath, destination, metadata);
    }

    if (this.provider === STORAGE_PROVIDERS.CLOUDINARY) {
      return this.uploadToCloudinary(filePath, destination, metadata);
    }

    return this.uploadToLocal(filePath, destination);
  }

  async uploadToS3(filePath, destination, metadata) {
    const file = fs.readFileSync(filePath);

    const res = await s3
      .upload({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: destination,
        Body: file,
        Metadata: metadata
      })
      .promise();

    return {
      provider: 'aws_s3',
      url: res.Location,
      key: res.Key
    };
  }

  async uploadToCloudinary(filePath, destination, metadata) {
    const res = await cloudinary.uploader.upload(filePath, {
      public_id: destination.replace(/\.[^/.]+$/, ''),
      resource_type: 'video',
      context: metadata
    });

    return {
      provider: 'cloudinary',
      url: res.secure_url,
      publicId: res.public_id,
      duration: res.duration
    };
  }

  async uploadToLocal(filePath, destination) {
    const target = path.join(UPLOAD_DIR, destination);
    const dir = path.dirname(target);

    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.copyFileSync(filePath, target);

    return {
      provider: 'local',
      url: `/uploads/recordings/${destination}`,
      path: target
    };
  }

  async deleteFile(key) {
    try {
      if (this.provider === STORAGE_PROVIDERS.AWS_S3) {
        await s3
          .deleteObject({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: key
          })
          .promise();
      } else if (this.provider === STORAGE_PROVIDERS.CLOUDINARY) {
        await cloudinary.uploader.destroy(key, { resource_type: 'video' });
      } else {
        const file = path.join(UPLOAD_DIR, key);
        if (fs.existsSync(file)) fs.unlinkSync(file);
      }
      return true;
    } catch {
      return false;
    }
  }
}

/* -------------------- EXPORTS -------------------- */

export const cloudStorage = new CloudStorageService();

export const getStorageConfig = () => ({
  provider: STORAGE_PROVIDER,
  aws: !!process.env.AWS_S3_BUCKET_NAME,
  cloudinary: !!process.env.CLOUDINARY_CLOUD_NAME,
  local: true
});
