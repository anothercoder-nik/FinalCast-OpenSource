import { createRoute } from "@tanstack/react-router"
import { rootRoute } from "./__root.js"
import { checkAuth } from "../utils/helper.js"
import JoinForm from "../components/Forms/JoinForm.jsx"

export const JoinRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/join',
    component: JoinForm,
    beforeLoad: checkAuth
})
