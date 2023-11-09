
const firebaseApp = require("firebase/app");
const firebaseStorage = require("firebase/storage");
const multer = require("multer");

firebaseApp.initializeApp({
    apiKey: "AIzaSyA_0YINIAKeAeExv09JHJcwaQOT-p5yOiw",
    authDomain: "hrms-system-codeline.firebaseapp.com",
    projectId: "hrms-system-codeline",
    storageBucket: "hrms-system-codeline.appspot.com",
    messagingSenderId: "469618831214",
    appId: "1:469618831214:web:538ae5d2bc5cfd39209b7f",
    measurementId: "G-5BX6XFYVCG"
});
const storage = firebaseStorage.getStorage();
const uploadMulter = multer({ storage: multer.memoryStorage() });

const giveCurrentDateTime = () => {
    const today = new Date();
    const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const dateTime = date + ' ' + time;
    return dateTime;
}

const uploadCertifiesToFierbase = async (file) => {
    try {
        const dateTime = giveCurrentDateTime();
        const storageRef = firebaseStorage.ref(storage, `employee-img/${file.originalname}-${dateTime}`);
        const metadata = {
            contentType: file.mimetype,
        };

        const snapshot = await firebaseStorage.uploadBytes(storageRef, file.buffer, metadata);
        const downloadURL = await firebaseStorage.getDownloadURL(snapshot.ref);

        return downloadURL;
    } catch (error) {
        console.error("Error uploading to Firebase Storage:", error);
        throw error;
    }
}

module.exports = { uploadCertifiesToFierbase, uploadMulter }


// const multer = require("multer");

// // Set up Multer storage
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, "uploads/"); // Define the upload directory
//     },
//     filename: (req, file, cb) => {
//         const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//         const extension = file.originalname.split('.').pop();
//         cb(null, uniqueSuffix + "." + extension);
//     },
// })

// // Configure the multer upload
// const upload = multer({
//     storage: storage,
//     limits: {
//         fileSize: 1024 * 1024 * 5, // 5MB file size limit
//     },
// });

// module.exports = upload;
