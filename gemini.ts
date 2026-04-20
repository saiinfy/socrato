


import type { Question } from './types';
import { QuestionType } from "./types";

// Fix: Define a type for the questions returned by the AI. This mirrors the schema.
type AiGeneratedQuestion = Omit<Question, 'id' | 'type' | 'matchPairs' | 'correctAnswers' | 'organizerId' | 'organizerName' | 'creationTime'>;

// Fix: Define a type for the overall JSON response structure.
interface AiResponse {
    questions: AiGeneratedQuestion[];
}

const schema = {
    type: "OBJECT",
    properties: {
        questions: {
            type: "ARRAY",
            description: 'A list of generated quiz questions.',
            items: {
                type: "OBJECT",
                properties: {
                    text: { type: "STRING", description: 'The question text.' },
                    options: {
                        type: "ARRAY",
                        description: 'An array of exactly 4 possible answers.',
                        items: { type: "STRING" }
                    },
                    correctAnswerIndex: { type: "INTEGER", description: 'The 0-based index of the correct answer in the options array.' },
                    timeLimit: { type: "INTEGER", description: 'Time limit in seconds for the question. Default to 30 seconds.' },
                    technology: { type: "STRING", description: 'The main topic or technology of the question.' },
                    skill: { type: "STRING", description: 'The skill level or sub-topic.' }
                },
                required: ['text', 'options', 'correctAnswerIndex', 'timeLimit', 'technology', 'skill']
            }
        }
    },
    required: ['questions']
};


export async function generateQuestions(topic: string, skill: string, count: number): Promise<Omit<Question, 'id'>[]> {
    try {
        const prompt = `Generate ${count} unique, high-quality multiple-choice quiz questions for the topic "${topic}" at a "${skill}" skill level.
Each question must have exactly 4 options, with one clearly correct answer.
The position of the correct option must be randomized across questions (not always option 2 or 3).
The question text must not exceed 20 words, and each option must not exceed 10 words.
The technology tag should be "${topic}" and the skill tag should be "${skill}".
Assign a time limit of 30 seconds for each question.
Ensure the questions are distinct and cover different aspects of the topic.`;
        
        const response = await fetch("/api/ai/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "gemini-3-flash-preview",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: schema
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to generate questions via backend");
        }

        const data = await response.json();
        let rawText = data.text.trim();
        
        if (rawText.startsWith("```json")) {
          rawText = rawText.slice(7, -3).trim();
        }

        const jsonResult = JSON.parse(rawText) as unknown;
        
        let questionsList: AiGeneratedQuestion[] = [];

        if (typeof jsonResult === 'object' && jsonResult !== null) {
            if ('questions' in jsonResult && Array.isArray((jsonResult as AiResponse).questions)) {
                questionsList = (jsonResult as AiResponse).questions;
            } else if (Array.isArray(jsonResult)) {
                questionsList = jsonResult as AiGeneratedQuestion[];
            }
        }
        
        if (questionsList.length > 0) {
            const validatedQuestions = (questionsList as AiGeneratedQuestion[]).filter((q) => 
                q.text && Array.isArray(q.options) && q.options.length === 4 &&
                typeof q.correctAnswerIndex === 'number' && q.correctAnswerIndex >= 0 && q.correctAnswerIndex < 4
            );
            return validatedQuestions.map((q) => ({ ...q, type: QuestionType.MCQ, organizerId: 'ai' }));
        }
        return [];
    } catch (error: any) {
        console.error("Error generating questions via backend:", error);
        throw new Error(error.message || "Failed to generate questions with AI. Please check server logs.");
    }
}
