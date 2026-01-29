import { createRootRoute } from "@tanstack/react-router"
import RootLayout from "../RootLayout.jsx"
import { HomeRoute } from "./LandingPage.js"
import { authRoute } from "./auth.route.js"
import { dashboardRoute } from "./dashboard.js"
import { contentRoute } from "./contentRoute.js"
import { createStudioRoute } from "./createStudioRoute.js"
import { studiosRoute } from "./studiosRoute.js"
import { JoinRoute } from "./joinStudio.js"
import { studioRoomRoute } from "./studioRoomRoute.js"
import { sessionDetailsRoute } from "./sessionDetailsRoute.js"
import { settingsRoute } from "./settingsRoute.js"
import { editorRoute } from "./editorRoute.js"
import { rootRoute } from "./__root.js"
import { privacyPolicyRoute } from "./privacy-policy";
import { cookiesPolicyRoute } from "./cookies-policy";
import { termsRoute } from "./terms.tsx";



export const routeTree = rootRoute.addChildren([
    HomeRoute, 
    authRoute, 
    dashboardRoute,
    contentRoute,
    createStudioRoute,
    studiosRoute,
    JoinRoute,
    studioRoomRoute,
    sessionDetailsRoute,
    settingsRoute,
    editorRoute,
    privacyPolicyRoute,
    cookiesPolicyRoute,
    termsRoute
])
