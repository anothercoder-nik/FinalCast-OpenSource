import { createRoute } from "@tanstack/react-router"
import { rootRoute } from "./__root.js"
import Landing from "../pages/Landing.jsx"

export const HomeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: Landing
})