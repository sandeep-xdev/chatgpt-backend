require('dotenv').config();
const express = require('express');
const cors = require('cors');
// const { OpenAIApi, Configuration } = require('openai');
const { OpenAI } = require('openai');

const app = express();
app.use(cors());
app.use(express.json());

// const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }));
const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    app.post('/chat', async (req, res) => {
      const { messages } = req.body;
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo', // or gpt-4
          messages: messages,
        });
        res.json({ reply: response.choices[0].message.content });
      } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
      }
    });
    

app.listen(5000, () => console.log('Server running on http://localhost:5000'));
