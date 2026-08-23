import { GoogleGenAI } from "@google/genai";
import { MOVIES_DATABASE, ServerMovie } from "../data/moviesData";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatResponse {
  reply: string;
  suggested_movies?: ServerMovie[];
  quick_actions?: string[];
}

export async function processChat(
  message: string,
  history: ChatMessage[] = []
): Promise<ChatResponse> {
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (geminiApiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: geminiApiKey });
      const movieContext = MOVIES_DATABASE.map(
        (m) => `${m.title} (${m.year}) - Directed by ${m.director}, Genres: ${m.genre.join(", ")}, Rating: ${m.rating}, Description: ${m.description}`
      ).join("\n");

      const systemPrompt = `You are MovieMind AI, an elite, warm, and highly conversational cinema companion (like ChatGPT specialized in film and human empathy).
You have deep knowledge of cinema history, directors, actors, cinematic styles, screenplays, and emotional storytelling.
You also have direct access to our featured catalog of movies:
${movieContext}

CORE CONVERSATIONAL PRINCIPLES (CHATGPT-LEVEL FLUIDITY):
1. UNDERSTAND ANY QUERY INTENT:
   - Handle ANY question naturally: questions about film plots, trivia, explanations of movie endings (e.g. Inception spinning top), director filmographies (Nolan, Tarantino, Scorsese, Miyazaki, Spielberg), specific actors, streaming info, or philosophical cinema discussions.
   - Always maintain a friendly, engaging, articulate, and conversational persona.

2. FLUID FOLLOW-UP HANDLING (CRITICAL):
   - If the previous response asked "Would you like more recommendations similar to these, or would you like to explore a different mood or genre?", respond accurately to whatever the user says:
     * If user asks for "similar movies", "more like these", "similar", or "yes": provide 3-4 MORE films sharing the exact same tone, thematic depth, pacing, and quality as the ones previously recommended.
     * If user provides a mood (e.g. "happy", "sad", "chill", "nostalgic", "scary", "romantic", "angry", "reflective", "hyped"): switch immediately to that mood with an empathetic, tailored response and fresh recommendations.
     * If user names a genre (e.g. "Sci-Fi", "Comedy", "Thriller", "Action", "Horror", "Drama", "Animation", "Romance", "Western", "Mystery", "Crime", "Fantasy"): deliver the best critically acclaimed and audience-favorite films in that genre.
     * If user names an actor or director: highlight their best works and what makes their craft special.

3. EMPATHY & MOOD MATCHING (CRITICAL):
   - When the user expresses a down, sad, depressed, lonely, crying, stressed, or emotionally heavy mood:
     Always start with genuine warmth and empathy:
     "I'm sorry you're feeling down. Everyone has tough days, and you deserve a comforting pick-me-up! Here are some heartwarming, uplifting, and inspirational movies that will wrap you in warmth, bring a genuine smile, and cheer you up:"
     *CRITICAL*: For sad/down users, NEVER recommend grim, violent, or depressing films. Always recommend uplifting, feel-good, comedic, or deeply inspirational movies (e.g. The Lion King, Amélie, Back to the Future, The Shawshank Redemption, Spider-Man: Into the Spider-Verse).
   - For joyful/happy moods: match their vibrant excitement.
   - For bored/tired moods: provide high-tempo thrillers or gripping mysteries.
   - For deep/thoughtful moods: provide mind-expanding sci-fi or philosophical cinema.

4. CLOSING INTERACTION:
   - Conclude recommendations with an inviting follow-up question such as:
     "Would you like more recommendations similar to these, or would you like to explore a different mood or genre?"`;

      // Build conversation turns for Gemini
      const conversationTurns: { role: "user" | "model"; parts: [{ text: string }] }[] = [];

      // Include previous turns from history (last 10 turns max for accurate conversational context)
      const recentHistory = history.slice(-10);
      for (const h of recentHistory) {
        conversationTurns.push({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.content }]
        });
      }

      // Add current message
      conversationTurns.push({
        role: "user",
        parts: [{ text: message }]
      });

      // Fallback candidate models if one experiences high demand (503 / 429)
      const candidateModels = ["gemini-3.7-flash", "gemini-3.6-flash", "gemini-2.5-flash"];
      let response: any = null;

      for (const modelName of candidateModels) {
        try {
          response = await ai.models.generateContent({
            model: modelName,
            contents: conversationTurns,
            config: {
              systemInstruction: systemPrompt,
              temperature: 0.7,
            }
          });
          if (response && response.text) {
            break;
          }
        } catch (modelErr: any) {
          // If 503 (high demand) or 404/429, try next model in candidate list
          const status = modelErr?.status || modelErr?.code;
          const msg = modelErr?.message || "";
          if (status === 503 || status === 429 || status === 404 || msg.includes("high demand") || msg.includes("not available")) {
            console.warn(`Model ${modelName} temporarily unavailable (${status || msg}), trying next candidate...`);
            continue;
          }
          throw modelErr;
        }
      }

      if (!response || !response.text) {
        throw new Error("No response generated from candidate models");
      }

      const replyText = response.text || "I'd love to help you find the perfect movie to watch!";

      // Match movies mentioned in reply
      const suggested_movies = MOVIES_DATABASE.filter((m) =>
        replyText.toLowerCase().includes(m.title.toLowerCase())
      ).slice(0, 4);

      // Generate context-aware quick actions
      let quick_actions = ["Yes, more like these!", "No, try a different mood", "Where to stream?", "Surprise me!"];
      const lowerReply = replyText.toLowerCase();
      if (lowerReply.includes("what's your mood") || lowerReply.includes("tell me")) {
        quick_actions = ["Happy & feel-good 😊", "Sad / feeling down 🌧️", "Intense Thriller ⚡", "Mind-bending Sci-Fi 🌌"];
      }

      return {
        reply: replyText,
        suggested_movies: suggested_movies.length > 0 ? suggested_movies : undefined,
        quick_actions
      };
    } catch (err) {
      console.warn("Gemini API call failed, falling back to local chat engine:", err);
    }
  }

  // ==========================================
  // SMART LOCAL FILM-BUFF ENGINE (FALLBACK)
  // ==========================================
  const lower = message.toLowerCase().trim();
  const lastBotMsg = history.length > 0
    ? [...history].reverse().find((m) => m.role === "assistant")?.content?.toLowerCase() || ""
    : "";

  let matchedMovies: ServerMovie[] = [];
  let reply = "";
  let quick_actions: string[] = ["Yes, more like these!", "No, try a different mood", "Where to stream?", "Surprise me!"];

  // 1. Check if user is saying "yes" / affirmative
  const isAffirmative = /^(yes|yeah|yep|yup|sure|ok|okay|please|yes please|definitely|of course|why not|i do|recommend me|give me|tell me|more)$/i.test(lower) ||
    lower.startsWith("yes ") || lower.startsWith("yeah ") || lower.startsWith("sure ");

  // 2. Check if user is saying "no" / negative / switch
  const isNegative = /^(no|nah|nope|not really|something else|different|neither|none|no thanks|stop)$/i.test(lower) ||
    lower.startsWith("no ") || lower.includes("different mood") || lower.includes("something else");

  // 1. Check if user is asking for "similar", "more", or saying "yes" to similar
  const isAskingSimilar = /similar|more like (this|these|those)|more recommendation|give me more|another (one|movie|film|recommendation)|same vibe/i.test(lower) ||
    (isAffirmative && (lastBotMsg.includes("similar to these") || lastBotMsg.includes("more recommendations")));

  // Check specific genres requested
  const genreList = ["Action", "Adventure", "Animation", "Biography", "Comedy", "Crime", "Drama", "Family", "Fantasy", "History", "Horror", "Music", "Mystery", "Romance", "Sci-Fi", "Thriller", "War", "Western"];
  const requestedGenre = genreList.find((g) => lower.includes(g.toLowerCase()));

  // Check specific directors requested
  const directors = ["Christopher Nolan", "Martin Scorsese", "Quentin Tarantino", "Steven Spielberg", "David Fincher", "Ridley Scott", "Alfred Hitchcock", "Bong Joon-ho", "Denis Villeneuve", "Hayao Miyazaki"];
  const requestedDirector = directors.find((d) => lower.includes(d.toLowerCase()) || lower.includes(d.split(" ")[1]?.toLowerCase() || ""));

  if (isAskingSimilar) {
    matchedMovies = MOVIES_DATABASE.filter((m) => m.rating >= 8.5).slice(2, 6);
    reply = `Here are more sensational, highly-rated cinematic masterpieces that match that exact caliber of storytelling:

• **The Shawshank Redemption** (1994) – A legendary portrait of hope, resilience, and true brotherhood.
• **Interstellar** (2014) – An emotionally staggering cosmic voyage through wormholes and relativity.
• **The Prestige** (2006) – Christopher Nolan's thrilling battle of obsession and stage magic.
• **Spirited Away** (2001) – Hayao Miyazaki's breathtaking, Oscar-winning animated triumph.

Would you like more recommendations similar to these, or would you like to explore a different mood or genre?`;
    quick_actions = ["Yes, give me more!", "No, try a different mood", "Where to stream?", "Explore Sci-Fi"];
  } else if (requestedGenre) {
    matchedMovies = MOVIES_DATABASE.filter((m) => m.genre.some((g) => g.toLowerCase() === requestedGenre.toLowerCase())).slice(0, 4);
    reply = `Here are top-tier, critically celebrated **${requestedGenre}** films that stand out for their exceptional execution:

${matchedMovies.map((m) => `• **${m.title}** (${m.year}) – Directed by ${m.director} (★ ${m.rating}/10): ${m.description}`).join("\n\n")}

Would you like more recommendations similar to these, or would you like to explore a different mood or genre?`;
    quick_actions = [`More ${requestedGenre} picks`, "No, try a different mood", "Where to stream?", "Surprise me!"];
  } else if (requestedDirector) {
    matchedMovies = MOVIES_DATABASE.filter((m) => m.director.toLowerCase().includes(requestedDirector.toLowerCase()));
    reply = `**${requestedDirector}** is an absolute visionary of modern cinema! Here are their standout masterworks in our database:

${matchedMovies.map((m) => `• **${m.title}** (${m.year}) – (★ ${m.rating}/10): ${m.description}`).join("\n\n")}

Would you like more recommendations similar to these, or would you like to explore a different mood or genre?`;
    quick_actions = ["Yes, more like these!", "No, try a different director", "Where to stream?", "Explore Sci-Fi"];
  } else if (isAffirmative) {
    // User says yes to general greeting or recommendation offer
    reply = `Awesome! I'm thrilled to help you discover your next favorite watch.

To tailor the perfect recommendation, tell me:
1. **How are you feeling right now (your mood)?** *(e.g., Happy, Sad/Down, Stressed, Bored, Romantic)*
2. **Any favorite genre, actor, or director you love?** *(e.g., Sci-Fi, Christopher Nolan, Leonardo DiCaprio)*

Or click one of the quick options below:`;
    quick_actions = ["Feeling happy 😊", "Feeling down / sad 🌧️", "Need adrenaline ⚡", "Mind-bending 🌌", "Surprise me! 🎲"];
  } else if (isNegative) {
    reply = `No problem at all! Let's pivot to something fresh.

Tell me: what kind of vibe or mood should we explore instead?
• Are you looking for a **heartwarming comedy**, an **intense thriller**, a **mind-bending sci-fi**, or a **romantic drama**?
• Or do you have a specific **director/actor** in mind?`;
    quick_actions = ["Heartwarming Comedy 😂", "Intense Thriller ⚡", "Mind-bending Sci-Fi 🌌", "Nolan Masterpieces 🎬"];
  }
  // 3. User expresses SAD / DOWN / DEPRESSED / CRYING mood
  else if (lower.includes("sad") || lower.includes("down") || lower.includes("depressed") || lower.includes("crying") || lower.includes("unhappy") || lower.includes("lonely") || lower.includes("heartbroken") || lower.includes("upset") || lower.includes("blue")) {
    matchedMovies = MOVIES_DATABASE.filter((m) =>
      ["amelie", "the-lion-king", "back-to-the-future", "shawshank-redemption", "spirited-away", "spider-verse"].includes(m.id) ||
      m.genre.includes("Animation") || m.genre.includes("Comedy")
    ).slice(0, 3);

    reply = `I'm sorry you're feeling down. Everyone has tough days, and you deserve a comforting pick-me-up! Here are some heartwarming, uplifting, and inspirational movies that will wrap you in warmth, bring a genuine smile, and cheer you up:

• **The Lion King** (1994) – A triumphant, emotionally rich masterpiece packed with joy, courage, and unforgettable music.
• **Amélie** (2001) – A delightful, whimsical journey of an innocent Parisian girl dedicated to bringing happiness to others.
• **Back to the Future** (1985) – Pure, infectious optimism and high-energy time-travel adventure that never fails to spark a smile.
• **The Shawshank Redemption** (1994) – A deeply inspiring ode to hope, endurance, and the unbreakable human spirit.

Would you like more recommendations similar to these, or would you like to explore a different mood or genre?`;
    quick_actions = ["Yes, more uplifting picks!", "No, try a different mood", "Where to stream?", "Give me a pure comedy"];
  }
  // 4. User expresses STRESSED / TIRED / EXHAUSTED / ANXIOUS mood
  else if (lower.includes("stress") || lower.includes("tired") || lower.includes("exhausted") || lower.includes("anxious") || lower.includes("overwhelmed") || lower.includes("relax")) {
    matchedMovies = MOVIES_DATABASE.filter((m) =>
      ["amelie", "the-lion-king", "back-to-the-future", "la-la-land"].includes(m.id) ||
      m.genre.includes("Comedy") || m.genre.includes("Animation")
    ).slice(0, 3);

    reply = `Take a deep breath — I know days like this can be draining. Let's unwind with these gentle, comforting, stress-free movies designed to help you relax and recharge:

• **Amélie** (2001) – Calming, vibrant, and delightfully soothing with an enchanting soundtrack.
• **Back to the Future** (1985) – Easy-watching, feel-good fun with effortless charm.
• **The Lion King** (1994) – Nostalgic comfort food for the soul.

Would you like more recommendations similar to these, or would you like to explore a different mood or genre?`;
    quick_actions = ["Yes, more relaxing films", "No, try a different mood", "Where to stream?", "Surprise me!"];
  }
  // 5. User expresses HAPPY / JOYFUL / EXCITED / GREAT mood
  else if (lower.includes("happy") || lower.includes("joy") || lower.includes("excited") || lower.includes("great") || lower.includes("good") || lower.includes("celebrat")) {
    matchedMovies = MOVIES_DATABASE.filter((m) =>
      ["spider-verse", "back-to-the-future", "amelie", "the-lion-king"].includes(m.id) ||
      m.genre.includes("Animation") || m.genre.includes("Adventure")
    ).slice(0, 3);

    reply = `Love that positive energy! Let's keep those vibrant vibes rolling with these delightful, feel-good, and wildly entertaining films:

• **Spider-Man: Into the Spider-Verse** (2018) – A dazzling explosion of style, humor, and exhilarating energy.
• **Back to the Future** (1985) – The ultimate feel-good classic with irresistible rhythm and charm.
• **The Lion King** (1994) – Pure celebration of life, family, and breathtaking animation.

Would you like more recommendations similar to these, or would you like to explore a different mood or genre?`;
    quick_actions = ["Yes, more feel-good picks!", "No, try a different mood", "Where to stream?", "Try high-octane action"];
  }
  // 6. User expresses BORED / ADVENTURE / ACTION / THRILL
  else if (lower.includes("bored") || lower.includes("action") || lower.includes("thrill") || lower.includes("exciting") || lower.includes("fast")) {
    matchedMovies = MOVIES_DATABASE.filter((m) =>
      ["inception", "the-dark-knight", "django-unchained", "mad-max-fury-road", "1917"].includes(m.id) ||
      m.genre.includes("Action")
    ).slice(0, 3);

    reply = `Boredom doesn't stand a chance! Here are some gripping, fast-paced cinematic rollercoasters that will hook you from the very first minute:

• **Inception** (2010) – A relentless, mind-bending heist through layers of subconscious dreams.
• **The Dark Knight** (2008) – Legendary tension featuring Heath Ledger's iconic Joker in an electrifying crime spectacle.
• **Django Unchained** (2012) – Quentin Tarantino's razor-sharp dialogue, brilliant style, and explosive action.

Would you like more recommendations similar to these, or would you like to explore a different mood or genre?`;
    quick_actions = ["Yes, more action thrillers!", "No, try a different mood", "Where to stream?", "Sci-Fi mindbenders"];
  }
  // 7. User asks for SCI-FI / MIND-BENDING / PHILOSOPHICAL / NOLAN
  else if (lower.includes("nolan") || lower.includes("mind") || lower.includes("thought") || lower.includes("sci-fi") || lower.includes("philosophy") || lower.includes("deep") || lower.includes("space")) {
    matchedMovies = MOVIES_DATABASE.filter((m) =>
      ["inception", "interstellar", "the-prestige", "the-matrix", "oppenheimer"].includes(m.id) ||
      m.director === "Christopher Nolan" || m.genre.includes("Sci-Fi")
    ).slice(0, 3);

    reply = `In the mood for some intellectual stimulation? Here are mind-expanding masterworks packed with stunning twists and deep philosophical concepts that will keep you thinking long after the credits roll:

• **Inception** (2010) – Christopher Nolan's magnum opus on dreams, grief, and recursive reality.
• **Interstellar** (2014) – A breathtaking, scientifically grounded cosmic odyssey powered by Hans Zimmer's sublime score.
• **The Matrix** (1999) – The revolutionary cyberpunk masterwork questioning the nature of human perception.

Would you like more recommendations similar to these, or would you like to explore a different mood or genre?`;
    quick_actions = ["Yes, more mind-benders!", "No, try a different mood", "Christopher Nolan films", "Where to stream?"];
  }
  // 8. User asks for ROMANCE / LOVE / DATE NIGHT
  else if (lower.includes("romantic") || lower.includes("romance") || lower.includes("love") || lower.includes("date night")) {
    matchedMovies = MOVIES_DATABASE.filter((m) =>
      ["amelie", "la-la-land", "your-name", "titanic"].includes(m.id) ||
      m.genre.includes("Romance")
    ).slice(0, 3);

    reply = `Setting the mood for romance? Here are enchanting, beautifully crafted love stories with unforgettable chemistry and heartwarming charm:

• **Amélie** (2001) – A magical, heartwarming Parisian romance filled with whimsical beauty.
• **La La Land** (2016) – A visually breathtaking musical tribute to dreamers, passion, and modern romance.
• **Your Name** (2016) – An emotionally transcendent animated marvel about destiny and connection across time.

Would you like more recommendations similar to these, or would you like to explore a different mood or genre?`;
    quick_actions = ["Yes, more romance films!", "No, try a different mood", "Romantic comedies", "Where to stream?"];
  }
  // 9. User asks for CRIME / DARK / HORROR / MYSTERY
  else if (lower.includes("dark") || lower.includes("crime") || lower.includes("horror") || lower.includes("mystery") || lower.includes("scary") || lower.includes("spooky") || lower.includes("se7en") || lower.includes("psycho")) {
    matchedMovies = MOVIES_DATABASE.filter((m) =>
      ["se7en", "the-silence-of-the-lambs", "goodfellas", "the-departed", "psycho", "alien", "parasite-thriller"].includes(m.id) ||
      m.genre.includes("Crime") || m.genre.includes("Horror")
    ).slice(0, 3);

    reply = `Craving suspense and edge-of-your-seat atmosphere? Here are masterclass thrillers and psychological mysteries with spine-tingling tension:

• **Se7en** (1995) – David Fincher's atmospheric, rain-soaked crime masterpiece.
• **The Silence of the Lambs** (1991) – Anthony Hopkins' chilling, iconic performance in a riveting psychological chess match.
• **Goodfellas** (1990) – Martin Scorsese's kinetic, brilliant dive into the Italian-American mob.

Would you like more recommendations similar to these, or would you like to explore a different mood or genre?`;
    quick_actions = ["Yes, more dark thrillers!", "No, try a different mood", "Where to stream?", "Something lighter"];
  }
  // 10. GREETINGS & CASUAL
  else if (lower.includes("how are you") || lower.includes("hello") || lower.includes("hey") || lower.includes("hi") || lower === "sup") {
    reply = `All good over here! More importantly, how are YOU doing today? 

Are you looking for a movie recommendation to match your mood, or do you have a specific genre in mind?`;
    quick_actions = ["Yes, recommend a movie!", "I'm feeling happy 😊", "I'm feeling down 🌧️", "Surprise me with a top movie! 🎬"];
  }
  // 11. STREAMING PLATFORMS
  else if (lower.includes("stream") || lower.includes("where to watch") || lower.includes("netflix") || lower.includes("prime") || lower.includes("hbo") || lower.includes("max")) {
    reply = `You can check real-time streaming availability for any movie on MovieMind!

Simply click any movie card to view its streaming availability across **Netflix**, **Max (HBO)**, **Amazon Prime Video**, **Disney+**, **Apple TV**, and **Hulu**, complete with video trailers and rating breakdowns.

What film or vibe would you like to look up next?`;
    quick_actions = ["Top Rated Movies ⭐", "Mind-bending Sci-Fi 🌌", "Uplifting feel-good 😊", "Take Taste Quiz 📝"];
  }
  // 12. GENERAL CINEPHILE FALLBACK
  else {
    matchedMovies = MOVIES_DATABASE.slice(0, 3);
    reply = `I'd love to help you find the absolute best film for your evening!

To get the most accurate match:
• **What's your current mood?** *(Happy, Sad/Down, Stressed, Bored, Adventurous, Romantic)*
• **Or tell me a favorite genre, director, or actor!**

Here are three all-time acclaimed masterpieces in our collection to start:
• **Inception** (2010) – Mind-bending Sci-Fi heist
• **The Dark Knight** (2008) – Legendary Action / Crime masterpiece
• **Interstellar** (2014) – Breathtaking space odyssey

Would you like more recommendations similar to these, or would you like to explore a different mood or genre?`;
    quick_actions = ["Feeling happy 😊", "Feeling down / sad 🌧️", "Mind-bending Sci-Fi 🌌", "Intense Thriller ⚡"];
  }

  return {
    reply,
    suggested_movies: matchedMovies.length > 0 ? matchedMovies : undefined,
    quick_actions
  };
}

