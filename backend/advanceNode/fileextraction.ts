import cors from "cors";
import express, { Request, Response } from "express";
import fileUpload from "express-fileupload";
import PdfParse from "pdf-parse";




const app=express();
app.use(cors());
app.use(fileUpload());


app.post("/uplode",async(req:Request , res:Response):Promise<any>=>{
    try{
        // if (
        //     !req.files ||
        //     typeof req.files !== "object" ||
        //     !("pdf" in req.files)
        // ) {
        //     return res.status(400).json({ error: "No file uploaded" });
        // }

        // const PDF = ((req.files as unknown) as FileArray).pdf as UploadedFile;


        // const parsed=await PdfParse(PDF.data);
        // return res.status(200).json({text:parsed.text});




        // easy steps to extracts
        

        const reqfile=req.files?.pdf
        if(!reqfile || Array.isArray(reqfile)){
            return res.status(400).json({error:"No file uploaded"});
        }
        // console.log(reqfile);
        const parse=await PdfParse(reqfile.data);
        return res.status(200).json({text:parse.text});
        
        
    }catch(err){
        return res.status(500).json({error:"Internal server error"})
    }
})



app.listen(5000,()=>{
    console.log("Server is running on port 5000");
})