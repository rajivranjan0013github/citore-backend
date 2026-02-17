import { Router } from "express";
import User from "../models/User.js";

const router = Router();

// GET /api/users/:id — fetch user by ID
router.get("/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-__v");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json({
            id: user._id,
            email: user.email,
            name: user.name,
            gender: user.gender,
            age: user.age,
            language: user.language,
            fcmToken: user.fcmToken,
            plateform: user.plateform,
        });
    } catch (err) {
        console.error("Error fetching user:", err.message);
        res.status(500).json({ error: "Server error" });
    }
});

// POST /api/users/:id — update user fields
router.post("/:id", async (req, res) => {
    try {
        const { user: userData } = req.body;
        if (!userData || typeof userData !== "object") {
            return res.status(400).json({ error: "Invalid user data" });
        }

        // Only allow updating specific fields
        const allowedFields = ["name", "gender", "age", "language", "fcmToken", "plateform"];
        const update = {};
        for (const key of allowedFields) {
            if (userData[key] !== undefined) {
                update[key] = userData[key];
            }
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { $set: update },
            { new: true, runValidators: true }
        ).select("-__v");

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({
            id: user._id,
            email: user.email,
            name: user.name,
            gender: user.gender,
            age: user.age,
            language: user.language,
            fcmToken: user.fcmToken,
            plateform: user.plateform,
        });
    } catch (err) {
        console.error("Error updating user:", err.message);
        res.status(500).json({ error: "Server error" });
    }
});

// DELETE /api/users/:id — delete account
router.delete("/:id", async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json({ success: true, message: "User deleted successfully" });
    } catch (err) {
        console.error("Error deleting user:", err.message);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;
