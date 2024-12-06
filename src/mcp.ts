import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, ListResourcesRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { Command } from "commander";
import { getDb } from "./lib/index.js";
import { Database } from "better-sqlite3";

class KipsServer {
    private server: Server;
    private db: Database;
  
    constructor() {
      this.server = new Server(
        {
          name: 'kips',
          version: '0.1.0',
        },
        { capabilities: { resources: {}, tools: {} } },
      );

      this.db = getDb();
  
      this.setupErrorHandling();
      this.setupHandlers();
    }

    private mapSqliteTypeToJsonSchema(sqliteType: string): string {
      const typeMap: {[key: string]: string} = {
        'INTEGER': 'integer',
        'REAL': 'number',
        'TEXT': 'string',
        'BLOB': 'string',
        'BOOLEAN': 'boolean'
      };
    
      const baseType = sqliteType.toUpperCase().split('(')[0];
      return typeMap[baseType] || 'string';
    }
  
    private setupErrorHandling(): void {
      this.server.onerror = (error) => {
        console.error('[MCP Error]', error);
      };
  
      process.on('SIGINT', async () => {
        this.db.close();
        await this.server.close();
        process.exit(0);
      });
    }
  
    private setupHandlers(): void {
      this.server.setRequestHandler(ListResourcesRequestSchema, async (request) => {
        const tables = this.db.prepare(`
          SELECT name FROM sqlite_master 
          WHERE type='table' 
          AND name NOT LIKE 'sqlite_%'
        `).all() as Array<{ name: string }>;
    
        const resources = tables.map(table => {
          const columns = this.db.prepare(`PRAGMA table_info("${table.name}")`).all();
          const schema = {
            type: "object",
            properties: columns.reduce((acc: any, col: any) => {
              acc[col.name] = {
                type: this.mapSqliteTypeToJsonSchema(col.type),
                nullable: !col.notnull
              };
              return acc;
            }, {})
          };
          console.error(schema)
    
          return {
            uri: `sqlite:///${table.name}`,
            mimeType: "application/json",
            name: `${table.name} table schema`,
            schema
          };
        });
    
        return { resources };
      })

      this.server.setRequestHandler(ListToolsRequestSchema, async () => {
        return {
          tools: [
            {
              name: "query",
              description: "Run a read-only SQL query",
              inputSchema: {
                type: "object",
                properties: {
                  sql: { type: "string" },
                },
                required: ["sql"]
              },
            },
          ],
        };
      });
      
      this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
        if (request.params.name === "query") {
          const sql = request.params.arguments?.sql as string;

          if (!sql.trim().toLowerCase().startsWith('select')) {
            throw new Error('Only SELECT queries are allowed');
          }

          try {
            const stmt = this.db.prepare(sql);
            const rows = stmt.all();
            return {
              content: [{
                type: "text",
                text: JSON.stringify(rows, null, 2),
              }],
              isError: false
            };
          } catch (error: any) {
            return {
              content: [{
                type: "text",
                text: error.message,
              }],
              isError: true
            }
          }

        }
        throw new Error(`Unknown tool: ${request.params.name}`);
      });
    }

    
  
    async run(): Promise<void> {
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
  
      console.error('MCP server running on stdio');
    }
  }

  async function main() {
    const server = new KipsServer();
    await server.run();
  }

  export function createServer() {
    return new Command("serve")
      .action(() => {
        main().catch((error) => {
          console.error('Server error:', error);
          process.exit(1);
        });
      });
  }