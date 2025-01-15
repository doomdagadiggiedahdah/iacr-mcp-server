# IACR Cryptology ePrint Archive MCP Server

## Overview

This Model Context Protocol (MCP) server provides a programmatic interface to the IACR Cryptology ePrint Archive, enabling efficient retrieval of cryptographic research papers.

## Features

- 🔍 Search cryptographic papers
- 📋 Retrieve paper metadata
- 🔒 Secure access to research publications

## Prerequisites

- Node.js (v16+)
- npm or yarn

## Installation

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
