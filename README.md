# kips

Personal data management server. Integrates with Claude Desktop and other MCP clients.

## Usage

kips drives a SQLite database and surfaces tools for LLMs as well as a basic CLI for interacting with the database.

You can store `auth` (passwords and usernames), `note`s, `conversation`s, `task`s (leftover work to do from last time) and of course `tag`s. 

Notes, conversations and tasks have join tables with tags under `noteTag`, `conversationTag` and `taskTag`.

Just run it normally first to init the database:

```bash
npx kips
```

Then ingest data:

```bash
## passwords in csv files
npx kips import --type auth ~/passwords.csv
## notes and tags
npx kips import --type note ~/note.txt --tag "big-deal another-tag"
## conversations in the past
npx kips import --type conversation ~/claudechat.txt --tag "therapy"
## agentic tasks that aren't done yet
npx kips import --type task ~/tasks.csv --tag "therapy revenge"
```

Integrate it into Claude Desktop to let Claude query, insert or update the database by running the `config` command:

```bash
npx kips config
```

You'll then be able to see the MCP server in Claude Desktop (usually after restart) with the hammer icon, and all applicable tables as resources you can "connect" with the plug icon.

### Expected formats

The csv imports expect specific headers in order to be useful.

#### Auth

We expect a .csv file with `url`, `username` **or** `email` (both can exist, but email takes precedence), `password` and `notes` columns. All other columns are ignored.

#### Tasks

We expect a .csv file with `objective`, `progressAssessment` and `completed` columns. `completed` is a boolean.

### Usage with Claude Desktop

All operations are specified for MCP clients and all schemas are exposed as attachable resources. If you have more complex files (screenshots, PDFs) you can get Claude to read and transcribe it direct to the database. At present, you'll need to attach all schemas you intend to use or Claude will have to look up the schema again before applying an operation.

## Development

You'll want the Claude integration to use your local script.

```bash
## get it installed and built
npm run build
## now configure it to use the local build
node ./build/index.js config --debug
```

Likewise, when developing you can either `npm link` to use your local install as an npx package or just call the script direct:

```bash
## eg, using the prior example
node ./build/index.js import --type task ~/tasks.csv --tag "therapy revenge"
```
