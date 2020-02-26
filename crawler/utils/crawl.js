const puppeteer = require('puppeteer');

/**
 * Crawl a stock and generates a json file
 *
 * @param {string} stockList stock name
 * @param {any} logger AMQP logger
 */
async function crawlStock(stockList = [], logger) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const stockListCrawled = [];
  for(const stockName of stockList) {
    if (typeof stockName === 'string') {
      if (stockName != null) {
        logger.debug(`crawl stock: ${stockName}`);
        const upperStockName = stockName.toLocaleUpperCase();
        await page.goto(`https://www.fundamentus.com.br/detalhes.php?papel=${upperStockName}`);

        const stockNotFoundRegex = /Nenhum papel encontrado/i;
        const found = (await page.content()).match(stockNotFoundRegex);

        if (found != null) {
          stockListCrawled.push({ error: `stock ${upperStockName} not found` });
        }

        let stockInfo = {};
        try {
          stockInfo = await page.evaluate(() => {
            function removeInvalidChars(a) {
              return a.replace(/([\n\t])/gi, '').trim();
            }

            const scrappedInfo = {};
            const tableList = document.querySelectorAll('table.w728');
            if (tableList) {
              for (const table of tableList) {
                const columns = table.querySelectorAll('tr td.label, tr td.data');
                if (columns) {
                  let key = '';
                  let index = 0;
                  for (const column of columns) {
                    const text = column.querySelector('span.txt');
                    if (text) {
                      const textContent = removeInvalidChars(text.textContent);
                      if (index % 2 == 0) {
                        key = textContent;
                      } else {
                        scrappedInfo[key] = textContent;
                      }
                    }
                    index++;
                  }
                }
              }
            }
            return scrappedInfo;
          })
        } catch (err) {
          logger.error(err);
          continue;
        }

        stockListCrawled.push(stockInfo);
      }
    }
  }

  await browser.close();
  return stockListCrawled;
}

module.exports = {
  crawlStock
};