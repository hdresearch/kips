import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, ListResourcesRequestSchema } from "@modelcontextprotocol/sdk/types.js";

class KipsServer {
    private server: Server;
  
    constructor() {
      this.server = new Server(
        {
          name: 'kips',
          version: '0.1.0',
        },
        { capabilities: { resources: {}, tools: {} } },
      );
  
      this.setupErrorHandling();
      this.setupHandlers();
    }
  
    private setupErrorHandling(): void {
      this.server.onerror = (error) => {
        console.error('[MCP Error]', error);
      };
  
      process.on('SIGINT', async () => {
        await this.server.close();
        process.exit(0);
      });
    }
  
    private setupHandlers(): void {
      this.server.setRequestHandler(ListResourcesRequestSchema, async (request) => {
        // get schema table from sqlite as rows?

        // const client = await pool.connect();
        // try {
        //   const result = await client.query(
        //     "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'",
        //   );
        //   return {
        //     resources: result.rows.map((row) => ({
        //       uri: new URL(`${row.table_name}/${SCHEMA_PATH}`, resourceBaseUrl).href,
        //       mimeType: "application/json",
        //       name: `"${row.table_name}" database schema`,
        //     })),
        //   };
        // } finally {
        //   client.release();
        // }
        return { resources: [] };
      });

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
              },
            },
          ],
        };
      });
      
      this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
        if (request.params.name === "query") {
          const sql = request.params.arguments?.sql as string;
      
        //   const client = await pool.connect();
        //   try {
        //     await client.query("BEGIN TRANSACTION READ ONLY");
        //     const result = await client.query(sql);
        //     return {
        //       content: [{ type: "text", text: JSON.stringify(result.rows, null, 2) }],
        //       isError: false,
        //     };
        //   } catch (error) {
        //     throw error;
        //   } finally {
        //     client
        //       .query("ROLLBACK")
        //       .catch((error: any) =>
        //         console.warn("Could not roll back transaction:", error),
        //       );
      
        //     client.release();
        //   }
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
  
  main().catch((error) => {
    console.error('Server error:', error);
    process.exit(1);
  });