import puppeteer from 'puppeteer';
import { translateText } from '../translator/index.js';

/**
 * Extracts the full text from the page.
 * @param {puppeteer.Page} page - Puppeteer page instance.
 * @returns {Promise<string | null>} - The full text of the article.
 */
async function extractFullText(page) {
    try {
        return await page.evaluate(async () => {
            const tldrElement = document.querySelector('.select-text.break-words.typo-body');
            if (!tldrElement) return null;

            let text = tldrElement.innerText.trim();

            const showMoreButton = tldrElement.querySelector('button');
            if (showMoreButton) {
                showMoreButton.click();
                await new Promise((resolve) => setTimeout(resolve, 2000));
                text = tldrElement.innerText.trim();
            }

            return text.replace('TLDR', '').replace('Show less', '').trim();
        });
    } catch (error) {
        console.error('Error while fetching full text:', error);
        return null;
    }
}

/**
 * Extracts the likes and comments of the article.
 * @param {puppeteer.Page} page - Puppeteer page instance.
 * @returns {Promise<{ likes: string, comments: string }>} - The likes and comments data.
 */
async function extractLikesAndComments(page) {
    return page.evaluate(() => {
        const ratingElement = document.querySelector('.mb-5.flex.items-center.gap-x-4.text-text-tertiary.typo-callout');
        let likes = '0 Upvotes';
        let comments = '0 Comments';

        if (ratingElement) {
            const likesElement = ratingElement.querySelector('button');
            const commentsElement = ratingElement.querySelector('span');
            if (likesElement) likes = likesElement.innerText.trim();
            if (commentsElement) comments = commentsElement.innerText.trim();
        }

        return { likes, comments };
    });
}

/**
 * Extracts the video URL if present in an <iframe> element.
 * @param {puppeteer.Page} page - Puppeteer page instance.
 * @returns {Promise<string | null>} - The video URL or null if not found.
 */
async function extractVideoUrl(page) {
    return page.evaluate(() => {
        const iframeElement = document.querySelector('iframe[src*="youtube"]');
        return iframeElement ? iframeElement.src : null;
    });
}

/**
 * Scrapes article details including title, full text, cover image, likes, comments, and video URL.
 * @param {string} url - The URL of the article to scrape.
 * @returns {Promise<{translatedTitle: string, translatedFullText: string, image: string, likes: string, comments: string, video: string | null}>} - Article details.
 */
export async function scrapePostDetails(url) {
    if (!url) {
        throw new Error('URL is required.');
    }

    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        await page.goto(url, { waitUntil: 'networkidle2' });

        // Extract the title
        const title = await page.evaluate(() => {
            const titleElement = document.querySelector('.max-w-full.shrink.truncate');
            return titleElement ? titleElement.textContent.trim() : null;
        });

        const fullText = await extractFullText(page);

        const image = await page.evaluate(() => {
            const imageElement = document.querySelector('img[alt="Post cover image"]');
            return imageElement ? imageElement.src : 'No Image';
        });

        const { likes, comments } = await extractLikesAndComments(page);

        const video = await extractVideoUrl(page);

        const translatedTitle = title ? (await translateText(title, 'RU')).translatedText : null;
        const translatedFullText = fullText ? (await translateText(fullText, 'RU')).translatedText : null;
        
        return { translatedTitle, translatedFullText, image, likes, comments, video };
    } catch (error) {
        console.error('Error while scraping post details:', error);
        throw new Error('Failed to scrape the post details.');
    }
}