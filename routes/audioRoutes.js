import express from "express";
import {
    createAudio,
    getAllAudio,
    getAudioById,
    updateAudio,
    deleteAudio,
} from "../controller/audioController.js";

const router = express.Router();

router.post("/", createAudio);
router.get("/", getAllAudio);
router.get("/:id", getAudioById);
router.put("/:id", updateAudio);
router.delete("/:id", deleteAudio);

export default router;
