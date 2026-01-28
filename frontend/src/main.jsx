
import { createRoot } from 'react-dom/client'
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routes/routeTree.js'
import { ThemeProvider } from './components/utils/theme-provider.jsx'
import { Provider } from 'react-redux'
import { store } from './store/store.js'
import { SocketProvider } from './context/SocketContext.js'
import ScrollToTop from "./components/ui/ScrollToTop"

export const queryClient = new QueryClient()
const router = createRouter({
  routeTree,
  context:{
    queryClient,
    store
  }
})


createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <SocketProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </ThemeProvider>
    </SocketProvider>
    <ScrollToTop />
  </Provider>
)
