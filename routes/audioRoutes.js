import express from "express";
import multer from "multer";
import {
    uploadAudio,
    getAllAudio,
    getAudioById,
    updateAudio,
    deleteAudio,
} from "../controller/audioController.js";

const router = express.Router();

// Multer config — store in memory for direct R2 upload
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB max
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("audio/") || file.mimetype === "application/octet-stream") {
            cb(null, true);
        } else {
            cb(new Error("Only audio files are allowed"), false);
        }
    },
});

router.post("/upload", upload.single("audio"), uploadAudio);
router.get("/", getAllAudio);
router.get("/:id", getAudioById);
router.put("/:id", updateAudio);
router.delete("/:id", deleteAudio);

export default router;
