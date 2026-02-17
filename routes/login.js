import { Router } from "express";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import mongoose from "mongoose";

const router = Router();

// Apple JWKS client for verifying Apple identity tokens
const appleJwksClient = jwksClient({
    jwksUri: "https://appleid.apple.com/auth/keys",
    cache: true,
    cacheMaxAge: 86400000, // 24 hours
});

// Google Client IDs
const GOOGLE_CLIENT_ID_WEB = process.env.GOOGLE_CLIENT_ID_WEB || "369760073328-5ng2odnbd6o1v737ug0veujcjm8ebklq.apps.googleusercontent.com";
const GOOGLE_CLIENT_ID_IOS = process.env.GOOGLE_CLIENT_ID_IOS || "369760073328-eoqjhmn58gaodhastedv6qbpmvpt93rv.apps.googleusercontent.com";

// Apple Bundle ID
const APPLE_BUNDLE_ID = process.env.APPLE_BUNDLE_ID || "com.thousandways.scitore";

// Google authentication route
router.post("/google/loginSignUp", async (req, res) => {
    try {
        const { token, platform } = req.body;
        console.log("Token:", token);
        console.log("Platform:", platform);

        if (!token) {
            return res.status(400).json({ error: "Token is required" });
        }

        // Select client ID based on platform
        // Android sends tokens minted for the Web client ID (serverClientId in CredentialsManager)
        // iOS sends tokens minted for the iOS client ID (GIDClientID in Info.plist)
        const clientId = platform === "android" ? GOOGLE_CLIENT_ID_WEB : GOOGLE_CLIENT_ID_IOS;
        const client = new OAuth2Client(clientId);

        // Verify the token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: clientId,
        });

        const payload = ticket.getPayload();

        // Check if user exists
        let user = await User.findOne({ email: payload.email });
        let isNewUser = false;

        if (!user) {
            // Create new user
            isNewUser = true;
            user = await User.create({
                email: payload.email,
                name: payload.name,
            });
        }

        res.json({
            success: true,
            isNewUser,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                gender: user.gender,
                age: user.age,
            },
        });
    } catch (error) {
        console.error("Error verifying Google token:", error.message);
        res.status(401).json({
            success: false,
            error: "Invalid token",
        });
    }
});

// Helper function to get Apple signing key
function getAppleSigningKey(header, callback) {
    appleJwksClient.getSigningKey(header.kid, (err, key) => {
        if (err) {
            callback(err);
        } else {
            const signingKey = key.getPublicKey();
            callback(null, signingKey);
        }
    });
}

// Apple authentication route
router.post("/apple/loginSignUp", async (req, res) => {
    try {
        const { idToken, displayName, email: providedEmail } = req.body;

        if (!idToken) {
            return res.status(400).json({ error: "Identity token is required" });
        }

        // Verify the Apple identity token
        const decodedToken = await new Promise((resolve, reject) => {
            jwt.verify(
                idToken,
                getAppleSigningKey,
                {
                    algorithms: ["RS256"],
                    issuer: "https://appleid.apple.com",
                    audience: APPLE_BUNDLE_ID,
                },
                (err, decoded) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(decoded);
                    }
                }
            );
        });

        // Extract email from token or use provided email
        const email = decodedToken.email || providedEmail;
        const appleUserId = decodedToken.sub;

        if (!email) {
            return res.status(400).json({
                error: "Email is required. Please try signing in again."
            });
        }

        // Check if user exists by email or Apple user ID
        let user = await User.findOne({
            $or: [{ email }, { appleUserId }]
        });
        let isNewUser = false;

        if (!user) {
            // Create new user
            isNewUser = true;
            user = await User.create({
                email,
                name: displayName || "User",
                appleUserId,
            });
        } else if (!user.appleUserId) {
            // Update existing user with Apple ID
            user.appleUserId = appleUserId;
            await user.save();
        }

        res.json({
            success: true,
            isNewUser,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                gender: user.gender,
                age: user.age,
            },
        });
    } catch (error) {
        console.error("Error verifying Apple token:", error.message);
        res.status(401).json({
            success: false,
            error: "Invalid token",
        });
    }
});

export default router;
