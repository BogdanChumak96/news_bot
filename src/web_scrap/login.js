
export const login =async (email, password, page) =>{
    try {
        await page.waitForSelector('button.btn-secondary');
        await page.click('button.btn-secondary');

        await page.waitForSelector('button[type="submit"]');

        await page.type('input[name="identifier"]', email);
        await page.type('input[name="password"]', password);

        await page.waitForFunction(
            () => {
                const btn = document.querySelector('button[type="submit"]');
                return btn && btn.getAttribute('aria-busy') === 'false';
            },
            { timeout: 1000 }
        );

        await page.click('button[type="submit"]');

        await page.evaluate(() => {
            const link = document.querySelector('a[href="/"]');
            if (link) {
                link.click();
            }
        });
        return
    } catch (error) {
        throw new Error('Failed to login.');
    }
}