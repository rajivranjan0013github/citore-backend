import { Router } from "express";
import User from "../models/User.js";

const router = Router();

/**
 * POST /api/webhooks/revenuecat
 * Handles RevenueCat webhooks to sync premium status
 * Structure: { event: { app_user_id, type, entitlement_ids, expiration_at_ms, product_id, ... } }
 */
router.post("/revenuecat", async (req, res) => {
    try {
        // RevenueCat V2 uses nested "event", V1 sends event at top level
        const event = req.body.event || req.body;

        if (!event || !event.app_user_id) {
            return res.status(400).json({ error: "Invalid webhook payload" });
        }

        const { app_user_id, type, entitlement_ids, expiration_at_ms, product_id } = event;

        console.log(`[RevenueCat Webhook] Processing event "${type}" for user: ${app_user_id}`);

        // 1. Identify User (app_user_id could be Mongo ID or Email)
        let user;
        if (app_user_id.includes('@')) {
            user = await User.findOne({ email: app_user_id });
        }

        // If not found by email, try by ID
        if (!user) {
            try {
                user = await User.findById(app_user_id);
            } catch (err) {
                // Not a valid ID
            }
        }

        if (!user) {
            console.warn(`[RevenueCat Webhook] User not found: ${app_user_id}`);
            return res.status(404).json({ error: "User not found" });
        }

        // 2. Determine Premium Status
        // RevenueCat sends the type of event. If it's EXPIRATION, user is no longer premium.
        // For simplicity and robustness, we can check if there are any active entitlements.
        const hasActiveEntitlements = entitlement_ids && entitlement_ids.length > 0;

        // Detailed check based on event type
        let isPremium = hasActiveEntitlements;
        if (type === 'EXPIRATION') {
            isPremium = false;
        }

        // 3. Update User
        user.isPremium = isPremium;
        if (expiration_at_ms) {
            user.premiumExpiresAt = new Date(expiration_at_ms);
        }
        if (product_id) {
            user.premiumPlan = product_id;
        }

        await user.save();

        console.log(`[RevenueCat Webhook] Successfully updated user ${user.email}. isPremium: ${user.isPremium}`);
        res.json({ success: true });

    } catch (err) {
        console.error("[RevenueCat Webhook] Error:", err.message);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
