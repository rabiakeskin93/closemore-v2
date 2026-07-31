const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const SYSTEM_PROMPT = "Sen B2B alanında uzmanlaşmış kıdemli bir satış stratejistisin.";

app.post('/api/generate-reply', async (req, res) => {
try {
const { companyInfo, customerMessage, tone, language } = req.body;
if (!customerMessage) {
return res.status(400).json({ error: 'Musteri mesaji bos olamaz.' });
}

const prompt = `Sirket Bilgisi / Hafiza: ${companyInfo || 'Belirtilmedi'}\nHedef Dil: ${language || 'Turkish'}\nYanit Tonu: ${tone}\nMusteri Mesaji: ${customerMessage}`;

const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
method: 'POST',
headers: {
'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
'Content-Type': 'application/json'
},
body: JSON.stringify({
model: 'llama-3.3-70b-versatile',
messages: [
{ role: 'system', content: SYSTEM_PROMPT },
{ role: 'user', content: prompt }
]
})
});

const data = await response.json();

if (!response.ok) {
console.error('Groq API Hatasi:', data);
return res.status(500).json({ error: data.error?.message || 'Groq API hatasi olustu.' });
}

const replyText = data.choices[0].message.content;

res.json({ success: true, reply: replyText });
} catch (error) {
console.error('Sunucu Hatasi:', error);
res.status(500).json({ error: 'Sunucu hatasi olustu.' });
}
});

app.get('/', (req, res) => {
res.sendFile(require('path').join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));