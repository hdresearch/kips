#! /usr/bin/env node
import { Command } from "commander";
import { join } from "path";
import os from "os";
import { existsSync, mkdirSync } from "fs";
import { getDb } from "./lib/index.js";
import { createImportCommand } from "./commands/import.js";
import { createServer } from "./mcp.js";
import { getConfigCommand } from "./commands/config.js";

// db init
const dbPath = join(os.homedir(), '.config', 'kips');
if (!existsSync(dbPath)) {
    mkdirSync(dbPath, { recursive: true });
}

// inits the db
const db = getDb();
db.close();

// cli init
const program = new Command();
program.name("kips").version("0.0.1").description("Personal data storage for models and the HDR platform.");
program.addCommand(createImportCommand());
program.addCommand(createServer());
program.addCommand(getConfigCommand());
program.parse(process.argv);