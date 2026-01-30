import { createRoute } from "@tanstack/react-router"
import { rootRoute } from "./__root.js"
import Landing from "../pages/Landing.jsx"
import { checkAuth } from "../utils/helper.js"
import Studio from "../pages/Studio.jsx"

export const createStudioRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/create',
    component: Studio,
    beforeLoad: checkAuth
})
