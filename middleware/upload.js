const path = require("path");
const multer = require("multer");

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log("🚀 ~ file: upload.ts:11 ~ file", process.cwd());
        //  path.join(process.cwd(), "/images/")
        cb(null, "../images"); //images is the folder name
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + "-" + file.originalname); //use the original file name
    },
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg"
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

// req.file
// {
//   errno: -4058,
//   code: 'ENOENT',
//   syscall: 'open',
//   path: 'C:\\Users\\Admin\\Desktop\\Funix\\Lab 19.1\\server\\images\\2023-08-11T06:45:55.183Z-32300ea4-9787-4d00-8e94-e3910009f76d.jpg',
//   storageErrors: []
// }

// multer là một middleware cho Express và Nodejs
// giúp dễ dàng xử lý dữ liệu multipart / form - data khi người dùng upload file
const upload = multer({ storage: fileStorage, fileFilter: fileFilter }).single(
    "file"
); //file is the field name
module.exports = upload;
