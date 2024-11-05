const cloudinary = require('cloudinary').v2;
const fs = require('fs/promises');
const path = require('path');

// Настройки Cloudinary (инициализация с использованием переменных среды)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const saveFileToCloudinary = async (file) => {
  try {
    // Загружаем файл на Cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
      folder: process.env.CLOUDINARY_FOLDER, // Папка, в которую будет загружен файл
    });

    // Удаляем временный файл после загрузки
    await fs.unlink(file.path);

    return result.secure_url; // Возвращаем безопасный URL загруженного файла
  } catch (error) {
    throw new Error('Failed to upload file to Cloudinary');
  }
};

module.exports = { saveFileToCloudinary };
