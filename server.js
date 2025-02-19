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

const summarizeChunk = async (chunk) => {
  console.log("============= summarizeChunk ===============");
  console.log("");
  console.log(chunk);
  console.log("");
  console.log("============================================");

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: `Summarize the ENTIRE conversation, covering all topics equally, including questions asked by the user and all assistant responses. Highlight different topics, opinions, and factual explanations without omitting earlier parts of the discussion.`  },
        ...chunk,
      ],
    });

    console.log("============= summarizeChunk ===============");
    console.log("");
    console.log(response.choices[0].message.content);
    console.log("");
    console.log("============================================");
  
    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error summarizing chunk:', error);
    return '';
  }
};

const progressiveSummarization = async (messages) => {

  console.log("======== progressiveSummarization =========");
  console.log("");
  console.log(messages);
  console.log("");
  console.log("============================================");

  const chunkSize = 20;
  const summaries = [];

  for (let i = 0; i < messages.length; i += chunkSize) {
    const chunk = messages.slice(i, i + chunkSize);
    const summary = await summarizeChunk(chunk);
    summaries.push(summary);
  }

  console.log("======== progressiveSummarization =========");
  console.log("");
  console.log(summaries);
  console.log("");
  console.log("============================================");

const finalResponse = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: 'Combine the following summaries into a coherent, detailed summary.' },
      ...summaries.map((s) => ({ role: 'user', content: s })),
    ],
  });
  console.log("======== progressiveSummarization =========");
  console.log("");
  console.log(finalResponse);
  console.log("");
  console.log("============================================");

  return finalResponse.choices[0].message.content;
};

app.post('/chat', async (req, res) => {
  try {

    let { messages } = req.body;
    const MAX_MESSAGES = 10;

    if (messages.length > MAX_MESSAGES) {
      const summary = await progressiveSummarization(messages.slice(0, -MAX_MESSAGES));
      console.log("============================================");
      console.log("");
      console.log(summary);
      console.log("");
      console.log("============================================");
      messages = [
        { role: 'system', content: `Summary of previous conversation: ${summary}` },
        ...messages.slice(-MAX_MESSAGES),
      ];
    }
    console.log("============================================");
    console.log("");
    console.log(messages);
    console.log("");
    console.log("============================================");
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
    });

    const assistantMessage = { role: 'assistant', content: response.choices[0].message.content };
    res.json({ reply: assistantMessage.content });
  } catch (error) {
    console.error('Error in /chat:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(5000, () => console.log('🚀 Server running on http://localhost:5000'));
