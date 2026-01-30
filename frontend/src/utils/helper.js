import { redirect } from "@tanstack/react-router";

import { login, logout } from "../store/slice/authslice.js";
import { getCurrentUser } from "../api/user.api.js";

export const checkAuth = async ({ context }) => {
    try {
        const { queryClient, store } = context;

        // Clear any existing auth state first
        store.dispatch(logout());

        // Try to get current user from backend
        const user = await getCurrentUser();

        if (!user) {
            // Clear the query cache and redirect
            queryClient.removeQueries({ queryKey: ["currentUser"] });
            throw new Error("No user found");
        }

        // Set user in Redux state
        store.dispatch(login(user));
        return true;

    } catch (error) {
        // Authentication failed (user not logged in), redirecting to auth
        // console.log("Authentication failed:", error);

        // Clear all auth-related data
        const { queryClient, store } = context;
        store.dispatch(logout());
        queryClient.removeQueries({ queryKey: ["currentUser"] });

        // Redirect to auth page
        throw redirect({ to: "/auth" });
    }
};
