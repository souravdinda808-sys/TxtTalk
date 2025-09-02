import { GoogleGenAI } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const extractTextFromImage = async (base64ImageData: string): Promise<string> => {
    try {
        const imagePart = {
            inlineData: {
                mimeType: 'image/jpeg',
                data: base64ImageData,
            },
        };
        const textPart = {
            text: "Extract all text from this image. Provide only the transcribed text, without any additional comments or formatting."
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
        });

        return response.text;
    } catch (error) {
        console.error("Error extracting text from image:", error);
        if (error instanceof Error) {
            return `Error: ${error.message}`;
        }
        return "An unknown error occurred while processing the image.";
    }
};

export const translateText = async (text: string, sourceLang: string, targetLang: string): Promise<string> => {
    try {
        const sourceLanguageName = sourceLang === 'auto' ? 'auto-detect' : sourceLang;
        const prompt = `Translate the following text from ${sourceLanguageName} to ${targetLang}. Provide only the translated text, without any additional comments or formatting.\n\nText: "${text}"`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error translating text:", error);
        if (error instanceof Error) {
            return `Error: ${error.message}`;
        }
        return "An unknown error occurred during translation.";
    }
};
