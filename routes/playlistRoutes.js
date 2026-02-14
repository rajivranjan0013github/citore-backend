import express from "express";
import {
    createPlaylist,
    getAllPlaylists,
    getPlaylistById,
    updatePlaylist,
    updateChapters,
    deletePlaylist,
} from "../controller/playlistController.js";

const router = express.Router();

router.post("/", createPlaylist);
router.get("/", getAllPlaylists);
router.get("/:id", getPlaylistById);
router.put("/:id", updatePlaylist);
router.put("/:id/chapters", updateChapters);
router.delete("/:id", deletePlaylist);

export default router;
