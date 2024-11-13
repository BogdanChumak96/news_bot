async function scrollPage(page) {
    await page.evaluate(() => window.scrollBy(0, window.innerHeight + 10000));
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return page.evaluate(() => document.body.scrollHeight);
}

async function extractArticles(page) {
    return page.evaluate(() => {
        return Array.from(document.querySelectorAll('article'))
            .map((article) => {
                const titleElement = article.querySelector('h3');
                const linkElement = article.querySelector('a[title]');
                const tagsElements = article.querySelectorAll(
                    '.rounded-8.border.border-border-subtlest-tertiary.px-2.h-6.flex.items-center.justify-center.typo-footnote.text-text-quaternary.my-2'
                );

                const title = titleElement ? titleElement.textContent.trim() : null;
                const link = linkElement ? linkElement.href : null;
                const tags = Array.from(tagsElements).map((tagElement) => tagElement.textContent.trim());

                return title && link ? { title, link, tags } : null;
            })
            .filter((article) => article !== null);
    });
}

function addUniqueArticles(existingArticles, newArticles, counter) {
    const uniqueArticles = newArticles.filter(
        (article) => !existingArticles.some((existing) => existing.link === article.link)
    );

    uniqueArticles.forEach((article) => {
        article.number = counter.value++;
    });

    return [...existingArticles, ...uniqueArticles];
}

export async function loadArticles(page, limit) {
    let articles = [];
    let lastHeight = 0;
    let counter = { value: 1 };

    while (articles.length < limit) {
        const newArticles = await extractArticles(page);

        articles = addUniqueArticles(articles, newArticles, counter);

        if (articles.length >= limit) break;

        const newHeight = await scrollPage(page);
        if (newHeight === lastHeight) break;
        lastHeight = newHeight;
    }

    return articles.slice(0, limit);
}
