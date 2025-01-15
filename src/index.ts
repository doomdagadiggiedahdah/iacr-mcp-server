#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
  CallToolRequest,
  ListToolsRequest
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import { z } from 'zod';

const IACR_RSS_URL = 'https://eprint.iacr.org/rss/rss.xml?order=recent';

// Zod schemas for input validation
const SearchPapersSchema = z.object({
  query: z.string(),
  year: z.number().optional(),
  category: z.string().optional(),
  max_results: z.number().optional().default(20)
});

const GetPaperDetailsSchema = z.object({
  paper_id: z.string()
});

const DownloadPaperSchema = z.object({
  paper_id: z.string(),
  format: z.enum(['pdf', 'txt']).optional().default('pdf')
});

interface IACRPaper {
  id: string;
  title: string;
  authors: string;
  link: string;
  description: string;
  pubDate: string;
}

class IACRServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'iacr-mcp-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async (_request: ListToolsRequest) => ({
      tools: [
        {
          name: 'search_papers',
          description: 'Search for papers in the IACR Cryptology ePrint Archive',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string' },
              year: { type: 'number' },
              category: { type: 'string' },
              max_results: { type: 'number', default: 20 }
            },
            required: ['query']
          }
        },
        {
          name: 'get_paper_details',
          description: 'Retrieve details of a specific paper by its ID',
          inputSchema: {
            type: 'object',
            properties: {
              paper_id: { type: 'string' }
            },
            required: ['paper_id']
          }
        },
        {
          name: 'download_paper',
          description: 'Download a paper in PDF or TXT format',
          inputSchema: {
            type: 'object',
            properties: {
              paper_id: { type: 'string' },
              format: { 
                type: 'string', 
                enum: ['pdf', 'txt'], 
                default: 'pdf' 
              }
            },
            required: ['paper_id']
          }
        }
      ]
    }));

    // Tool call handler
    this.server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
      switch (request.params.name) {
        case 'search_papers':
          return this.searchPapers(request.params.arguments);
        case 'get_paper_details':
          return this.getPaperDetails(request.params.arguments);
        case 'download_paper':
          return this.downloadPaper(request.params.arguments);
        default:
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${request.params.name}`
          );
      }
    });
  }

  private async searchPapers(args: unknown) {
    const validatedArgs = SearchPapersSchema.parse(args);
    
    try {
      // Fetch RSS feed with comprehensive headers
      const response = await axios.get(IACR_RSS_URL, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'application/xml,text/xml,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9'
        },
        timeout: 15000
      });

      // Parse XML feed
      const parsedFeed = await parseStringPromise(response.data);
      
      // Ensure items exist
      if (!parsedFeed.rss?.channel?.[0]?.item) {
        console.error('No items found in RSS feed');
        return { content: [{ type: 'text', text: '[]' }] };
      }

      // Current year for filtering
      const currentYear = new Date().getFullYear();

      // Extract and filter papers
      const papers = parsedFeed.rss.channel[0].item
        .map((item: any) => ({
          id: item.link[0].split('/').pop(),
          title: item.title[0],
          authors: item['dc:creator'] ? item['dc:creator'][0] : 'Unknown',
          link: item.link[0],
          description: item.description[0],
          pubDate: item.pubDate[0]
        }))
        .filter((paper: IACRPaper) => {
          const title = paper.title.toLowerCase();
          const description = paper.description.toLowerCase();
          const query = validatedArgs.query.toLowerCase();
          
          // Query matching
          const matchesQuery = title.includes(query) || description.includes(query);
          
          // Year filtering
          const paperYear = new Date(paper.pubDate).getFullYear();
          const matchesYear = !validatedArgs.year || 
            (validatedArgs.year && paperYear === validatedArgs.year) ||
            (paperYear >= currentYear - 10);
          
          return matchesQuery && matchesYear;
        })
        .slice(0, validatedArgs.max_results)
        .map((paper: IACRPaper) => ({
          id: paper.id,
          title: paper.title,
          authors: paper.authors,
          year: new Date(paper.pubDate).getFullYear(),
          link: paper.link,
          abstract: paper.description
        }));

      // Log results for debugging
      console.error('Search Results:', JSON.stringify(papers, null, 2));

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(papers, null, 2)
        }]
      };
    } catch (error) {
      // Comprehensive error logging
      console.error('Search Error:', error);

      throw new McpError(
        ErrorCode.InternalError,
        `Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private async getPaperDetails(args: unknown) {
    const validatedArgs = GetPaperDetailsSchema.parse(args);
    
    try {
      // Fetch RSS feed to get paper details
      const response = await axios.get(IACR_RSS_URL);
      const parsedFeed = await parseStringPromise(response.data);
      
      const paperItem = parsedFeed.rss.channel[0].item.find((item: any) => 
        item.link[0].split('/').pop() === validatedArgs.paper_id
      );

      if (!paperItem) {
        throw new Error('Paper not found');
      }

      const paperDetails = {
        id: validatedArgs.paper_id,
        title: paperItem.title[0],
        authors: paperItem['dc:creator'] ? paperItem['dc:creator'][0] : 'Unknown',
        abstract: paperItem.description[0],
        link: paperItem.link[0],
        date: paperItem.pubDate[0]
      };

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(paperDetails, null, 2)
        }]
      };
    } catch (error) {
      console.error('Paper Details Error:', error);
      throw new McpError(
        ErrorCode.InternalError,
        `Paper details retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private async downloadPaper(args: unknown) {
    const validatedArgs = DownloadPaperSchema.parse(args);
    
    try {
      const response = await axios.get(`https://eprint.iacr.org/${validatedArgs.paper_id}.${validatedArgs.format}`, {
        responseType: 'arraybuffer'
      });

      return {
        content: [{
          type: 'file',
          name: `${validatedArgs.paper_id}.${validatedArgs.format}`,
          data: response.data.toString('base64')
        }]
      };
    } catch (error) {
      console.error('Paper Download Error:', error);
      throw new McpError(
        ErrorCode.InternalError,
        `Paper download failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('IACR MCP server running on stdio');
  }
}

const server = new IACRServer();
server.run().catch(console.error);
