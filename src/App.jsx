import { useState } from 'react';
import axios from 'axios';
import './App.css';

const models = [
  { name: 'Mistral 7B', value: 'mistralai/mistral-7b-instruct' },
  { name: 'LLaMA 3 8B', value: 'meta-llama/llama-3-8b-instruct' },
  { name: 'Claude 3 Haiku', value: 'anthropic/claude-3-haiku' },
];

function App() {
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_OPENROUTER_API_KEY || '');
  const [code, setCode] = useState('');
  const [review, setReview] = useState('');
  const [model, setModel] = useState(models[0].value);
  const [loading, setLoading] = useState(false);
  const [apiKeyError, setApiKeyError] = useState('');

  const handleReview = async () => {
    if (!code.trim()) return alert("Please enter some code.");
    if (!apiKey.trim()) {
      setApiKeyError('API key is required.');
      return;
    }
    setLoading(true);
    setReview('');
    setApiKeyError('');

    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model,
          messages: [
            {
              role: 'user',
              content: `Please review this code and suggest improvements:\n\n${code}`,
            },
          ],
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const reply = response.data.choices[0].message.content;
      setReview(reply);
    } catch (error) {
      console.error("API request error:", error.response ? error.response.data : error.message);
      if (error.response && error.response.status === 401) {
        setApiKeyError('❌ API key is invalid or expired. Please update your API key.');
        setReview('');
      } else {
        setReview("❌ Error getting review. Check your API key or model.");
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-400 p-6">
      <div className="max-w-4xl mx-auto bg-gray-500 p-6 rounded-xl shadow">
        <h1 className="text-3xl font-bold mb-4 text-center">🧠 AI Code Reviewer</h1>

        <textarea
          className="w-full p-4 border bg-gray-300 rounded mb-4 font-mono"
          rows={10}
          placeholder="Paste your code here..."
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />

        <div className="mb-4">
          <label htmlFor="apiKey" className="block font-semibold mb-1">API Key:</label>
          <input
            id="apiKey"
            type="text"
            className="w-full p-2 border rounded mb-1 font-mono"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your OpenRouter API key"
          />
          {apiKeyError && <p className="text-red-600 font-semibold">{apiKeyError}</p>}
        </div>

        <div className="flex gap-4 mb-4">
          <select
            className="p-2 border rounded"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            {models.map((m) => (
              <option key={m.value} value={m.value}>{m.name}</option>
            ))}
          </select>

          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={handleReview}
            disabled={loading}
          >
            {loading ? 'Reviewing...' : 'Review Code'}
          </button>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={() => {
              setCode('');
              setReview('');
              setModel(models[0].value);
            }}
            
          >
            Clear
          </button>
        </div>

        <h2 className="text-xl font-semibold mb-2">Review:</h2>
        <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap">{review}</pre>
      </div>
    </div>
  );
}

export default App;
