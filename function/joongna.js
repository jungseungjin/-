import puppeteer from "puppeteer";

const joongna = async(browser,item, pages) => {
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
                await page.goto(`https://web.joongna.com/search?keyword=${encodeURIComponent(item)}&page=${query_page}`, {waitUntil: 'networkidle2'});
            
                //검색결과가 있는지 확인
                //중고나라는 "해당 카테고리에 대한 상품 검색 결과가 없습니다." 문구가 잠시 보였다가 데이터가 불러와지면서 사라진다.
                const result_selector = '#__next > div > div.container > div > div.ant-col.ant-col-20.css-t77d8m > div'
                const result_is_null = result_selector + '.css-12qh485'//"해당 카테고리에 대한 상품 검색 결과가 없습니다." 문구가 있는 div 
                const result_container_selector = result_selector + '.ant-row.listWrap.css-euacx > div'//검색결과
                const result_count_selector = result_selector + '.css-bypya4 > div'//검색결과 갯수가 표시되는 div. 0이었다가 데이터가 불러와지면서 값이 수정됨.
        
        
                await page.waitForSelector(result_count_selector,{visible:true})
        
                //result_container_selector 셀렉터를 찾지 못하면 등록된 상품이 없다고 판단 -> 에러발생하고 끝냄
                await page.waitForSelector(result_container_selector,{visible:true,timeout:1000})
                
                //result_container_selector 셀렉터를 찾음 -> 검색결과가 있다고 판단
                //result_container_selector 셀렉터의 갯수만큼 for문으로 제품의 정보를 가져온다.
                const data_length = (await page.$$(result_container_selector)).length
                for(let i = 1; i < data_length+1; i++){
                    try{
                        const article_selector = result_container_selector + `:nth-child(${i})`
                        const href_selector = article_selector + ' > a'
                        const img_selector = article_selector + ' > a > div > div.thumbWrap > div > img'
                        const title_selector = article_selector + ' > a > div > div.titleTxt > span'
                        const price_selector = article_selector + ' > a > div > div.priceTxt'
                        const article = {
                            href : 'https://web.joongna.com' + await page.$eval(href_selector,el=>el.getAttribute("href")),
                            imgAlt : await page.$eval(img_selector,el=>el.getAttribute("alt")),
                            imgSrc : await page.$eval(img_selector,el=>el.getAttribute("src")),
                            title : await page.$eval(title_selector,el=>el.textContent),
                            price : await page.$eval(price_selector,el=>el.textContent),
                        }
                        
                        try{
                        // a > div > div.registInfo > span:nth-child(1) // 주소일때도 등록시간일때도 있음
                        // a > div > div.registInfo > span:nth-child(2) // 있으면 시간임 
                            const check_selector = article_selector + ' > a > div > div.registInfo > span:nth-child(2)'
                            await page.waitForSelector(check_selector,{visible:true,timeout:10})
                            const address_selector = article_selector + ' > a > div > div.registInfo > span:nth-child(2)'
                            const regDate_selector = article_selector + ' > a > div > div.registInfo > span:nth-child(2)'
                            article.address = await page.$eval(address_selector,el=>el.textContent)
                            article.regDate = await page.$eval(regDate_selector,el=>el.textContent)
                        }catch(err){
                            const regDate_selector = article_selector + ' > a > div > div.registInfo > span:nth-child(1)'
                            article.regDate = await page.$eval(regDate_selector,el=>el.textContent)
                        }
                        data.push(article)     
                    }catch(err){
                    } 
                }
                query_page+=1;
            }catch(err){
                
            }
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

export default joongna