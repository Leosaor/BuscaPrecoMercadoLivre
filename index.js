import puppeteer from "puppeteer";
import fs from "fs";

const url = "https://www.mercadolivre.com.br/"
let search = process.argv[2] || null; 
let amountSearches = process.argv[3] || 5;

async function getPrice() {
    amountSearches = Number(amountSearches);
    if(search === null) {
        console.log("Por favor, informe o produto que deseja pesquisar. Use + para separar as palavras.");
        console.log("Exemplo: node index.js (buscar+produto) (quantidade)");
        return;
    }
    if(isNaN(amountSearches) || amountSearches > 48 || amountSearches < 1) {
        console.log("Por favor, informe a quantidade de produtos que deseja pesquisar, entre 1 e 48.");
        console.log("Exemplo: node index.js (buscar+produto) (quantidade)");
        return;
    }
    search = search.replace(/\+/g, " ");
    const browser = await puppeteer.launch({headless: false});	
    const page = await browser.newPage();
    await page.goto(url);
    await page.waitForSelector('.nav-search-btn');
    await page.type('.nav-search-input', search);
    await Promise.all([
        page.waitForNavigation(),
        page.click('.nav-search-btn')
    ]);

    const products = await page.$$eval('.ui-search-result__image > a', el => el.map(item => item.href));
    
    let arrayProducts = [];
    let link = 0;

    for(const product of products) {
        if(link === amountSearches) continue;
        await page.goto(product);
        await page.waitForSelector('.ui-pdp-title');
        
        const title = await page.$eval('.ui-pdp-title', el => el.innerText);
        const price = await page.$eval('.andes-money-amount__fraction', el => el.innerText);
        const priceNumber = Number(price.replace(".", ""));
        const url = page.url();

        arrayProducts.push({ title, priceNumber, url });
        
        link++;
    }
    arrayProducts.sort((a, b) => a.priceNumber - b.priceNumber);
    fs.writeFile('products.json', JSON.stringify(arrayProducts), function (err) { 
        if (err) throw err;
        console.log('Produto adicionado!');
    });
    await browser.close();
}

getPrice();
