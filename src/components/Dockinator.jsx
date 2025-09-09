import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Dockinator = () => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [error, setError] = useState(null);
  const [userInput, setUserInput] = useState("");
  const [finalReport, setFinalReport] = useState(null);
  const chatHistoryRef = useRef(null);

  // CHANGED: Use a single API endpoint for the entire Gradio app
  const HF_SPACE_URL = "https://soutik07-medisight.hf.space/run/predict";

  const systemPrompt = `You are Dockinator, a friendly and empathetic AI medical assistant. 
Start by introducing yourself and asking the user to describe their primary symptom. 
Ask follow-up questions, one at a time, until you have enough info. 
Never give a definitive diagnosis. 

After 5–7 interactions, always end with a "Final Report".  
Your response MUST be valid JSON in this schema only:

{
  "summary": "short description of symptoms collected",
  "final_report": {
    "possible_conditions": [
      { "name": "condition name", "description": "brief explanation" }
    ],
    "recommendations": ["advice 1", "advice 2"],
    "doctor_may_recommend": ["test or procedure 1", "test 2"]
  }
}`;

  useEffect(() => {
    startConversation();
  }, []);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTo({
        top: chatHistoryRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [history]);

  const startConversation = async () => {
    setHistory([{ role: "system", parts: [{ text: systemPrompt }] }]);
    setIsLoading(true);
    try {
      const response = await callGeminiAPI([{ role: "user", parts: [{ text: "Let's begin." }] }], true);
      setHistory((prev) => [...prev, { role: "model", parts: [{ text: response }] }]);
    } catch (err) {
      setError("Failed to start. Check API key or connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const callGeminiAPI = async (currentHistory, ignorePrev = false) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
    const payload = {
      contents: ignorePrev ? currentHistory : [...history.filter((h) => h.role !== "system"), ...currentHistory],
      systemInstruction: { parts: [{ text: systemPrompt }] },
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(errorBody.error?.message || "API request failed");
    }

    const result = await response.json();
    return result.candidates[0].content.parts[0].text;
  };

  const getPredictionFromHF = async (symptomSummary) => {
    try {
      const response = await fetch(HF_SPACE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // CHANGED: Added tab index 2 for symptom prediction model
        body: JSON.stringify({ data: [2, symptomSummary] }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "HF prediction failed");
      }

      const result = await response.json();
      // The Gradio API returns a list of results, so we need to get the first one
      return result.data[0];
    } catch (err) {
      console.error("HF error:", err);
      return { Prediction: "Error", Confidence: 0 };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const userAnswer = { role: "user", parts: [{ text: userInput }] };
    setHistory((prev) => [...prev, userAnswer]);
    setUserInput("");
    setIsLoading(true);
    setError(null);

    try {
      const modelResponse = await callGeminiAPI([userAnswer]);
      const jsonRegex = /```json\s*(\{[\s\S]*?\})\s*```|(\{[\s\S]*?\})/s;
      const jsonMatch = modelResponse.match(jsonRegex);

      if (jsonMatch) {
        const jsonString = jsonMatch[1] || jsonMatch[2];
        const parsedJson = JSON.parse(jsonString);

        if (parsedJson?.final_report) {
          setIsLoading(true);
          setHistory(prev => [...prev, {role: "model", parts: [{text: "Analyzing the summary with HF model..."}]}]);

          const hfPrediction = await getPredictionFromHF(parsedJson.summary);

          const combinedReport = { ...parsedJson, hf_prediction: hfPrediction };
          setFinalReport(combinedReport);
          setIsFinished(true);
          setIsLoading(false);
          return;
        }
      }

      setHistory((prev) => [...prev, { role: "model", parts: [{ text: modelResponse }] }]);
    } catch (err) {
      setError(`Error: ${err.message}`);
      setHistory((prev) => [...prev, { role: "model", parts: [{ text: `Error: ${err.message}` }] }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartOver = () => {
    setHistory([]);
    setIsFinished(false);
    setError(null);
    setFinalReport(null);
    startConversation();
  };

  const renderFinalReport = (report) => (
    <motion.div
      key="report"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="final-report-card"
    >
      <h3>📋 Final Report</h3>
      <div className="hf-prediction-highlight">
        <h4>HF Space Prediction</h4>
        <p>
            <strong>Condition:</strong> {report.hf_prediction.Prediction}
            <br/>
            <strong>Confidence:</strong> {Math.round(report.hf_prediction.Confidence * 100)}%
        </p>
      </div>

      <p><strong>Symptom Summary (from Gemini):</strong> {report.summary}</p>

      <h4>Possible Conditions (from Gemini)</h4>
      <ul>
        {report.final_report.possible_conditions.map((cond, i) => (
          <li key={i}><strong>{cond.name}:</strong> {cond.description}</li>
        ))}
      </ul>

      <h4>Recommendations (from Gemini)</h4>
      <ul>
        {report.final_report.recommendations.map((rec, i) => (
          <li key={i}>{rec}</li>
        ))}
      </ul>

      <h4>Doctor May Recommend</h4>
      <ul>
        {report.final_report.doctor_may_recommend.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>

      <button className="btn-primary" onClick={handleStartOver}>🔄 Start Over</button>
    </motion.div>
  );

  return (
    <div className="dockinator-page">
      <header className="dockinator-header">
        <h1>Dockinator</h1>
        <p>Your friendly AI medical guide</p>
      </header>

      <div className="dockinator-main" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        {/* Chat Column */}
        <div className="chat-column" style={{ flex: 1, minWidth: 320 }}>
          <div ref={chatHistoryRef} className="chat-log" style={{ maxHeight: 500, overflowY: 'auto', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: 12 }}>
            {history.filter((h) => h.role !== "system").map((msg, idx) => (
              <div key={idx} className={`chat-message ${msg.role}`} style={{ margin: '6px 0' }}>
                {msg.parts[0].text}
              </div>
            ))}
            {isLoading && <div className="typing-indicator"><div/><div/><div/></div>}
            {error && <div className="chat-message model error">{error}</div>}
          </div>
          {!isFinished && (
            <form className="input-form" onSubmit={handleSubmit} style={{ marginTop: 8, display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type your response..."
                disabled={isLoading}
                style={{ flex: 1, padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid #cbd5e1' }}
              />
              <button type="submit" disabled={!userInput.trim() || isLoading} className="btn-primary">
                Send
              </button>
            </form>
          )}
        </div>

        {/* Final Report Column */}
        <div className="report-column" style={{ flex: 1, minWidth: 320 }}>
          <AnimatePresence>
            {isFinished && finalReport && renderFinalReport(finalReport)}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Dockinator;