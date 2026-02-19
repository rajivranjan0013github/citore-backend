import mongoose from "mongoose";

const bookmarkPlaylistSchema = new mongoose.Schema({
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
}, { timestamps: true });

// One bookmark per user per playlist
bookmarkPlaylistSchema.index({ userId: 1, playlistId: 1 }, { unique: true });

export default mongoose.model("BookmarkPlaylist", bookmarkPlaylistSchema);
