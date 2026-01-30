import { createRoute } from "@tanstack/react-router"
import { rootRoute } from "./__root.js"
import { checkAuth } from "../utils/helper.js"
import SessionDetails from "../components/studio/SessionDetails.jsx"

export const sessionDetailsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/session-details/$roomId',
    component: SessionDetails,
    beforeLoad: checkAuth,
    
    validateSearch: (search) => search,
    loader: ({ params }) => {
        // Optional: validate roomId format here
        if (!params.roomId || params.roomId.trim().length === 0) {
            throw new Error('Invalid room ID');
        }
        return { roomId: params.roomId };
    }
})