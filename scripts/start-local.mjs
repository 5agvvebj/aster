import "dotenv/config";
import { existsSync } from "node:fs";
import { spawn, spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const databaseUrl = process.env.DATABASE_URL;

function spawnCommand(command, args, options = {}) {
  if (process.platform === "win32" && command === "npm") {
    const commandLine = ["npm", ...args].join(" ");
    return spawn(process.env.ComSpec || "cmd.exe", ["/d", "/s", "/c", commandLine], {
      ...options,
      shell: false,
    });
  }
  return spawn(command, args, { ...options, shell: false });
}

function run(command, args, options = {}) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawnCommand(command, args, {
      cwd: root,
      stdio: "inherit",
      ...options,
    });
    child.once("error", rejectPromise);
    child.once("exit", (code, signal) => {
      if (signal) {
        rejectPromise(new Error(`${command} exited after signal ${signal}.`));
      } else if (code !== 0) {
        rejectPromise(new Error(`${command} exited with code ${code ?? "unknown"}.`));
      } else {
        resolvePromise();
      }
    });
  });
}

function localPostgresConfig() {
  const binDir = process.env.LOCAL_POSTGRES_BIN;
  const dataDir = process.env.LOCAL_POSTGRES_DATA;
  if (!binDir && !dataDir) return null;
  if (!binDir || !dataDir) {
    throw new Error("Set both LOCAL_POSTGRES_BIN and LOCAL_POSTGRES_DATA, or leave both empty.");
  }
  const pgCtl = join(binDir, process.platform === "win32" ? "pg_ctl.exe" : "pg_ctl");
  if (!existsSync(pgCtl)) throw new Error(`Could not find PostgreSQL control binary: ${pgCtl}`);
  if (!existsSync(join(dataDir, "postgresql.conf"))) {
    throw new Error(`No PostgreSQL cluster found in LOCAL_POSTGRES_DATA: ${dataDir}`);
  }
  return { pgCtl, dataDir };
}

async function ensureLocalPostgres() {
  const config = localPostgresConfig();
  if (!config) return;

  const status = spawnSync(config.pgCtl, ["-D", config.dataDir, "status"], {
    cwd: root,
    stdio: "ignore",
    shell: false,
  });
  if (status.status === 0) {
    console.log("Using the configured local PostgreSQL cluster.");
    return;
  }
  if (status.error) throw status.error;

  if (!databaseUrl) throw new Error("DATABASE_URL is required when starting local PostgreSQL.");
  const port = new URL(databaseUrl).port || "5432";
  const logFile = join(config.dataDir, "postgres.log");
  console.log(`Starting local PostgreSQL on port ${port}...`);
  await run(config.pgCtl, [
    "-D", config.dataDir,
    "-l", logFile,
    "-o", `-p ${port} -c listen_addresses=localhost`,
    "start",
  ], { shell: false });
}

async function verifyDatabase() {
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is missing. Set it in .env to point at your local PostgreSQL database.");
  }
  const client = postgres(databaseUrl, { max: 1, connect_timeout: 5 });
  try {
    await client`select 1`;
  } catch (error) {
    throw new Error(
      "Could not connect to DATABASE_URL. Start local PostgreSQL and confirm the database, port, user, and password in .env.",
      { cause: error },
    );
  } finally {
    await client.end();
  }
}

async function main() {
  if (!existsSync(join(root, ".env"))) {
    throw new Error("Missing .env. Copy .env.example to .env and configure your local PostgreSQL connection.");
  }

  try {
    await ensureLocalPostgres();
    await verifyDatabase();
    console.log("Applying database migrations...");
    await run("npm", ["run", "db:migrate"]);
    console.log("Seeding curated demo evidence...");
    await run("npm", ["run", "db:seed"]);
    console.log("Starting Aster at http://localhost:3000");

    const app = spawnCommand("npm", ["run", "dev"], {
      cwd: root,
      stdio: "inherit",
    });

    app.once("error", (error) => {
      console.error(`Could not start the Next.js development server: ${error.message}`);
      process.exitCode = 1;
    });
    app.once("exit", (code, signal) => {
      process.exitCode = signal ? 130 : (code ?? 1);
    });
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Local startup failed.");
    process.exitCode = 1;
  }
}

await main();
