import { createRoute } from "@tanstack/react-router";
import CookiesPolicy from "../pages/CookiesPolicy.jsx";
import { rootRoute } from "./__root.js";

// @ts-ignore
export const cookiesPolicyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cookies-policy", // custom URL
  component: CookiesPolicy,
});
