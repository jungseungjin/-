import puppeteer from "puppeteer";

const bunjang = async(browser,item, pages) => {
    const instance = await browser;
    const page = await instance.newPage();
    try{
        await page.setViewport({
            width: 1920,
            height: 2560,
            deviceScaleFactor: 1,
        });
        let query_page = 1
        const data = []
        while(pages > 0){//원하는 페이지 갯수만큼 검색
            try{
                pages-=1;
                await page.goto(`https://m.bunjang.co.kr/search/products?q=${encodeURIComponent(item)}&page=${query_page}`, {waitUntil: 'networkidle2'});
                //검색결과가 있는지 확인
                const result_selector = '#root > div > div > div:nth-child(4) > div > div.sc-yZwTr.kVXWCo > div > div.sc-fjhmcy.ecPlds'
                const result_container_selector = '#root > div > div > div:nth-child(4) > div > div.sc-lnmtFM.dYMRID > div > div'
                await page.waitForSelector(result_selector,{visible:true})
                await page.waitForSelector(result_container_selector,{visible:true,timeout:3000})

                //result_container_selector 셀렉터를 찾음 -> 검색결과가 있다고 판단
                //result_container_selector 셀렉터의 갯수만큼 for문으로 제품의 정보를 가져온다.
                const data_length = (await page.$$(result_container_selector)).length
                for(let i = 1; i < data_length+1; i++){
                    try{
                        const article_selector = result_container_selector + `:nth-child(${i})`
                        const href_selector = article_selector + ' > a'
                        const img_selector = article_selector + ' > a > div.sc-kaNhvL > img'
                        const title_selector = article_selector + ' > a > div.sc-LKuAh > div.sc-iBEsjs'
                        const regDate_selector = article_selector + ' > a > div.sc-LKuAh div.sc-kxynE > div:nth-child(2) > span'
                        const price_selector = article_selector + ' > a > div.sc-LKuAh > div.sc-kxynE > div'
                        const address_selector = article_selector + ' > a > div.sc-chbbiW'
                        const article = {
                            href : 'https://m.bunjang.co.kr' + await page.$eval(href_selector,el=>el.getAttribute("href")),
                            imgAlt : await page.$eval(img_selector,el=>el.getAttribute("alt")),
                            imgSrc : await page.$eval(img_selector,el=>el.getAttribute("src")),
                            title : await page.$eval(title_selector,el=>el.textContent),
                            address : await page.$eval(address_selector,el=>el.textContent),
                            price : await page.$eval(price_selector,el=>el.textContent),
                            regDate : await page.$eval(regDate_selector,el=>el.textContent)
                        }
                        data.push(article)     
                    }catch(err){
                    } 
                }
            }catch(err){

            }
            query_page+=1;
        }
        await page.close();
        return{
            success:true,
            data
        }
    }catch(err){
        console.log(err)
        await page.close();
        return {
            success:false,
            err
        }
    }
}

export default bunjang