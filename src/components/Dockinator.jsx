import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Dockinator = () => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [error, setError] = useState(null);
  const [userInput, setUserInput] = useState("");
  const [finalReport, setFinalReport] = useState(null); // State to hold the final report
  const chatHistoryRef = useRef(null);

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

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
      const response = await callGeminiAPI(
        [{ role: "user", parts: [{ text: "Let's begin." }] }],
        true
      );
      setHistory((prev) => [...prev, { role: "model", parts: [{ text: response }] }]);
    } catch (err) {
      setError("Failed to start. Check API key or connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const callGeminiAPI = async (currentHistory, ignorePrev = false) => {
    // ... (This function remains the same as before)
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
  
  // NEW FUNCTION to call your local backend
  const getPredictionFromLocalModel = async (symptomSummary) => {
    try {
      console.log("Sending to local model:", symptomSummary);
      const response = await fetch('http://localhost:5000/api/predict/dockinator', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_input: symptomSummary }),
      });
      if (!response.ok) throw new Error("Local model prediction failed.");
      
      const result = await response.json();
      return result; // e.g., { prediction: "Condition_10", confidence: 0.64 }

    } catch (err) {
      console.error("Local model error:", err);
      return { prediction: "Error", confidence: 0 };
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
          // It's the final report!
          setIsLoading(true); // Show loading while we call our own model
          setHistory(prev => [...prev, {role: "model", parts: [{text: "Analyzing the summary with our specialized model..."}]}]);

          // Call our local model with the summary from Gemini
          const localPrediction = await getPredictionFromLocalModel(parsedJson.summary);

          // Add our model's prediction to the final report object
          const combinedReport = {
            ...parsedJson,
            local_model_prediction: localPrediction,
          };
          
          setFinalReport(combinedReport); // Set the full report to be displayed
          setIsFinished(true); // Trigger the final report UI
          setIsLoading(false);
          return; // End the submission process here
        }
      }
      
      // If it's not the final report, just continue the conversation
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

  // UPDATED renderFinalReport to show the combined result
  const renderFinalReport = (report) => (
    <motion.div
      key="report"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="final-report-card"
    >
      <h3>📋 Final Report</h3>
      
      {/* This is the new part for your model's prediction */}
      <div className="local-prediction-highlight">
        <h4>Specialized Model Prediction</h4>
        <p>
            <strong>Condition:</strong> {report.local_model_prediction.prediction}
            <br/>
            <strong>Confidence:</strong> {Math.round(report.local_model_prediction.confidence * 100)}%
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
            <motion.div /* Chat Panel */ >
              <div ref={chatHistoryRef} className="chat-log">
                {history.filter((h) => h.role !== "system").map((msg, idx) => (
                  <div key={idx} className={`chat-message ${msg.role}`}>
                    {msg.parts[0].text}
                  </div>
                ))}
                {isLoading && <div className="typing-indicator"><div/><div/><div/></div>}
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
                <button type="submit" disabled={!userInput.trim() || isLoading}>Send</button>
              </form>
            </motion.div>
          ) : (
            finalReport && renderFinalReport(finalReport)
          )}
        </AnimatePresence>
        <motion.div /* Dockinator Character */ >
          <img src="/Dockinator.png" alt="Dockinator AI Assistant" />
        </motion.div>
      </div>
    </div>
  );
};

export default Dockinator;
