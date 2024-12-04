import { Command, Option } from "commander";
import { getDb, submitTags } from "../lib/index.js";
import fs from "fs";
import {
  AuthInsert,
  ConversationTagInsert,
  Note,
  NoteInsert,
  NoteTagInsert,
  TaskInsert,
  TaskTagInsert,
} from "../types/index.js";
import { Database } from "better-sqlite3";
import Papa from "papaparse";

export function createImportCommand() {
  return new Command("import")
    .argument("<file>", "The file to import")
    .addOption(
      new Option("-t, --type <type>", "The type of data to import")
        .choices(["conversation", "note", "auth"])
        .makeOptionMandatory(true),
    )
    .addOption(
      new Option(
        "--tag <tag>",
        "Tags to associate with the data, separated by spaces",
      ),
    )
    .action((file, args) => {
      console.log(`${JSON.stringify(args)} and ${file}`);
      const db = getDb();
      const data = fs.readFileSync(file, "utf-8");
      switch (args?.type) {
        case "note":
          noteInsert(db, data, args.tag.split(" "));
          break;
        case "conversation":
          conversationInsert(db, data, args.tag.split(" "));
          break;
        case "auth":
          authInsert(db, data);
          break;
        case "task":
          taskInsert(db, data, args.tag.split(" "));
          break;
        default:
          break;
      }
      db.close();
    });
}

function noteInsert(db: Database, data: string, tags: string[]) {
  const insertNote = db.prepare<NoteInsert>(
    `INSERT INTO notes (content) VALUES (@content)`,
  );
  insertNote.run({ content: data });
  const noteResult = db
    .prepare<Partial<Note>>(`SELECT id FROM notes WHERE content = @content`)
    .get({ content: data });
  const noteId = (noteResult as { id: number }).id;
  const tagIds = submitTags(db, tags);
  for (const tagId of tagIds) {
    const insertTagNote = db.prepare<NoteTagInsert>(
      `INSERT INTO noteTag (tagId, noteId) VALUES (@tagId, @noteId)`,
    );
    insertTagNote.run({ tagId, noteId });
  }
}

function conversationInsert(db: Database, data: string, tags: string[]) {
  const insertConversation = db.prepare(
    `INSERT INTO conversations (content) VALUES (@content)`,
  );
  insertConversation.run({ content: data });
  const conversationResult = db
    .prepare(`SELECT id FROM conversations WHERE content = @content`)
    .get({ content: data });
  const conversationId = (conversationResult as { id: number }).id;
  const tagIds = submitTags(db, tags);
  for (const tagId of tagIds) {
    const insertTagConversation = db.prepare<ConversationTagInsert>(
      `INSERT INTO conversationTag (tagId, conversationId) VALUES (@tagId, @conversationId)`,
    );
    insertTagConversation.run({ tagId, conversationId });
  }
}

function authInsert(db: Database, file: string) {
  const parseResult = Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.toLowerCase().trim(),
  });
  if (parseResult.errors.length > 0) {
    console.error(parseResult.errors);
    return;
  }
  const rows = parseResult.data.map((row: any) => {
    const normalizedRow: Partial<AuthInsert> = {};

    Object.entries(row).forEach(([key, value]) => {
      const normalizedKey = key.toLowerCase().trim();

      if (
        normalizedKey === "username" ||
        normalizedKey === "password" ||
        normalizedKey === "url" ||
        normalizedKey === "notes"
      ) {
        normalizedRow[normalizedKey as keyof AuthInsert] =
          typeof value === "string"
            ? value.trim()
            : (value as string | undefined);
      }
    });
    return normalizedRow;
  });
  rows.forEach((row) => {
    const insertAuth = db.prepare<AuthInsert>(
      `INSERT INTO auth (username, password, url, notes) VALUES (@username, @password, @url, @notes)`,
    );
    insertAuth.run({
      username: row?.username || "",
      password: row?.password || "",
      url: row?.url || "",
      notes: row?.notes || "",
    });
  });
}

function taskInsert(db: Database, file: string, tags: string[]) {
  const parseResult = Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.toLowerCase().trim(),
  });
  if (parseResult.errors.length > 0) {
    console.error(parseResult.errors);
    return;
  }
  const tagIds = submitTags(db, tags);
  const rows = parseResult.data.map((row: any) => {
    const normalizedRow: Partial<TaskInsert> = {};

    Object.entries(row).forEach(([key, value]) => {
      const normalizedKey = key.trim();

      if (
        normalizedKey === "objective" ||
        normalizedKey === "progressAssessment" ||
        normalizedKey === "completed"
      ) {
        if (normalizedKey === "completed") {
          normalizedRow["completed"] = value === "true";
        } else if (
          normalizedKey === "objective" ||
          normalizedKey === "progressAssessment"
        ) {
          normalizedRow[normalizedKey] =
            typeof value === "string" ? value.trim() : "";
        }
      }
    });
    return normalizedRow;
  });
  rows.forEach((row) => {
    const insertTask = db.prepare<TaskInsert>(
      `INSERT INTO task (objective, progressAssessment, completed) VALUES (@objective, @progressAssessment, @completed)`,
    );
    insertTask.run({
      objective: row?.objective || "",
      progressAssessment: row?.progressAssessment || "",
      completed: row?.completed || false,
    });
    const taskResult = db
      .prepare(
        `SELECT id FROM task WHERE objective = @objective AND progressAssessment = @progressAssessment AND completed = @completed`,
      )
      .get({
        objective: row?.objective || "",
        progressAssessment: row?.progressAssessment || "",
        completed: row?.completed || false,
      });
    const taskId = (taskResult as { id: number }).id;
    for (const tagId of tagIds) {
      const insertTagTask = db.prepare<TaskTagInsert>(
        `INSERT INTO taskTag (tagId, taskId) VALUES (@tagId, @taskId)`,
      );
      insertTagTask.run({ tagId, taskId });
    }
  });
}
