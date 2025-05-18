// how to handel the multi-threading in node
// ----------------------------------------------


// ANS-in the node js it is by default is single threaded , but if we want to access the multiple
// thread in the node js file then we will wse the worker_threades for manageing the multiple threads.
// so by this way we can achive the multithreading....














import express, { Request, Response } from "express";
import { Worker } from "worker_threads";
// const {Worker} =require("worker_threads");




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

        worker.on("message" , (data)=>{
            res.status(200).send(`counter is ${data}`);
        })
        worker.on("error" , (err)=>{
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

