import { createRoute } from "@tanstack/react-router";
import Terms from "../pages/TermsOfService.tsx";
import { rootRoute } from "./__root.js";

// @ts-ignore
export const termsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/terms", // custom URL
  component: Terms,
});