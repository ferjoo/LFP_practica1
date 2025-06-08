import express, { Request, Response } from 'express';
import cors from 'cors';
import { lexer } from './lexer.js';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.post('/api/analyze', (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Invalid input: code is required and must be a string' });
    }
    
    // Normalize the input by replacing escaped newlines with actual newlines
    const normalizedCode = code.replace(/\\n/g, '\n');
    
    const result = lexer(normalizedCode);
    res.json(result);
  } catch (error) {
    console.error('Error analyzing code:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 