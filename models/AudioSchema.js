import mongoose from "mongoose";

const audioSchema = new mongoose.Schema({
    title: {
        type: String,
    },
    description: {
        type: String
    },
    image: {
        type: String
    },
    author: {
        type: String,
    },
    url: {
        type: String,
    },
    tags: [String],
    duration: {
        type: Number
    },
}, { timestamps: true })

export default mongoose.model("Audio", audioSchema);
