# kips

Personal data management for the HDC. Integrates with Claude Desktop and other MCP clients.

## Usage

Just run it normally to init the database:

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

Integrate it into Claude to let Claude query the database:

```bash
npx kips config
```

## Development

You'll want the Claude integration to use your local script.

```bash
## get it installed and built
npm run build
## now configure it to use the local build
node ./build/index.js config --debug
```
