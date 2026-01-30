import { createRoute } from "@tanstack/react-router"
import { rootRoute } from "./__root.js"
import { checkAuth } from "../utils/helper.js"
import Studios from "../pages/Studios.jsx"

export const studiosRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/studios',
    component: Studios,
    beforeLoad: checkAuth
})