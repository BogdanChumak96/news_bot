import { Translator } from 'deepl-node';
import dotenv from 'dotenv';
dotenv.config()

const authKey = process.env.DEEPL_API_KEY;

const translator = new Translator(authKey);

/**
 * Translates text using the DeepL API.
 * @param {string} text - The text to translate.
 * @param {string} targetLang - The target language code (e.g., 'fr', 'de', 'es').
 * @param {string|null} sourceLang - The source language code (optional, e.g., 'en'). Pass `null` to auto-detect.
 * @returns {Promise<{ translatedText: string, usage: { characterCount: number, characterLimit: number, documentCount: number, documentLimit: number } }>}
 */
export async function translateText(textForTranslate, targetLang, sourceLang = null) {
    try {

        const {text} = await translator.translateText(textForTranslate, sourceLang, targetLang);
        const usage = await translator.getUsage();
        return {
            translatedText: text,
            usage: {
                characterCount: usage.character?.count || 0,
                characterLimit: usage.character?.limit || 0,
                documentCount: usage.document?.count || 0,
                documentLimit: usage.document?.limit || 0,
            },
        };
    } catch (error) {
        console.error('Error during translation:', error.message || error);
        throw error;
    }
}
