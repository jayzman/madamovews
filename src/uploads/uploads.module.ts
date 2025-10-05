import { Module } from "@nestjs/common"
import { MulterModule } from "@nestjs/platform-express"
import { diskStorage } from "multer"
import { extname, join } from "path"
import * as fs from "fs"

// Créer le répertoire d'uploads s'il n'existe pas
const uploadsDir = join(process.cwd(), "uploads")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, uploadsDir)
        },
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join("")
          cb(null, `${randomName}${extname(file.originalname)}`)
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/(pdf|jpg|jpeg|png)$/)) {
          cb(null, true)
        } else {
          cb(new Error("Seuls les fichiers PDF, JPG, JPEG et PNG sont autorisés!"), false)
        }
      },
    }),
  ],
  exports: [MulterModule],
})
export class UploadsModule {}

