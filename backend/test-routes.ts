import app from "../src/app";
import { logger } from "../src/lib/logger";

function printRoutes(routes: any[], prefix = "") {
  routes.forEach((route) => {
    if (route.route) {
      const methods = Object.keys(route.route.methods).join(",").toUpperCase();
      console.log(`${methods} ${prefix}${route.route.path}`);
    } else if (route.name === "router" && route.handle.stack) {
      const newPrefix = prefix + (route.regexp.source.replace("^\\/", "").replace("\\/?(?=\\/|$)", "")).replace(/\\\//g, "/");
      printRoutes(route.handle.stack, newPrefix + "/");
    }
  });
}

console.log("Registered Routes:");
printRoutes(app._router.stack);
process.exit();
