import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    gender: {
        type: String,
    },
    age: {
        type: Number,
    },
    language: {
        type: String,
    },
    appleUserId: {
        type: String,
    },
    fcmToken: {
        type: String,
    },
    plateform: {
        type: String
    }
}, {
    timestamps: true,
});

const User = mongoose.model('User', userSchema);

export default User;
