const firebaseApp = require("firebase/app");
const firebaseStorage = require("firebase/storage");
const multer = require("multer");

firebaseApp.initializeApp({
    apiKey: "AIzaSyAiavYHC4hH8z9Mdu-0A8cUzcrX4Dzg7aY",
    authDomain: "hrm-codeline.firebaseapp.com",
    projectId: "hrm-codeline",
    storageBucket: "hrm-codeline.appspot.com",
    messagingSenderId: "920500645964",
    appId: "1:920500645964:web:9e4ef424462c2b3d8904e9",
    measurementId: "G-46VFXQJYQQ"
    // apiKey: "AIzaSyA_0YINIAKeAeExv09JHJcwaQOT-p5yOiw",
    // authDomain: "hrms-system-codeline.firebaseapp.com",
    // projectId: "hrms-system-codeline",
    // storageBucket: "hrms-system-codeline.appspot.com",
    // messagingSenderId: "469618831214",
    // appId: "1:469618831214:web:538ae5d2bc5cfd39209b7f",
    // measurementId: "G-5BX6XFYVCG"
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

const deleteFileFromFirebase = async (fileName) => {
    try {
        const storageRef = firebaseStorage.ref(storage, fileName);
        await firebaseStorage.deleteObject(storageRef);
    } catch (error) {
        throw error;
    }
};

module.exports = { uploadCertifiesToFierbase, uploadMulter, deleteFileFromFirebase };