import { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { messages, functions, function_call } = req.body;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages,
        functions,
        function_call,
      });

      res.status(200).json(completion);
    } catch (error) {
      console.error('OpenAI API error:', error);
      res.status(500).json({ error: 'Error processing your request' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
