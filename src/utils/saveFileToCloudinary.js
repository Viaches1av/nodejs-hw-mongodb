const cloudinary = require('cloudinary').v2;
const fs = require('fs/promises');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const saveFileToCloudinary = async (file) => {
  try {
    console.log('Начинаем загрузку файла на Cloudinary');
    console.log('Путь к файлу:', file.path);
    const result = await cloudinary.uploader.upload(file.path, {
      folder: process.env.CLOUDINARY_FOLDER,
    });
    console.log('Загрузка на Cloudinary завершена. Результат:', result);

    await fs.unlink(file.path);
    return result.secure_url;
  } catch (error) {
    console.error('Ошибка при загрузке на Cloudinary:', error.message);
    throw new Error('Failed to upload file to Cloudinary');
  }
};

module.exports = saveFileToCloudinary;
