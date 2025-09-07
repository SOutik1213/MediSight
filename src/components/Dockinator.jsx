import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Dockinator = () => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [error, setError] = useState(null);
  const [userInput, setUserInput] = useState("");
  const chatHistoryRef = useRef(null);

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  const systemPrompt = `You are Dockinator, a friendly and empathetic AI medical assistant. 
Start by introducing yourself and asking the user to describe their primary symptom. 
Ask follow-up questions, one at a time, until you have enough info. 
Never give a definitive diagnosis. 

After 5–7 interactions, always end with a "Final Report".  
Your response MUST be valid JSON in this schema only:

{
  "summary": "short description of symptoms",
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
      const response = await callGeminiAPI(
        [{ role: "user", parts: [{ text: "Let's begin." }] }],
        true // ignore previous history for first call
      );
      setHistory((prev) => [...prev, { role: "model", parts: [{ text: response }] }]);
    } catch (err) {
      setError("Failed to start. Check API key or connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const callGeminiAPI = async (currentHistory, ignorePrev = false) => {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
    const payload = {
      contents: ignorePrev
        ? currentHistory
        : [...history.filter((h) => h.role !== "system"), ...currentHistory],
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

      // Extract JSON safely
      const jsonRegex = /```json\s*(\{[\s\S]*?\})\s*```|(\{[\s\S]*?\})/s;
      const jsonMatch = modelResponse.match(jsonRegex);
      let messageContent = modelResponse;
      let isReport = false;

      if (jsonMatch) {
        const jsonString = jsonMatch[1] || jsonMatch[2];
        try {
          const parsedJson = JSON.parse(jsonString);
          if (parsedJson?.final_report) {
            messageContent = parsedJson;
            isReport = true;
          }
        } catch (parseError) {
          console.error("JSON parse failed:", parseError);
        }
      }

      setHistory((prev) => [
        ...prev,
        { role: "model", parts: [{ text: messageContent }] },
      ]);

      if (isReport) setIsFinished(true);

    } catch (err) {
      setError(`Error: ${err.message}`);
      setHistory((prev) => [
        ...prev,
        { role: "model", parts: [{ text: `Error: ${err.message}` }] },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartOver = () => {
    setHistory([]);
    setIsFinished(false);
    setError(null);
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
      <p><strong>Summary:</strong> {report.summary}</p>

      <h4>Possible Conditions</h4>
      <ul>
        {report.final_report.possible_conditions.map((cond, i) => (
          <li key={i}><strong>{cond.name}:</strong> {cond.description}</li>
        ))}
      </ul>

      <h4>Recommendations</h4>
      <ul>
        {report.final_report.recommendations.map((rec, i) => (
          <li key={i}>{rec}</li>
        ))}
      </ul>

      <h4>Doctor May Recommend</h4>
      <ul>
        {report.final_report.doctor_may_recommend.map((test, i) => (
          <li key={i}>{test}</li>
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

      <div className="dockinator-main">
        <AnimatePresence>
          {!isFinished ? (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="dockinator-chat-panel"
            >
              <div ref={chatHistoryRef} className="chat-log">
                {history.filter((h) => h.role !== "system").map((msg, idx) => (
                  <div key={idx} className={`chat-message ${msg.role}`}>
                    {typeof msg.parts[0].text === "string"
                      ? msg.parts[0].text
                      : "Generating report..."}
                  </div>
                ))}

                {isLoading && (
                  <div className="typing-indicator">
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                )}
                {error && <div className="chat-message model error">{error}</div>}
              </div>

              <form className="input-form" onSubmit={handleSubmit}>
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Type your response..."
                  disabled={isLoading}
                />
                <button type="submit" disabled={!userInput.trim() || isLoading}>
                  Send
                </button>
              </form>
            </motion.div>
          ) : (
            renderFinalReport(history[history.length - 1].parts[0].text)
          )}
        </AnimatePresence>

        <motion.div
          className="dockinator-character"
          animate={{ y: isFinished ? -50 : 0, scale: isFinished ? 1.15 : 1 }}
          transition={{ duration: 0.8, type: "spring" }}
        >
          <img src="/Dockinator.png" alt="Dockinator AI Assistant" />
        </motion.div>
      </div>
    </div>
  );
};

export default Dockinator;
