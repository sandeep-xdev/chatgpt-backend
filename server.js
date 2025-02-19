require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
});

const summarizeMessages = async (messages) => {
      const summaryPrompt = [
        { role: 'system', content: 'Summarize the following conversation for future context:' },
        ...messages,
      ];
    
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: summaryPrompt,
      });
    
      return response.choices[0].message.content;
};

app.post('/chat', async (req, res) => {
      let { messages } = req.body;
      const MAX_MESSAGES = 10;
    
      if (messages.length > MAX_MESSAGES) {
        console.log(messages.slice(0, -MAX_MESSAGES));
        const summary = await summarizeMessages(messages.slice(0, -MAX_MESSAGES));
        console.log(summary);
        messages = [
          { role: 'system', content: `Summary of previous conversation: ${summary}` },
          ...messages.slice(-MAX_MESSAGES),
        ];
      }
    
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
      });
      const assistantMessage = { role: 'assistant', content: response.choices[0].message.content };
      res.json({ reply: assistantMessage.content });
});

app.listen(5000, () => console.log('Server running on http://localhost:5000'));
