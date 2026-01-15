import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root.js' // Updated import
import EditorPage from '../components/editor/EditorPage.jsx'

export const editorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'editor/$sessionId',
  component: EditorPage,
})
