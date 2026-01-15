import { createRoute } from "@tanstack/react-router"
import { rootRoute } from "./__root.js"
import { checkAuth } from "../utils/helper.js"
import content from "../components/Main/content.jsx"

export const contentRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/content',
    component: content,
    beforeLoad: checkAuth
})