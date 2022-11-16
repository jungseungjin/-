import express from "express"
import puppeteer from 'puppeteer'


import daangn from './function/daangn.js'
import joongna from './function/joongna.js'
import bunjang from './function/bunjang.js'

const app = express()


app.get("/",(req,res)=>{
    res.send("Hello world")
})

app.get("/:item",async(req,res)=>{
    try{
        const item = req.params.item
        
        const browser = puppeteer.launch({headless: true});
        const [daangn_data,joongna_data,bunjang_data] =  await Promise.all([
            daangn(browser,item,5),//더보기를 몇번 누를 것인지
            joongna(browser,item,2),//몇 페이지까지 정보를 가져올 것인지
            bunjang(browser,item,2)
        ])
        return res.json({
            daangn_data,joongna_data,bunjang_data
        })
    }catch(err){
        console.log(err)
    }
})

app.listen(3000)