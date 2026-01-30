import { createRoute } from "@tanstack/react-router"
import { rootRoute } from "./__root.js"
import { checkAuth } from "../utils/helper.js"
import StudioRoomComplete from "../components/Main/StudioRoomComplete.jsx"

export const studioRoomRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/studio/$roomId',
    component: StudioRoomComplete,
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
