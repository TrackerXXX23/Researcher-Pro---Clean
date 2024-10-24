import { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'openai';
import { rateLimit } from 'express-rate-limit';
import NodeCache from 'node-cache';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const cache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Function definitions for OpenAI
const functionDefinitions = [
  {
    name: 'analyze_research_data',
    description: 'Analyze research data and provide insights, recommendations, and risks',
    parameters: {
      type: 'object',
      properties: {
        insights: {
          type: 'array',
          items: { type: 'string' },
          description: 'Key insights derived from the research data'
        },
        recommendations: {
          type: 'array',
          items: { type: 'string' },
          description: 'Strategic recommendations based on the analysis'
        },
        risks: {
          type: 'array',
          items: { type: 'string' },
          description: 'Potential risks and challenges identified'
        },
        confidence: {
          type: 'number',
          description: 'Confidence score of the analysis (0-1)'
        }
      },
      required: ['insights', 'recommendations', 'risks', 'confidence']
    }
  },
  {
    name: 'aggregate_analyses',
    description: 'Aggregate multiple analyses into a summary with key findings',
    parameters: {
      type: 'object',
      properties: {
        summary: {
          type: 'string',
          description: 'Overall summary of the analyses'
        },
        topInsights: {
          type: 'array',
          items: { type: 'string' },
          description: 'Top insights across all analyses'
        },
        keyRecommendations: {
          type: 'array',
          items: { type: 'string' },
          description: 'Key recommendations across all analyses'
        },
        criticalRisks: {
          type: 'array',
          items: { type: 'string' },
          description: 'Critical risks identified across all analyses'
        }
      },
      required: ['summary', 'topInsights', 'keyRecommendations', 'criticalRisks']
    }
  }
];

type Message = {
  role: 'system' | 'user' | 'assistant';
  content: string;
} | {
  role: 'function';
  name: string;
  content: string;
};

interface RequestBody {
  messages: Message[];
  function_call?: {
    name: string;
  };
}

// Helper function to generate cache key
function generateCacheKey(messages: Message[], functionName?: string): string {
  const key = JSON.stringify({ messages, functionName });
  return Buffer.from(key).toString('base64');
}

// Validate request body
function validateRequest(body: any): body is RequestBody {
  if (!body || !Array.isArray(body.messages) || body.messages.length === 0) {
    return false;
  }

  return body.messages.every((msg: any) => {
    if (!msg || typeof msg.role !== 'string' || typeof msg.content !== 'string') {
      return false;
    }
    if (msg.role === 'function' && typeof msg.name !== 'string') {
      return false;
    }
    return ['system', 'user', 'assistant', 'function'].includes(msg.role);
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Apply rate limiting
    await new Promise((resolve, reject) => {
      limiter(req as any, res as any, (result: any) =>
        result instanceof Error ? reject(result) : resolve(result)
      );
    });

    // Validate request
    if (!validateRequest(req.body)) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const { messages, function_call } = req.body;

    // Check cache
    const cacheKey = generateCacheKey(messages, function_call?.name);
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
      return res.status(200).json(cachedResult);
    }

    // Make API call
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages.map(msg => ({
        ...msg,
        ...(msg.role === 'function' ? { name: msg.name } : {})
      })),
      functions: functionDefinitions,
      function_call: function_call || 'auto',
      temperature: 0.7,
      max_tokens: 2000
    });

    // Cache successful response
    cache.set(cacheKey, completion);

    res.status(200).json(completion);
  } catch (error: any) {
    console.error('OpenAI API error:', error);

    // Handle rate limiting errors
    if (error.status === 429) {
      return res.status(429).json({
        error: 'Rate limit exceeded. Please try again later.',
        retryAfter: error.response?.headers?.['retry-after'] || 60
      });
    }

    // Handle other errors
    const statusCode = error.status || 500;
    const message = error.message || 'Error processing your request';
    res.status(statusCode).json({ error: message });
  }
}
