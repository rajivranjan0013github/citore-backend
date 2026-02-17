import Audio from "../models/AudioSchema.js";

// POST /api/audio
export const createAudio = async (req, res) => {
    try {
        const { title, description, author, tags, duration, image, url } = req.body;

        if (!url) {
            return res.status(400).json({ success: false, message: "No audio URL provided" });
        }

        const audio = await Audio.create({
            title: title || "Untitled",
            description,
            image,
            author,
            url,
            tags: tags || [],
            duration: duration ? Number(duration) : undefined,
        });

        res.status(201).json({ success: true, data: audio });
    } catch (error) {
        console.error("Create audio error:", error);
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
        const { title, description, author, tags, duration, image, url } = req.body;
        const updateData = {};

        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (author !== undefined) updateData.author = author;
        if (image !== undefined) updateData.image = image;
        if (url !== undefined) updateData.url = url;
        if (tags !== undefined) updateData.tags = tags;
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
        const audio = await Audio.findByIdAndDelete(req.params.id);
        if (!audio) {
            return res.status(404).json({ success: false, message: "Audio not found" });
        }

        res.json({ success: true, message: "Audio deleted from database" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
