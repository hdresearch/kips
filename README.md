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

### Expected formats

The csv imports expect specific headers in order to be useful.

#### Auth

We expect a .csv file with `url`, `username` **or** `email` (both can exist, but email takes precedence), `password` and `notes` columns. All other columns are ignored.

#### Tasks

We expect a .csv file with `objective`, `progressAssessment` and `completed` columns. `completed` is a boolean.

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
