import { GoogleGenAI, Type, Chat } from "@google/genai";
import type { ChatMessage, GroundingSource, TopicResourceSet, StudyGoal, ScheduleItem, BreakActivityType, BreakActivitySuggestion, Flashcard } from '../types';

// Fix: API key must be retrieved from process.env.API_KEY per coding guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const scheduleSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            day: { type: Type.STRING, description: "Day of the week (e.g., Monday, Tuesday)." },
            timeSlot: { type: Type.STRING, description: "Time range for the activity (e.g., '9:00 AM - 11:00 AM')." },
            subject: { type: Type.STRING },
            topic: { type: Type.STRING, description: "Specific topic to cover." },
            activity: {
                type: Type.STRING,
                enum: ['Study', 'Revise', 'Practice', 'Mock Test', 'Daily Quiz'],
                description: "The type of learning activity."
            },
            status: { 
                type: Type.STRING, 
                enum: ['Not Started', 'In Progress', 'Completed'],
                description: "Set to 'Not Started' by default."
            },
            important: { type: Type.BOOLEAN, description: "Set to false by default. Can be used for high-priority tasks." }
        },
        required: ["day", "timeSlot", "subject", "topic", "activity", "status", "important"]
    }
};


export const generateStudySchedule = async (goal: StudyGoal): Promise<ScheduleItem[]> => {
    const prompt = `
        You are an expert academic planner for a Class 10 student in India preparing for their ${goal.exam}.
        The student's subjects are: ${goal.subjects.join(', ')}.
        The target exam date is ${goal.targetDate}.
        The student has these fixed commitments (coaching, etc.): "${goal.coachingTimings || 'None'}".
        The student wants to focus on this specific syllabus: "${goal.customSyllabus || 'The entire standard Class 10 CBSE syllabus'}".

        Your task is to create a balanced, effective, and realistic weekly study timetable for the next 7 days (Monday to Sunday).

        Instructions:
        1.  **Time Slots:** Create slots of 1-2 hours. Include short breaks (15-30 mins) between long study sessions.
        2.  **Balance Subjects:** Ensure all subjects are covered adequately throughout the week. Mix difficult and easy subjects.
        3.  **Variety of Activities:** Assign a mix of 'Study' (new topics), 'Revise' (past topics), 'Practice' (problem-solving), and include at least one 'Mock Test' or 'Daily Quiz' during the week.
        4.  **Cover Topics:** For each 'Study' session, mention a specific, manageable topic from the syllabus.
        5.  **Respect Constraints:** Do not schedule any study sessions during the student's fixed coaching timings.
        6.  **Realistic Schedule:** Ensure the schedule is not overly packed. Include time for meals and adequate sleep (e.g., end the day by 10 PM).
        7.  **Output Format:** The output MUST be a single valid JSON array of schedule items that adheres to the provided schema. Each item must have 'status' field set to 'Not Started' and 'important' field set to false. Do not output anything else.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: scheduleSchema,
        },
    });
    
    try {
        const jsonResponse = JSON.parse(response.text);
        if (!Array.isArray(jsonResponse)) {
             throw new Error("AI response was not a JSON array.");
        }
        return jsonResponse as ScheduleItem[];
    } catch (e) {
        console.error("Failed to parse schedule JSON:", e);
        console.error("Raw response:", response.text);
        throw new Error("Could not generate a valid study schedule. The AI returned an unexpected format.");
    }
};


const topicResourcesSchema = {
    type: Type.OBJECT,
    properties: {
        videos: {
            type: Type.ARRAY,
            description: "A list of relevant YouTube video resources.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    url: { type: Type.STRING }
                },
                required: ["title", "url"]
            }
        },
        notes: {
            type: Type.ARRAY,
            description: "A list of relevant articles or notes.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    url: { type: Type.STRING }
                },
                required: ["title", "url"]
            }
        },
        quiz: {
            type: Type.ARRAY,
            description: "A multiple-choice quiz with 4-5 questions.",
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING },
                    options: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    },
                    correctAnswer: { type: Type.STRING, description: "The exact string of the correct option." }
                },
                required: ["question", "options", "correctAnswer"]
            }
        },
        flashcards: {
            type: Type.ARRAY,
            description: "A list of 3-5 flashcards with a question and a concise answer.",
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING },
                    answer: { type: Type.STRING }
                },
                required: ["question", "answer"]
            }
        }
    },
    required: ["videos", "notes", "quiz", "flashcards"]
};

export const getTopicResources = async (subject: string, topic: string): Promise<TopicResourceSet> => {
    // Fix: Removed API key check as per guideline to assume it's pre-configured.
    
    const prompt = `
        You are an expert content curator for a Class 10 student in India following the CBSE curriculum.
        Your task is to find learning resources, create a revision quiz, and generate flashcards for the following topic.

        Subject: ${subject}
        Topic: ${topic}

        Instructions:
        1. Find 2-3 high-quality, relevant YouTube videos that explain this topic well for a Class 10 level.
        2. Find 2-3 high-quality, relevant articles or notes (like from Byju's, Toppr, or educational blogs) that can be used for studying.
        3. Create a multiple-choice revision quiz with 4 questions. Each question must have 4 options, and you must clearly indicate the correct answer. The correctAnswer must be an exact match to one of the options.
        4. Generate 3-5 flashcards covering the key concepts of the topic. Each flashcard should have a clear 'question' and a concise 'answer'.
        5. The output MUST be a single valid JSON object that adheres to the provided schema. Do not output anything else.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: topicResourcesSchema,
        },
    });

    try {
        const jsonResponse = JSON.parse(response.text);
        // Basic validation
        if (!jsonResponse.videos || !jsonResponse.notes || !jsonResponse.quiz || !jsonResponse.flashcards) {
            throw new Error("AI response is missing required resource fields.");
        }
        return { ...jsonResponse, flashcards: jsonResponse.flashcards || [] } as TopicResourceSet;
    } catch (e) {
        console.error("Failed to parse topic resources JSON:", e);
        console.error("Raw response:", response.text);
        throw new Error("Could not generate valid learning resources.");
    }
};

let chatInstance: Chat | null = null;

const getChatInstance = () => {
    if (!chatInstance) {
        chatInstance = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: `You are Schedulify AI, a supportive, engaging, and motivating chatbot tutor.
                Your primary roles are:
                1.  **Interactive Tutor:** Don't just give answers. Ask guiding questions to help the student arrive at the solution themselves. For example, if asked to solve a math problem, ask "What's the first step you would take?". Explain concepts step-by-step with analogies a Class 10 student would understand.
                2.  **Resource Finder:** If a student is struggling, use Google Search to find and recommend the best FREE learning resources like specific YouTube videos, Khan Academy pages, or open courseware. ALWAYS provide the source URLs.
                3.  **Motivator:** Be a study buddy! Use encouraging language. If a student says they're feeling tired or unmotivated, respond with a short motivational quote or a quick study tip. Remind them of their goals.
                4.  **Planner:** Answer questions about the study schedule and suggest adjustments if the student feels overwhelmed.
                5. **Gamification**: If asked, suggest fun ways to study, like turning revision into a game or a challenge.`,
            },
        });
    }
    return chatInstance;
};

export const getChatbotResponseStream = async (history: ChatMessage[], newMessage: string) => {
    const chat = getChatInstance();

    // Check if the user is asking for resources to decide whether to use search grounding
    const isResourceRequest = /resources|videos|articles|courses|explain|help with/i.test(newMessage);

    if (isResourceRequest) {
        // Use one-off generateContent with googleSearch for resource-heavy requests
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Based on our conversation history and my system instructions, answer this user message: "${newMessage}"`,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });
        
        const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
        const sources = groundingMetadata?.groundingChunks as GroundingSource[] | undefined;

        // Simulate a stream for consistency
        return {
            async *[Symbol.asyncIterator]() {
                yield { text: response.text, sources };
            },
        };

    } else {
         // Use the standard chat instance for conversational flow
        const result = await chat.sendMessageStream({ message: newMessage });

        return {
            async *[Symbol.asyncIterator]() {
                for await (const chunk of result) {
                    yield { text: chunk.text, sources: [] };
                }
            },
        };
    }
};

const breakActivitySchema = {
    type: Type.OBJECT,
    properties: {
        type: { type: Type.STRING, enum: ['Mindfulness', 'Puzzle', 'Creative', 'Physical'] },
        title: { type: Type.STRING },
        steps: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "An array of instructions. ONLY for 'Mindfulness' type." 
        },
        jumbledWord: { type: Type.STRING, description: "The scrambled word. ONLY for 'Puzzle' type." },
        hint: { type: Type.STRING, description: "A hint for the puzzle. ONLY for 'Puzzle' type." },
        answer: { type: Type.STRING, description: "The correct answer to the puzzle. ONLY for 'Puzzle' type." },
        description: { type: Type.STRING, description: "A brief description. ONLY for 'Creative' or 'Physical' types." }
    },
    required: ["type", "title"]
};

export const getBreakActivitySuggestion = async (category: BreakActivityType): Promise<BreakActivitySuggestion> => {
    const prompt = `
        You are an AI that suggests engaging 5-10 minute break activities for a student.
        The user has requested an activity from the category: "${category}".

        Your response MUST be a single JSON object that adheres to the provided schema.
        Based on the category, generate the following content:

        - If category is "Mindfulness":
          - Set "type" to "Mindfulness".
          - Create a "title" for a short guided breathing or mindfulness exercise.
          - Provide a "steps" array with 3-4 simple, clear instructions.

        - If category is "Puzzle":
          - Set "type" to "Puzzle".
          - Create a "title" like "Quick Word Jumble".
          - Create a common 6-8 letter English word, then provide its jumbled version as "jumbledWord".
          - Provide a simple "hint".
          - Provide the correct "answer".

        - If category is "Creative":
          - Set "type" to "Creative".
          - Create an encouraging "title".
          - Provide a "description" for a very simple, quick creative task (e.g., "Doodle the first thing that comes to your mind", "Try to write a two-sentence story about a robot.").

        - If category is "Physical":
          - Set "type" to "Physical".
          - Create a "title" for a simple stretch or light activity.
          - Provide a "description" of how to do the activity (e.g., "Stand up and do 5 gentle neck rolls in each direction.").

        Ensure you only fill the properties relevant to the chosen category. For example, for a "Puzzle", do not include a "steps" or "description" property.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash", 
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: breakActivitySchema,
        },
    });
    
    try {
        const jsonResponse = JSON.parse(response.text);
        if (!jsonResponse.type || !jsonResponse.title) {
            throw new Error("AI response is missing required fields.");
        }
        return jsonResponse as BreakActivitySuggestion;
    } catch (e) {
        console.error("Failed to parse break activity JSON:", e);
        console.error("Raw response:", response.text);
        throw new Error("Could not generate a valid break activity.");
    }
};