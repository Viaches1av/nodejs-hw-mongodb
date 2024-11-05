const multer = require('multer');
const path = require('path');
const TEMP_UPLOAD_DIR = path.join(process.cwd(), 'temp');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, TEMP_UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now();
    cb(null, `${uniqueSuffix}_${file.originalname}`);
  },
});

const upload = multer({ storage });

module.exports = upload;
