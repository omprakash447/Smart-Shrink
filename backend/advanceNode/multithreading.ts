// how to handel the multi-threading in node
// ----------------------------------------------


// ANS-in the node js it is by default is single threaded , but if we want to access the multiple
// thread in the node js file then we will wse the worker_threades for manageing the multiple threads.
// so by this way we can achive the multithreading....

import express, { Request, Response } from "express";
import path from "path";
import { Worker } from "worker_threads";
const paths=path.join(__dirname,"../advanceNode/worker");


const app=express();



app.get("/blocking",(_req:Request , res:Response)=>{
    const worker=new Worker(paths);
    worker.on("message",(data)=>{
        res.status(200).send(`the counter is tbe ${data}`);
    });
    worker.on("error",(err)=>{
        res.status(404).send({message:err});
    })
});


app.get("/non-blocking",(_req:Request , res:Response)=>{
    res.status(200).send("it is the non-blocking part");
});



app.listen(1000,()=>{
    console.log("connected...");
});

