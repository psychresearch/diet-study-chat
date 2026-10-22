
/**
 * netlify/functions/chat.js
 *
 * Secure server-side bridge between the chat interface and Gemini.
 * The Gemini API key stays on Netlify's servers and is never exposed
 * to study participants.
 */

exports.handler = async function (event) {
  // Only allow POST requests.
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  // Read the Gemini API key from Netlify environment variables.
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "GEMINI_API_KEY is not configured in Netlify."
      })
    };
  }

  // Parse the request sent by index.html.
  let body;

  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Invalid request body." })
    };
  }

  const { history = [], systemPrompt = "" } = body;

  if (!Array.isArray(history)) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Invalid conversation history." })
    };
  }

  // Convert the existing Claude-style conversation history to
  // Gemini's format. Gemini uses "model" instead of "assistant".
  const contents = history.map((message) => {
    const role =
      message.role === "assistant" || message.role === "model"
        ? "model"
        : "user";

    return {
      role,
      parts: [
        {
          text: String(message.content ?? "")
        }
      ]
    };
  });

  // Call the Gemini API.
  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: systemPrompt
              }
            ]
          },
          contents,
          generationConfig: {
            maxOutputTokens: 300
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error("Gemini API error:", response.status, errorText);

      return {
        statusCode: response.status,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: "The Gemini API request failed.",
          details: errorText
        })
      };
    }

    const data = await response.json();

    // Extract Gemini's generated text.
    const aiText = (data.candidates?.[0]?.content?.parts || [])
      .map((part) => part.text || "")
      .join("")
      .trim();

    if (!aiText) {
      console.error(
        "Gemini returned no text:",
        JSON.stringify(data.promptFeedback || {})
      );

      return {
        statusCode: 502,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: "Gemini returned no text response."
        })
      };
    }

    // Preserve the response format expected by index.html:
    // data.content[0].text
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        content: [
          {
            type: "text",
            text: aiText
          }
        ]
      })
    };
  } catch (err) {
    console.error("Gemini request error:", err.message);

    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Unable to contact the Gemini API."
      })
    };
  }
};
