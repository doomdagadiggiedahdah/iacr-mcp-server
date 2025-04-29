//evals.ts

import { EvalConfig } from 'mcp-evals';
import { openai } from "@ai-sdk/openai";
import { grade, EvalFunction } from "mcp-evals";

const iacrMcpServerEval: EvalFunction = {
    name: 'iacr-mcp-server Evaluation',
    description: 'Evaluates the iacr-mcp-server tool functionality for searching, retrieving, and downloading cryptography papers from the IACR ePrint Archive',
    run: async () => {
        const result = await grade(openai("gpt-4"), "Search for cryptography papers mentioning 'zero knowledge' in the IACR ePrint Archive. Include title, authors, link, and publication year for relevant papers. Then retrieve details for the first result and download it in PDF format. Output everything as JSON.");
        return JSON.parse(result);
    }
};

const config: EvalConfig = {
    model: openai("gpt-4"),
    evals: [iacrMcpServerEval ]
};
  
export default config;
  
export const evals = [iacrMcpServerEval];