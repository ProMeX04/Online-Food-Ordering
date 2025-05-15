import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { Request, Response, NextFunction } from 'express';


const processOneImage = async (file: Express.Multer.File): Promise<void> => {
    const originalPath = file.path;
    const fileDir = path.dirname(originalPath);
    const filename = path.basename(originalPath, path.extname(originalPath));
    const webpFilename = `${filename}.webp`;
    const outputPath = path.join(fileDir, webpFilename);

    await sharp(originalPath)
        .resize(1000)
        .webp({
            quality: 80,
            effort: 6  
        })
        .toFile(outputPath);

    fs.unlinkSync(originalPath);

    file.path = outputPath;
    file.filename = webpFilename;
    file.mimetype = 'image/webp';
};


export const processImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) {
            return next();
        }

        await processOneImage(req.file);
        next();
    } catch (error) {
        console.error('Lỗi khi xử lý ảnh:', error);
        next(error);
    }
};

export const processImages = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.files || Array.isArray(req.files) && req.files.length === 0) {
            return next();
        }

        if (Array.isArray(req.files)) {
            await Promise.all(req.files.map(file => processOneImage(file)));
        }
        else {
            for (const fieldname in req.files) {
                const fieldFiles = req.files[fieldname];
                await Promise.all(fieldFiles.map(file => processOneImage(file)));
            }
        }

        next();
    } catch (error) {
        console.error('Lỗi khi xử lý nhiều ảnh:', error);
        next(error);
    }
}; 