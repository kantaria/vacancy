const axios = require('axios');
require('dotenv').config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'; // Правильный URL

async function getChatGPTResponse(prompt) {
    try {
        const response = await axios.post(
            OPENAI_API_URL,
            {
                model: 'gpt-4o', // Указываем правильную модель
                messages: [{role: "user", content: prompt}],
                max_tokens: 150, // Настройте количество возвращаемых токенов
                n: 1,
                stop: null,
                temperature: 0.7
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_API_KEY}`
                }
            }
        );

        const completion = response.data.choices[0].message.content.trim();
        return completion;
    } catch (error) {
        console.error('Ошибка при обращении к ChatGPT API:', error.response ? error.response.data : error.message);
        return null;
    }
}

module.exports = { getChatGPTResponse };