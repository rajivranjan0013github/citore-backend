import mongoose from "mongoose";

const playHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    playlistId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Playlist",
        required: true,
    },
    currentChapterIndex: {
        type: Number,
        default: 0,
    },
    currentChapterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Audio",
    },
    positionSeconds: {
        type: Number,
        default: 0,
    },
    completedChapters: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Audio",
    }],
    isCompleted: {
        type: Boolean,
        default: false,
    },
    lastPlayedAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

// One record per user per playlist
playHistorySchema.index({ userId: 1, playlistId: 1 }, { unique: true });

export default mongoose.model("PlayHistory", playHistorySchema);
