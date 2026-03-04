const axios = require("axios");

// Fallback responses when AI is unavailable
const FALLBACK_RESPONSES = {
  default: `I'm here to help with your health questions! However, I'm experiencing technical difficulties right now. 

**What you can do:**
- Try again in a few moments
- Check your internet connection
- Contact support if the issue persists

**For immediate medical concerns:**
- Call your doctor's office
- Visit an urgent care clinic
- Call emergency services (911) for emergencies

*This information is for educational purposes only. Consult a healthcare professional for medical advice.*`,

  symptoms: `I can't access the AI service right now, but here's general guidance:

**For common symptoms:**
- Rest and stay hydrated
- Monitor your temperature
- Over-the-counter medications may help

**Seek medical attention if:**
- Symptoms worsen or persist
- You have difficulty breathing
- You experience severe pain

*Consult a healthcare professional for proper diagnosis.*`,

  medication: `I'm unable to provide specific medication information right now. 

**General medication safety:**
- Take medications as prescribed
- Don't share medications with others
- Store medications properly
- Check for expiration dates

**Talk to your pharmacist or doctor about:**
- Proper dosage
- Potential side effects
- Drug interactions

*Always consult a healthcare professional for medication advice.*`,
};

// ── Send Chat Message ──────────────────────────────────────────────────
exports.sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty",
      });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    const modelId = process.env.OPENROUTER_MODEL;

    if (!apiKey) {
      // Return helpful fallback response
      let fallbackText = FALLBACK_RESPONSES.default;
      const lowerMsg = message.toLowerCase();
      if (lowerMsg.includes('symptom') || lowerMsg.includes('pain') || lowerMsg.includes('fever')) {
        fallbackText = FALLBACK_RESPONSES.symptoms;
      } else if (lowerMsg.includes('medication') || lowerMsg.includes('drug') || lowerMsg.includes('pill')) {
        fallbackText = FALLBACK_RESPONSES.medication;
      }

      return res.status(200).json({
        success: true,
        message: "AI service unavailable - using fallback response",
        data: {
          userMessage: message,
          aiResponse: fallbackText,
          userId: userId,
          timestamp: new Date().toISOString(),
          fallback: true,
        },
      });
    }

    // Call OpenRouter API with timeout
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: modelId || "openai/gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a friendly, knowledgeable healthcare AI assistant. Your role is to:\n" +
              "- Answer general health and wellness questions\n" +
              "- Provide information about symptoms, conditions, and treatments\n" +
              "- Offer lifestyle and preventive health advice\n" +
              "- Explain medical terms in simple language\n\n" +
              "Important guidelines:\n" +
              "- Be empathetic and supportive\n" +
              "- Use clear, non-technical language when possible\n" +
              "- Always recommend consulting a healthcare professional for serious concerns\n" +
              "- Do not diagnose conditions definitively - suggest possibilities only\n" +
              "- For emergencies, advise seeking immediate medical attention\n\n" +
              "Formatting: Use **bold** for important terms, bullet points for lists, and keep paragraphs short.",
          },
          {
            role: "user",
            content: message,
          },
        ],
        temperature: 0.7,
        max_tokens: 800,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.CLIENT_URL || "http://localhost:3000",
          "X-Title": "Healthcare Clinic AI Assistant",
        },
        timeout: 30000, // 30 second timeout
      },
    );

    const aiResponse =
      response.data.choices?.[0]?.message?.content ||
      "Sorry, I could not generate a response. Please try again.";

    res.status(200).json({
      success: true,
      message: "Message processed successfully",
      data: {
        userMessage: message,
        aiResponse: aiResponse,
        userId: userId,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Chatbot Error:", error.response?.data || error.message);

    // Check for OpenRouter data policy error (404) or any AI service error
    const errorMsg = error.response?.data?.error?.message || error.message || "";
    const isDataPolicyError = errorMsg.includes('data policy') || errorMsg.includes('No endpoints found');
    const isServiceUnavailable = error.response?.status === 404 || error.response?.status === 503;

    if (isDataPolicyError || isServiceUnavailable || !apiKey) {
      let fallbackText = FALLBACK_RESPONSES.default;
      const lowerMsg = (req.body.message || "").toLowerCase();
      if (lowerMsg.includes('symptom') || lowerMsg.includes('pain') || lowerMsg.includes('fever')) {
        fallbackText = FALLBACK_RESPONSES.symptoms;
      } else if (lowerMsg.includes('medication') || lowerMsg.includes('drug') || lowerMsg.includes('pill')) {
        fallbackText = FALLBACK_RESPONSES.medication;
      }

      return res.status(200).json({
        success: true,
        message: "AI service unavailable - using fallback response",
        data: {
          userMessage: req.body.message,
          aiResponse: fallbackText,
          userId: req.user.id,
          timestamp: new Date().toISOString(),
          fallback: true,
        },
      });
    }

    // Handle different error types
    if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
      return res.status(504).json({
        success: false,
        message: "Request timed out. Please try again with a shorter message.",
      });
    }

    if (error.response?.status === 429) {
      return res.status(429).json({
        success: false,
        message: "Too many requests. Please wait a moment and try again.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to process your message. Please try again.",
      error: error.message,
    });
  }
};

// ── Health Check for Chatbot ───────────────────────────────────────────
exports.healthCheck = async (req, res) => {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res.status(200).json({
        success: true,
        message: "Chatbot service running (AI key not configured - using fallback)",
        model: "fallback",
      });
    }

    res.status(200).json({
      success: true,
      message: "Chatbot service is operational",
      model: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Chatbot service health check failed",
      error: error.message,
    });
  }
};
