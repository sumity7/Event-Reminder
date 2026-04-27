export async function generateOccasionMessage({ age, event_type, relation }) {
  // 1. Input Validation
  if (!event_type || !relation) {
    throw new Error(
      "Missing required fields: event_type and relation are required.",
    );
  }

  // 2. Dynamic Prompting: Age only makes sense for Birthdays or Anniversaries
  // If they are celebrating Diwali, saying "someone turning undefined" breaks the AI's context.
  const isBirthday = event_type.toLowerCase() === "birthday";
  const contextText =
    isBirthday && age ? `turning ${age}` : "celebrating this special day";

  const messages = [
    {
      role: "system",
      content:
        "You are a helpful assistant that writes warm, heartfelt, and joyful greeting messages for personal occasions. Keep it concise, natural, and free of placeholder brackets.",
    },
    {
      role: "user",
      content: `Generate a sincere and uplifting ${event_type} message for someone ${contextText}. The message should sound like it's from a close ${relation}, about 50–60 words long. Do not include any names, greetings (like 'Dear X'), or sender sign-offs.`,
    },
  ];

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // 3. Replaced with a valid, fast Groq model.
          model: "llama3-8b-8192",
          messages,
          temperature: 0.7, // Adds slight creativity/warmth
          max_tokens: 150, // Prevents the AI from rambling
        }),
      },
    );

    // 4. Handle HTTP errors BEFORE trying to parse JSON
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();

    if (data.choices && data.choices.length > 0) {
      // .trim() removes stray line breaks the AI might add at the beginning/end
      return data.choices[0].message.content.trim();
    } else {
      throw new Error("Unexpected response structure from Groq AI");
    }
  } catch (error) {
    console.error("Failed to generate occasion message:", error.message);
    throw error; // Re-throw so the calling controller can send a 500 response
  }
}
