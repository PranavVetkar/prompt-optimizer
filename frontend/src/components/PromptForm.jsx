import React, { useState } from "react";

const API_BASE = "http://127.0.0.1:8000";

export default function PromptForm() {
  const [userPrompt, setUserPrompt] = useState("");
  const [tone, setTone] = useState("Neutral");
  const [format, setFormat] = useState("Text");
  const [persona, setPersona] = useState("a helpful assistant");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userPrompt.trim()) {
      setError("Please enter a valid prompt.");
      return;
    }

    setLoading(true);
    setError("");
    setResult("");

    try {
      const response = await fetch(`${API_BASE}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_prompt: userPrompt,
          tone: tone.toLowerCase(),
          format: format.toLowerCase(),
          persona,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);

    } catch (err) {
      setError("Failed to connect to backend or stream data.");
    }

    setLoading(false);
  };

  return (
    <div className="container mt-5">
      <h1>💡 Prompt Optimizer</h1>
      <p>Enter your simple prompt and get a detailed, optimized version.</p>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <textarea
            className="form-control"
            rows="5"
            placeholder="e.g., Explain the concept of black holes."
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
          />
        </div>

        <div className="row">
          <div className="col-md-4">
            <label>Tone</label>
            <select className="form-select" value={tone} onChange={(e) => setTone(e.target.value)}>
              <option>Neutral</option>
              <option>Professional</option>
              <option>Casual</option>
              <option>Humorous</option>
            </select>
          </div>
          <div className="col-md-4">
            <label>Format</label>
            <select className="form-select" value={format} onChange={(e) => setFormat(e.target.value)}>
              <option>Text</option>
              <option>Markdown</option>
              <option>Bulleted List</option>
              <option>JSON</option>
            </select>
          </div>
          <div className="col-md-4">
            <label>AI Persona</label>
            <input
              type="text"
              className="form-control"
              value={persona}
              onChange={(e) => setPersona(e.target.value)}
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary mt-3" disabled={loading}>
          {loading ? "Optimizing..." : "Optimize Prompt"}
        </button>
      </form>

      {error && <div className="alert alert-danger mt-3">{error}</div>}

      {result && (
        <div className="mt-4">
          <h4>Original Prompt</h4>
          <pre className="bg-light p-3">{result.original_prompt}</pre>

          <h4>Elaborated Prompt</h4>
          <pre
            className="bg-dark text-white p-3"
            style={{
              maxHeight: "400px",
              overflowY: "auto",
              overflowX: "auto",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word"
            }}
          >
            {result.elaborated_prompt}
          </pre>

          <p>Token Count: {result.token_count}</p>
        </div>
      )}
    </div>
  );
}
