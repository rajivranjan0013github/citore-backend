import express from "express";
import BookmarkPlaylist from "../models/BookmarkPlaylist.js";

const router = express.Router();

// POST /api/bookmarks/toggle — add or remove a bookmark
router.post("/toggle", async (req, res) => {
    try {
        const { userId, playlistId } = req.body;

        if (!userId || !playlistId) {
            return res.status(400).json({ error: "userId and playlistId are required" });
        }

        const existing = await BookmarkPlaylist.findOne({ userId, playlistId });

        if (existing) {
            await BookmarkPlaylist.deleteOne({ _id: existing._id });
            return res.json({ success: true, bookmarked: false });
        } else {
            await BookmarkPlaylist.create({ userId, playlistId });
            return res.json({ success: true, bookmarked: true });
        }
    } catch (err) {
        console.error("Error toggling bookmark:", err.message);
        res.status(500).json({ error: "Server error" });
    }
});

// GET /api/bookmarks/:userId — fetch all bookmarked playlists
router.get("/:userId", async (req, res) => {
    try {
        const bookmarks = await BookmarkPlaylist.find({ userId: req.params.userId })
            .populate({
                path: "playlistId",
                populate: { path: "chapters" },
            })
            .sort({ createdAt: -1 });

        res.json({ success: true, data: bookmarks });
    } catch (err) {
        console.error("Error fetching bookmarks:", err.message);
        res.status(500).json({ error: "Server error" });
    }
});

// GET /api/bookmarks/:userId/:playlistId — check if bookmarked
router.get("/:userId/:playlistId", async (req, res) => {
    try {
        const exists = await BookmarkPlaylist.findOne({
            userId: req.params.userId,
            playlistId: req.params.playlistId,
        });

        res.json({ success: true, bookmarked: !!exists });
    } catch (err) {
        console.error("Error checking bookmark:", err.message);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;
