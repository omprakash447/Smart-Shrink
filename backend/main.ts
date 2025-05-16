import cors from "cors";
import express, { Request, Response } from "express";
import multer from "multer";
import { Client } from "pg";
import sharp from "sharp";

// PostgreSQL connection
const Connection = new Client({
    user: "postgres",
    host: "localhost",
    database: "smartshrink",
    password: "mysqlpass",
    port: 5432,
});

// Connect to database 
const connectWithRetry = async (retries = 5, delay = 5000) => {
    for (let i = 0; i < retries; i++) {
        try {
            await Connection.connect();
            console.log("Database connected...");
            return;
        } catch (err) {
            console.error(`Connection attempt ${i + 1} failed:`, err);
            if (i < retries - 1) {
                console.log(`Retrying in ${delay / 1000} seconds...`);
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
    }
    console.error("Failed to connect to database after retries");
    process.exit(1);
};

// Create schema 
const ImageSchema = async () => {
    try {
        await Connection.query(`
      CREATE TABLE IF NOT EXISTS ImageUploader (
        id SERIAL PRIMARY KEY,
        image_name VARCHAR(255) NOT NULL,
        image_data BYTEA NOT NULL,
        image_url VARCHAR(255),
        // image_original_size BIGINT NOT NULL,
        // image_compressed_size BIGINT NOT NULL,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log("Image schema is ensured...");
    } catch (err) {
        console.error("Failed to create schema:", err);
        throw err;
    }
};

export default ImageSchema;

// database
const initializeDatabase = async () => {
    await connectWithRetry();
    await ImageSchema();
};

initializeDatabase().catch((err) => {
    console.error("Database initialization failed:", err);
    process.exit(1);
});

// Express 
const app = express();
app.use(cors());
app.use(express.json());

// mukter declaration
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
});


app.get("/", (_req: Request, res: Response) => {
    res.status(200).send("Hello World!");
});



// uplode the images to postgres database with the image compressor...
app.post("/uploader", upload.single("file"), async (req: Request, res: Response): Promise<any> => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No image uploaded" });
        }
        // before compress
        // const originalSize=file.size;


        const { originalname, buffer } = req.file;

        let compressBuffer;
        try {
            compressBuffer = await sharp(buffer)
                .resize({ width: 800, fit: "inside", withoutEnlargement: true })
                .jpeg({ quality: 80 })
                .toBuffer();
        } catch (sharpErr) {
            console.error("Sharp processing failed:", sharpErr);
            return res.status(400).json({ error: "Failed to process image" });
        }

        // after compress
        // const compressedSized=compressBuffer.length;
        await ImageSchema();

        try {
            await Connection.query(
                `INSERT INTO ImageUploader (image_name, image_data, image_url , originalSize ,compressedSized ) VALUES ($1, $2, $3 , $4 , $5)`,
                [originalname, compressBuffer, "local-upload" , /*originalSize , compressedSized */]
            );
        } catch (dbErr) {
            console.error("Database insert failed:", dbErr);
            return res.status(500).json({ error: "Failed to save image to database" });
        }

        res.status(200).json({ message: "Image uploaded successfully" });
    } catch (err) {
        console.error("Upload failed:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});



// get the all the images from the database...
app.get("/images-compress", async (_req: Request, res: Response) => {
    try {
        const result = await Connection.query(`
      SELECT id, image_name, image_data, original_size, compressed_size 
      FROM ImageUploader
    `);
        const images = result.rows.map((row) => {
            const base64Image = Buffer.from(row.image_data).toString("base64");
            const mimeType = "image/jpeg";
            return {
                id: row.id,
                filename: row.image_name, // Use "filename" to match frontend
                url: `data:${mimeType};base64,${base64Image}`,
                originalSize: row.originalSize, // Ensure column exists in DB
                compressedSize: row.compressedSized, // Ensure column exists in DB
            };
        });

        res.status(200).send(images);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Failed to fetch images" });
    }
});

// server
app.listen(4000, () => {
    console.log("Server is running on port 4000...");
});

//termination
process.on("SIGTERM", async () => {
    console.log("Shutting down...");
    await Connection.end();
    process.exit(0);
});