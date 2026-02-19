import { Router } from "express";
import PlayHistory from "../models/PlayHistory.js";

const router = Router();

// POST /api/play-history/update — upsert playback position
router.post("/update", async (req, res) => {
    try {
        const {
            userId,
            playlistId,
            currentChapterIndex,
            currentChapterId,
            positionSeconds,
            completedChapters,
            isCompleted,
        } = req.body;

        if (!userId || !playlistId) {
            return res.status(400).json({ error: "userId and playlistId are required" });
        }

        const history = await PlayHistory.findOneAndUpdate(
            { userId, playlistId },
            {
                $set: {
                    currentChapterIndex: currentChapterIndex || 0,
                    currentChapterId,
                    positionSeconds: positionSeconds || 0,
                    completedChapters: completedChapters || [],
                    isCompleted: isCompleted || false,
                    lastPlayedAt: new Date(),
                },
            },
            { upsert: true, new: true, runValidators: true }
        );

        res.json({ success: true, data: history });
    } catch (err) {
        console.error("Error updating play history:", err.message);
        res.status(500).json({ error: "Server error" });
    }
});

// GET /api/play-history/:userId — all history for a user
router.get("/:userId", async (req, res) => {
    try {
        const history = await PlayHistory.find({ userId: req.params.userId })
            .populate({
                path: "playlistId",
                select: "title author images category duration chapters description",
                populate: {
                    path: "chapters",
                    select: "title description url duration image author",
                },
            })
            .sort({ lastPlayedAt: -1 });

        res.json({ success: true, data: history });
    } catch (err) {
        console.error("Error fetching play history:", err.message);
        res.status(500).json({ error: "Server error" });
    }
});

// GET /api/play-history/:userId/:playlistId — single playlist history
router.get("/:userId/:playlistId", async (req, res) => {
    try {
        const history = await PlayHistory.findOne({
            userId: req.params.userId,
            playlistId: req.params.playlistId,
        });

        if (!history) {
            return res.json({ success: true, data: null });
        }

        res.json({ success: true, data: history });
    } catch (err) {
        console.error("Error fetching playlist history:", err.message);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;
