import { Injectable } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

// est ce que je dois rester dans dist ou je dois aller dans src ? changer dans les routes si besoin 
@Injectable()
export class ImageInterceptor {
    static create(element: string) {
        return FileInterceptor('image', {
            storage: diskStorage({
                destination: './dist/public/images/' + element,
                filename: (req, file, cb) => {
                    const extension = file.mimetype.split('/')[1];
                    cb(null, `${element}-${Date.now()}.${extension}`);
                },
            }),
            preservePath: true,
            limits: { fileSize: 1024 * 1024 * 5 }, // 5MB
        });
    }
}