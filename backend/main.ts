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

// Connect to database with retry
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
      CREATE TABLE IF NOT EXISTS imageuploader (
        id SERIAL PRIMARY KEY,
        image_name VARCHAR(255) NOT NULL,
        image_data BYTEA NOT NULL,
        image_url VARCHAR(255),
        image_original_size BIGINT NOT NULL,
        image_compressed_size BIGINT NOT NULL,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Image schema is ensured for table 'imageuploader'");
  } catch (err) {
    console.error("Failed to create schema:", err);
    throw err;
  }
};

// Initialize database
const initializeDatabase = async () => {
  try {
    await connectWithRetry();
    await ImageSchema();
    // Verify table existence
    const result = await Connection.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'imageuploader'
      );
    `);
    const tableExists = result.rows[0].exists;
    console.log(`Table 'imageuploader' exists: ${tableExists}`);
    if (!tableExists) {
      throw new Error("Table 'imageuploader' was not created");
    }
  } catch (err) {
    console.error("Database initialization failed:", err);
    process.exit(1);
  }
};

initializeDatabase();

// Express setup
const app = express();
app.use(cors());
app.use(express.json());

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG and PNG images are allowed"));
    }
  },
});

app.get("/", (_req: Request, res: Response) => {
  res.status(200).send("Hello World!");
});

// Upload images to PostgreSQL with compression
app.post("/uploader", upload.single("file"), async (req: Request, res: Response): Promise<any> => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const file = req.file;
    const originalSize = file.size;
    // console.log("Received file:", file.originalname, file.size, file.type);

    let compressedBuffer;
    try {
      compressedBuffer = await sharp(file.buffer)
        .resize({ width: 800, fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();
    } catch (sharpErr) {
      console.error("Sharp processing failed:", sharpErr);
      return res.status(400).json({ error: "Failed to process image" });
    }

    const compressedSize = compressedBuffer.length;
    console.log("Compressed size:", compressedSize);

    try {
      await Connection.query(
        `INSERT INTO imageuploader (image_name, image_data, image_url, image_original_size, image_compressed_size)
         VALUES ($1, $2, $3, $4, $5)`,
        [file.originalname, compressedBuffer, "local-upload", originalSize, compressedSize]
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

// Get all compressed images from the database
app.get("/images-compress", async (_req: Request, res: Response) => {
  try {
    const result = await Connection.query(`
      SELECT id, image_name, image_data, image_original_size, image_compressed_size 
      FROM imageuploader
    `);
    const images = result.rows.map((row) => {
      const base64Image = Buffer.from(row.image_data).toString("base64");
      const mimeType = "image/jpeg";
      return {
        id: row.id,
        filename: row.image_name,
        url: `data:${mimeType};base64,${base64Image}`,
        originalSize: row.image_original_size,
        compressedSize: row.image_compressed_size,
      };
    });

    res.status(200).json(images);
  } catch (err) {
    console.error("Failed to fetch images:", err);
    res.status(500).json({ error: "Failed to fetch images" });
  }
});

// Download a compressed image by ID
app.get("/download/:id", async (req: Request, res: Response):Promise<any> => {
  try {
    const { id } = req.params;
    const result = await Connection.query(
      `SELECT image_name, image_data FROM imageuploader WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Image not found" });
    }

    const { image_name, image_data } = result.rows[0];
    const mimeType = image_name.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg";

    res.setHeader("Content-Type", mimeType);
    res.setHeader("Content-Disposition", `attachment; filename="${image_name}"`);
    res.send(image_data);
  } catch (err) {
    console.error("Failed to download image:", err);
    res.status(500).json({ error: "Failed to download image" });
  }
});

// Server start
app.listen(4000, () => {
  console.log("Server is running on port 4000...");
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("Shutting down...");
  await Connection.end();
  process.exit(0);
});