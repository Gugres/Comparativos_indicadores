const fs = require('fs');
const { resolve } = require('path');
const puppeteer = require('puppeteer');


/**
 * Crawl processos and generate json files with the result
 *
 * @param {String[]} processos List of processo's numbers
 */
async function crawlProcessos(processos = []) {
    if (Array.isArray(processos) && processos.length) {
        const browser = await puppeteer.launch({ headless: false, slowMo: 50 });
        const page = await browser.newPage();
        await page.goto('https://esaj.tjsp.jus.br/cpopg/open.do');

        for(let nrprocesso of processos) {
            const num1 = nrprocesso.substr(0, 15);
            const num2 = nrprocesso.substr(21, nrprocesso.length);
            const input1 = await page.$('input[name=numeroDigitoAnoUnificado]');
            await input1.click({ clickCount: 3 });
            await page.keyboard.press('Backspace');
            await input1.type(num1);
            const input2 = await page.$('input[name=foroNumeroUnificado]');
            await input2.click({ clickCount: 3 });
            await page.keyboard.press('Backspace');
            await input2.type(num2);

            input1.focus(); // This is important to activate change event of inputs

            await Promise.all([
                page.waitForNavigation({ waitUntil: 'load' }),
                page.$eval('input[name=pbEnviar]', btn => btn.click()),
            ]);

            const processo = await page.evaluate(() => {
                function removeInvalidChars(a) {
                    return a.replace(/([\n\t])/gi, '').trim();
                }

                const mainTables = document.querySelectorAll('.esajCelulaConteudoServico > table');

                if (mainTables.length) {
                    const dadosProcesso = document.querySelectorAll('.secaoFormBody')[1];
                    const tableBody = dadosProcesso.querySelectorAll('tr td:nth-child(2)');

                    const tabelaTodasPartes = document.querySelector('#tableTodasPartes');
                    const partesProcesso = tabelaTodasPartes || mainTables[0];
                    const partesList = {};
                    for(let row of partesProcesso.querySelectorAll('tr')) {
                        const tipoParte = row.querySelector('td:nth-child(1) span').textContent;
                        const parteValues = row.querySelector('td:nth-child(2)').textContent.replace(/[\n\t]/gi, '');
                        const partesSplitted = parteValues.split(/\b(Advogado|Advogada)\b/gi);
                        partesList[tipoParte] = {
                            nome: partesSplitted[0].trim(),
                            advogados: partesSplitted.slice(1, partesSplitted.length).map(a => a.trim())
                        }
                    }

                    const tabelaTodasMovimentacoes = document.querySelector('#tabelaTodasMovimentacoes');
                    const movimentacoesProcesso = tabelaTodasMovimentacoes || mainTables[1];
                    const movimentacoesList = {};
                    for(let row of movimentacoesProcesso.querySelectorAll('tr')) {
                        const dataMovimentacao = row.querySelector('td:nth-child(1)').textContent;
                        const movimentacaoText = row.querySelector('td:nth-child(3)').textContent;
                        movimentacoesList[removeInvalidChars(dataMovimentacao)] = removeInvalidChars(movimentacaoText);
                    }

                    const peticoesProcesso = mainTables[2]
                    const peticoesList = {}
                    for(let row of peticoesProcesso.querySelectorAll('tbody > tr')) {
                        const dataPeticao = row.querySelector('td:nth-child(1)').textContent;
                        const peticaoValue = row.querySelector('td:nth-child(2)').textContent;
                        peticoesList[removeInvalidChars(dataPeticao)] = removeInvalidChars(peticaoValue);
                    }

                    const incidentesProcessos = mainTables[3];
                    const incidentesList = {};
                    if (incidentesProcessos.querySelectorAll('tr').length > 0) {
                        for(let [i, row] of incidentesProcessos.querySelectorAll('tr').entries()) {
                            if (i > 1) {
                                const dataIncidente = row.querySelector('td:nth-child(1)').textContent;
                                const incidenteLink = row.querySelector('td:nth-child(2) a').getAttribute('href');
                                const incidenteValue = row.querySelector('td:nth-child(2) a').textContent;
                                if (dataIncidente != '' && incidenteValue != '') {
                                    incidentesList[removeInvalidChars(dataIncidente)] = {
                                        texto: removeInvalidChars(incidenteValue),
                                        link: incidenteLink
                                    }
                                }
                            }
                        }
                    }

                    return {
                        nrprocesso: removeInvalidChars(tableBody.item(0).textContent),
                        classe: removeInvalidChars(`${tableBody.item(1).textContent} - ${tableBody.item(2).textContent}`),
                        assunto: removeInvalidChars(tableBody.item(3).textContent),
                        localFisico: removeInvalidChars(tableBody.item(4).textContent),
                        distribuicao: removeInvalidChars(`${tableBody.item(5).textContent} / ${tableBody.item(6).textContent}`),
                        controle: removeInvalidChars(tableBody.item(7).textContent),
                        juiz: removeInvalidChars(tableBody.item(8).textContent),
                        outrosNumeros: removeInvalidChars(tableBody.item(9).textContent),
                        valor: removeInvalidChars(tableBody.item(10).textContent),
                        partes: partesList,
                        movimentacoes: movimentacoesList,
                        peticoes: peticoesList,
                        incidentes: incidentesList
                    }
                }

                return {}
            });

            try {
                if (processo.nrprocesso) {
                    fs.writeFileSync(resolve(__dirname, '../.tmp', `processo_${nrprocesso}.json`), JSON.stringify(processo));
                    console.log(`Processo ${nrprocesso} salvo`);
                } else {
                    console.log(`O processo: ${nrprocesso} não existe`);
                }
            } catch(err) {
                console.log(`Houve uma falha no processo ${nrprocesso}`);
                console.log(err);
            }
        }

        await browser.close();
        return;
    }
}

/**
 * Crawl a stock and generates a json file
 *
 * @param {string} stockName stock name
 */
async function crawlStock(stockName = null) {
    if (stockName != null) {
        const upperStockName = stockName.toLocaleUpperCase();
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto(`https://www.fundamentus.com.br/detalhes.php?papel=${upperStockName}`);

        const stockNotFoundRegex = /Nenhum papel encontrado/i;
        const found = (await page.content()).match(stockNotFoundRegex);

        if (found != null) {
            console.log(`stock ${upperStockName} not found`);
            return await browser.close();
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
                    for(const table of tableList) {
                        const columns = table.querySelectorAll('tr td.label, tr td.data');
                        if (columns) {
                            let key = '';
                            let index = 0;
                            for(const column of columns) {
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
            browser.close();
            throw new Error(err);
        }

        await browser.close();
        return stockInfo;
    }
}

module.exports = {
    crawlProcessos,
    crawlStock
};