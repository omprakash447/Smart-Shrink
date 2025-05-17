// how to handel the multi-threading in node
import express, { Request, Response } from "express";
// import { Worker } from "worker_threads";
const {Worker} =require("worker_threads");




const app=express();


app.get("/non-blocking" , async(_req:Request , res:Response):Promise<any>=>{
    try{
        res.status(200).send("it is non-blocking");
    }catch(err){
        return res.status(404).send(err);
    }
});


app.get("/blocking",async(_req:Request , res:Response):Promise<any>=>{
    try{
        const worker=new Worker("./advanceNode/worker.ts");

        worker.on("message" , (data:any)=>{
            res.status(200).send(`counter is ${data}`);
        })
        worker.on("error" , (err:any)=>{
            res.status(404).send(`error is occurred due to ${err}`);
        })
        // res.status(200).send(`counter is ${counter}`);
    }catch(err){
        return res.status(404).send("error..")
    }
})


app.listen(3000,()=>{
    console.log("backend activated...");
});

