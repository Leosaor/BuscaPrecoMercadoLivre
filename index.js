import puppeteer from "puppeteer";

const url = "https://www.mercadolivre.com.br/"
const search = "monitor ips"
let amountSearches = 0;

async function getPrice() {
    const browser = await puppeteer.launch();	
    const page = await browser.newPage();
    await page.goto(url);
    await page.waitForSelector('.nav-search-btn');
    await page.type('.nav-search-input', search);

    await Promise.all([
        page.waitForNavigation(),
        page.click('.nav-search-btn')
    ]);
    
    const products = await page.$$eval('.ui-search-result__image > a', el => el.map(item => item.href));

    let pagina = 0;
    for(const product of products) {
        if(pagina === amountSearches) continue;
        await page.goto(product);
        await page.waitForSelector('.ui-pdp-title');

        const title = await page.$eval('.ui-pdp-title', el => el.innerText);
        const price = await page.$eval('.andes-money-amount__fraction', el => el.innerText);
        const link = page.url();

        console.log({title, price, link});
        
        pagina++
    }

    await browser.close();
}

getPrice();
