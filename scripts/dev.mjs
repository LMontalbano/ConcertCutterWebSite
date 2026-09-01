import { spawn } from "node:child_process";

const build = spawn("npm", ["run", "build"], { shell: true, stdio: "inherit" });
build.on("exit", (code) => {
  if (code) process.exit(code);
  const server = spawn("node", ["scripts/serve.mjs"], { stdio: "inherit" });
  process.on("SIGINT", () => server.kill("SIGINT"));
});
