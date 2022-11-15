
import puppeteer from 'puppeteer';

const daangn = async(item,pages) => {
    try{
        const browser = await puppeteer.launch({headless: true});
        const page = await browser.newPage();
      
        await page.goto(`https://www.daangn.com/search/${item}`, {waitUntil: 'networkidle2'});
        
        //중고거래 물품이 있는 단어인지 확인
        const result_container_selector = '#flea-market-wrap > p'
        await page.waitForSelector(result_container_selector,{visible:true})
        const title = await page.$eval(result_container_selector,el=>el.textContent)
        if(title !== '중고거래'){
            throw Error;
        }

        //중고거래 물품이 있으면 크롤링 진행
        const more_btn_selector = '#result > div:nth-child(1) > div.more-btn'
        await page.waitForSelector(more_btn_selector,{visible:true})

        let data_total_page = await page.$eval(more_btn_selector,el=>el.getAttribute("data-total-pages"));
        
        //여러 페이지가 있으면 여러 페이지를 가져온다.
        while(parseInt(data_total_page) > 0 && pages > 0){
            data_total_page = parseInt(data_total_page) - 1;
            pages-=1;
            await page.waitForSelector(more_btn_selector)
            await page.waitForTimeout(1000)
            await page.click(more_btn_selector)
        }
        await page.waitForTimeout(1000)
        
        //게시글 크롤링
        const data_selector = '#flea-market-wrap > article'
        const data_length = (await page.$$(data_selector)).length
        const data = []
        for(let i = 2; i < data_length+2 ; i++){
            const article_selector = data_selector + `:nth-child(${i}) > a`
            const article_image_selector = article_selector + ' > div > img'
            const article_info_selector = article_selector + ' > .article-info'
            const article_title_content_selector = article_info_selector + ' > .article-title-content'
            
            // const href = await page.$eval(article_selector,el=>el.getAttribute("href"))
            // const imgAlt = await page.$eval(article_image_selector,el=>el.getAttribute("alt"))
            // const imgSrc = await page.$eval(article_image_selector,el=>el.getAttribute("src"))
            // const title = await page.$eval(article_title_content_selector + ' > .article-title',el=>el.textContent)
            // const content = await page.$eval(article_title_content_selector + ' > .article-content',el=>el.textContent)
            // const address = await page.$eval(article_info_selector + ' > .article-region-name',el=>el.textContent)
            // const price = await page.$eval(article_info_selector + ' > .article-price',el=>el.textContent)
            const article = {
                href : 'https://www.daangn.com' + await page.$eval(article_selector,el=>el.getAttribute("href")),
                imgAlt : await page.$eval(article_image_selector,el=>el.getAttribute("alt")),
                imgSrc : await page.$eval(article_image_selector,el=>el.getAttribute("src")),
                title : await page.$eval(article_title_content_selector + ' > .article-title',el=>el.textContent),
                content : await page.$eval(article_title_content_selector + ' > .article-content',el=>el.textContent),
                address : await page.$eval(article_info_selector + ' > .article-region-name',el=>el.textContent),
                price : await page.$eval(article_info_selector + ' > .article-price',el=>el.textContent)
            }
            data.push(article)
        }
        return{
            success:true,
            data
        }
    }catch(err){
        return {
            success:false,
            err
        }
    }

}

export default daangn