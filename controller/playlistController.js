import Playlist from "../models/PlaylistSchema.js";
import Audio from "../models/AudioSchema.js";

// POST /api/playlist
export const createPlaylist = async (req, res) => {
    try {
        const { title, description, category, images, author, chapters, tags, duration } = req.body;

        const playlist = await Playlist.create({
            title,
            description,
            category,
            images: images || [],
            author,
            chapters: chapters || [],
            tags: tags || [],
            duration,
        });

        res.status(201).json({ success: true, data: playlist });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/playlist
export const getAllPlaylists = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [playlists, total] = await Promise.all([
            Playlist.find()
                .populate("chapters")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Playlist.countDocuments(),
        ]);

        res.json({
            success: true,
            data: playlists,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/playlist/search?q=keyword  OR  ?category=Romance
export const searchPlaylists = async (req, res) => {
    try {
        const { q, category } = req.query;
        let filter = {};

        if (q) {
            const regex = new RegExp(q, 'i');
            filter = { $or: [{ title: regex }, { category: regex }] };
        } else if (category) {
            filter = { category: { $regex: new RegExp(category, 'i') } };
        }

        const playlists = await Playlist.find(filter)
            .populate("chapters")
            .sort({ createdAt: -1 })
            .limit(20);

        res.json({ success: true, data: playlists });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/playlist/:id
export const getPlaylistById = async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id).populate("chapters");
        if (!playlist) {
            return res.status(404).json({ success: false, message: "Playlist not found" });
        }
        res.json({ success: true, data: playlist });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// PUT /api/playlist/:id
export const updatePlaylist = async (req, res) => {
    try {
        const { title, description, category, images, author, tags, duration } = req.body;
        const updateData = {};

        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (category !== undefined) updateData.category = category;
        if (images !== undefined) updateData.images = images;
        if (author !== undefined) updateData.author = author;
        if (tags !== undefined) updateData.tags = tags;
        if (duration !== undefined) updateData.duration = Number(duration);

        const playlist = await Playlist.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate("chapters");
        if (!playlist) {
            return res.status(404).json({ success: false, message: "Playlist not found" });
        }

        res.json({ success: true, data: playlist });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// PUT /api/playlist/:id/chapters
export const updateChapters = async (req, res) => {
    try {
        const { chapters } = req.body; // array of Audio ObjectIds

        if (!Array.isArray(chapters)) {
            return res.status(400).json({ success: false, message: "chapters must be an array of Audio IDs" });
        }

        const playlist = await Playlist.findByIdAndUpdate(
            req.params.id,
            { chapters },
            { new: true }
        ).populate("chapters");

        if (!playlist) {
            return res.status(404).json({ success: false, message: "Playlist not found" });
        }

        res.json({ success: true, data: playlist });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE /api/playlist/:id
export const deletePlaylist = async (req, res) => {
    try {
        const playlist = await Playlist.findByIdAndDelete(req.params.id);
        if (!playlist) {
            return res.status(404).json({ success: false, message: "Playlist not found" });
        }
        res.json({ success: true, message: "Playlist deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/playlist/bulk
export const createBulkPlaylist = async (req, res) => {
    try {
        const { playlist, chapters } = req.body;

        if (!playlist || !chapters || !Array.isArray(chapters)) {
            return res.status(400).json({
                success: false,
                message: "Invalid data. Expected 'playlist' object and 'chapters' array."
            });
        }

        // 1. Create all Audio documents
        const audioPromises = chapters.map(chapter => Audio.create({
            title: chapter.title || "Untitled Chapter",
            description: chapter.description,
            image: chapter.image,
            author: chapter.author || playlist.author,
            url: chapter.url,
            tags: chapter.tags || [],
            duration: chapter.duration ? Number(chapter.duration) : undefined,
        }));

        const createdAudios = await Promise.all(audioPromises);
        const audioIds = createdAudios.map(a => a._id);

        // 2. Create the Playlist document
        const newPlaylist = await Playlist.create({
            title: playlist.title,
            description: playlist.description,
            category: playlist.category,
            images: playlist.images || [],
            author: playlist.author,
            chapters: audioIds,
            tags: playlist.tags || [],
            duration: playlist.duration,
        });

        // 3. Return populated playlist
        const populatedPlaylist = await Playlist.findById(newPlaylist._id).populate("chapters");

        res.status(201).json({ success: true, data: populatedPlaylist });
    } catch (error) {
        console.error("Bulk upload error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
