import multer from "multer";
import path from "path";
import fs from "fs";

const createUploadDir = (dirPath: string) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
    return dirPath;
};

export const profileUpload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, createUploadDir("uploads/profiles/"));
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = path.extname(file.originalname);
            const userId = req.user?.id || 'unknown-user';
            cb(null, `${userId}-${uniqueSuffix}${ext}`);
        }
    }),
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error("Chỉ chấp nhận file hình ảnh"));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 
    }
});

export const dishUpload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, createUploadDir("uploads/dishes/"));
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = path.extname(file.originalname);
            cb(null, `dish-${uniqueSuffix}${ext}`);
        }
    }),
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error("Only accept image files"));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});
