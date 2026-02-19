import express from "express";
import {
    createPlaylist,
    createBulkPlaylist,
    getAllPlaylists,
    searchPlaylists,
    getPlaylistById,
    updatePlaylist,
    updateChapters,
    deletePlaylist,
} from "../controller/playlistController.js";

const router = express.Router();

router.post("/", createPlaylist);
router.post("/bulk", createBulkPlaylist);
router.get("/", getAllPlaylists);
router.get("/search", searchPlaylists);
router.get("/:id", getPlaylistById);
router.put("/:id", updatePlaylist);
router.put("/:id/chapters", updateChapters);
router.delete("/:id", deletePlaylist);

export default router;
