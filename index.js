import express from "express";
import daangn from './function/daangn.js'

const app = express()


app.get("/",(req,res)=>{
    res.send("Hello world")
})

app.get("/:item",async(req,res)=>{
    try{
        const item = req.params.item
        const [daangn_data] =  await Promise.all([
            daangn(item,5)
        ])
        console.log(daangn_data)
    }catch(err){
        console.log(err)
    }
})

app.listen(3000)