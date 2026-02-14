import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    category: {
        type: String,
    },
    images: [{
        type: String,
    }],
    author: {
        type: String,
        required: true,
    },
    chapters: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Audio"
    }],
    tags: [String],
    duration: {
        type: Number,
    },
}, { timestamps: true })

export default mongoose.model("Playlist", playlistSchema);