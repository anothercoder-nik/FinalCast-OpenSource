import { createRoute } from "@tanstack/react-router";
import PrivacyPolicy from "../pages/PrivacyPolicy.jsx";
import { rootRoute } from "./__root.js";

// @ts-ignore
export const privacyPolicyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/privacy-policy", // custom URL
  component: PrivacyPolicy,
});