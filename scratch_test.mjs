import { getCurrentUser, loginWithEmail, switchDemoRole } from "./src/lib/auth.ts";
import { getDashboardData } from "./src/actions/dashboard-actions.ts";
import { getProjects } from "./src/actions/project-actions.ts";

async function run() {
  console.log("Testing auth...");
  const user = await getCurrentUser();
  console.log("User:", user.name);

  console.log("Testing dashboard data...");
  const data = await getDashboardData();
  console.log("Dashboard data metrics:", Object.keys(data.metrics));

  console.log("Testing projects...");
  const projects = await getProjects();
  console.log("Projects count:", projects.length);

  console.log("ALL TESTS PASSED!");
}

run().catch(console.error);
