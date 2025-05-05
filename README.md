[![MseeP.ai Security Assessment Badge](https://mseep.net/pr/doomdagadiggiedahdah-iacr-mcp-server-badge.png)](https://mseep.ai/app/doomdagadiggiedahdah-iacr-mcp-server)

# IACR Cryptology ePrint Archive MCP Server

[![smithery badge](https://smithery.ai/badge/iacr-mcp-server)](https://smithery.ai/server/iacr-mcp-server)

## Overview

This Model Context Protocol (MCP) server provides a programmatic interface to the IACR Cryptology ePrint Archive, enabling efficient retrieval of cryptographic research papers.

<a href="https://glama.ai/mcp/servers/e2oh3a96de"><img width="380" height="200" src="https://glama.ai/mcp/servers/e2oh3a96de/badge" alt="IACR Server MCP server" /></a>

## Features

- 🔍 Search cryptographic papers
- 📋 Retrieve paper metadata
- 🔒 Secure access to research publications

## Prerequisites

- Node.js (v16+)
- npm or yarn

## Installation

### Installing via Smithery

To install IACR Cryptology ePrint Archive for Claude Desktop automatically via [Smithery](https://smithery.ai/server/iacr-mcp-server):

```bash
npx -y @smithery/cli install iacr-mcp-server --client claude
```

### Manual Installation
```bash
git clone https://github.com/yourusername/iacr-mcp-server.git
cd iacr-mcp-server
npm install
```

## Configuration

No additional configuration is required. The server uses the IACR ePrint Archive's RSS feed for data retrieval.

## Usage

### Available Tools

1. `search_papers`: Search for papers
   - Parameters:
     - `query`: Search term (required)
     - `year`: Publication year (optional)
     - `max_results`: Maximum number of results (default: 20)

2. `get_paper_details`: Retrieve details for a specific paper
   - Parameters:
     - `paper_id`: Unique paper identifier (required)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Disclaimer

This is an unofficial tool. Always refer to the original IACR Cryptology ePrint Archive for the most accurate and up-to-date research publications.

## Contact

For issues, questions, or suggestions, please open a GitHub issue.
