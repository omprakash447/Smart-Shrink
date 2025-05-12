import express, { Request, Response } from "express";



const app=express();


app.get("/" , (_req:Request, res:Response)=>{
    res.send("hello world");
});


app.listen(4000,()=>{
    console.log("backend connected...");
});