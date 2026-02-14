import Audio from "../models/AudioSchema.js";
import { uploadToR2, deleteFromR2 } from "../config/r2.js";

// POST /api/audio/upload
export const uploadAudio = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No audio file provided" });
        }

        const { title, description, author, tags, duration, image } = req.body;

        // Upload file to R2
        const { key, url } = await uploadToR2(
            req.file.buffer,
            req.file.originalname,
            req.file.mimetype
        );

        const audio = await Audio.create({
            title: title || req.file.originalname,
            description,
            image,
            author,
            url,
            tags: tags ? JSON.parse(tags) : [],
            duration: duration ? Number(duration) : undefined,
        });

        // Store R2 key for future deletion
        audio._r2Key = key;

        res.status(201).json({ success: true, data: audio });
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/audio
export const getAllAudio = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [audios, total] = await Promise.all([
            Audio.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
            Audio.countDocuments(),
        ]);

        res.json({
            success: true,
            data: audios,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/audio/:id
export const getAudioById = async (req, res) => {
    try {
        const audio = await Audio.findById(req.params.id);
        if (!audio) {
            return res.status(404).json({ success: false, message: "Audio not found" });
        }
        res.json({ success: true, data: audio });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// PUT /api/audio/:id
export const updateAudio = async (req, res) => {
    try {
        const { title, description, author, tags, duration, image } = req.body;
        const updateData = {};

        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (author !== undefined) updateData.author = author;
        if (image !== undefined) updateData.image = image;
        if (tags !== undefined) updateData.tags = typeof tags === "string" ? JSON.parse(tags) : tags;
        if (duration !== undefined) updateData.duration = Number(duration);

        const audio = await Audio.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!audio) {
            return res.status(404).json({ success: false, message: "Audio not found" });
        }

        res.json({ success: true, data: audio });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE /api/audio/:id
export const deleteAudio = async (req, res) => {
    try {
        const audio = await Audio.findById(req.params.id);
        if (!audio) {
            return res.status(404).json({ success: false, message: "Audio not found" });
        }

        // Extract R2 key from URL and delete from R2
        if (audio.url) {
            const key = audio.url.split("/").pop();
            try {
                await deleteFromR2(key);
            } catch (r2Err) {
                console.warn("R2 delete failed (continuing):", r2Err.message);
            }
        }

        await Audio.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Audio deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
