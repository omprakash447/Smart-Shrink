import bcrypt from "bcrypt";
import cors from "cors";
import express, { Request, Response } from "express";
import JWT from "jsonwebtoken";
import multer from "multer";
import { Client } from "pg";
import sharp from "sharp";


const SEC_KEY = "smartshrink@password";

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
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        uploaded_by VARCHAR(225) NOT NULL
      );
    `);
    console.log("Image schema is ensured for table 'imageuploader'");
  } catch (err) {
    console.error("Failed to create schema:", err);
    throw err;
  }
};
const AuthSchema = async () => {
  try {
    await Connection.query(`
CREATE TABLE IF NOT EXISTS authentication (
  id SERIAL PRIMARY KEY,
  userName VARCHAR(225) NOT NULL,
  email VARCHAR(225) NOT NULL,
  password VARCHAR(225) NOT NULL
);

    `);
    console.log("Auth schema is created");
  } catch (err) {
    console.error("Failed to create schema:", err);
    throw err;
  }
};
AuthSchema();

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





// signup
app.post("/signup-backend", async (req: Request, res: Response): Promise<any> => {
  try {
    const { userName, email, password } = req.body;
    const result = await Connection.query(
      `SELECT * FROM authentication WHERE email = $1`, [email]
    );
    if (result.rows.length > 0) {
      return res.status(400).send({ message: "Email already exists" });
    }
    const hashPassword = await bcrypt.hash(password, 10);

    const insertResult = await Connection.query(
      `INSERT INTO authentication (userName, email, password) VALUES($1, $2, $3) RETURNING *`,
      [userName, email, hashPassword]
    );
    return res.status(201).send({
      message: "User signed up successfully",
      user: insertResult.rows[0],
    });
  } catch (err: any) {
    console.error("Signup error:", err);
    return res.status(500).send({ error: "Internal server error", details: err.message });
  }
});
// login
app.post("/login-backend", async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;
    const result = await Connection.query(`select * from authentication where email=$1`, [email]);
    if (result.rows.length === 0) {
      return res.status(400).send({ message: "Email not found" });
    }
    const isValidpass = await bcrypt.compare(password, result.rows[0].password);
    if (!isValidpass) {
      return res.status(400).send({ message: "Invalid password" });
    }
    // generate the token for auth
    const token = JWT.sign(
      { email: result.rows[0].email },
      SEC_KEY,
      { expiresIn: "1h" }
    );
    return res.status(200).send({ message: "Login successful", token });
  } catch (err) {
    return res.status(404).send(err);
  }
});
// get only loggedin user
app.get("/get-loggedin-user", async (req: Request, res: Response): Promise<any> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }
    const token = authHeader.split(" ")[1];
    const decoded: any = JWT.verify(token, SEC_KEY);
    const result = await Connection.query(`select * from authentication where email=$1`, [decoded.email]);
    return res.status(200).send(result.rows[0]);
  } catch (err: any) {
    console.error(err);
    res.status(401).json({ message: "Invalid or expired token", error: err.message });
  }
});


































// Upload images to PostgreSQL with compression
interface JwtPayload {
  email: string;
  iat?: number;
  exp?: number;
}

app.post("/uploader", upload.single("file"), async (req: Request, res: Response): Promise<any> => {
  try {
    // Inline token verification
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("No token provided");
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];
    let decoded: JwtPayload;
    try {
      decoded = JWT.verify(token, SEC_KEY) as JwtPayload;
      console.log("Decoded token:", decoded); // Log decoded payload
      if (!decoded.email) {
        console.log("Token missing email field");
        return res.status(401).json({ error: "Unauthorized: Invalid token payload" });
      }
    } catch (err: any) {
      console.error("Token verification failed:", err.message);
      return res.status(401).json({ error: "Unauthorized: Invalid token", details: err.message });
    }

    const userEmail = decoded.email;
    console.log("User email from token:", userEmail); // Log user email

    if (!req.file) {
      console.log("No file uploaded");
      return res.status(400).json({ error: "No image uploaded" });
    }

    const file = req.file;
    const originalSize = file.size;
    console.log("Received file:", file.originalname, originalSize, file.mimetype); // Log file details

    let compressedBuffer;
    try {
      compressedBuffer = await sharp(file.buffer)
        .resize({ width: 800, fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();
      console.log("Image compressed successfully, size:", compressedBuffer.length); // Log compression
    } catch (sharpErr: any) {
      console.error("Sharp processing failed:", sharpErr.message);
      return res.status(400).json({ error: "Failed to process image", details: sharpErr.message });
    }

    const compressedSize = compressedBuffer.length;

    try {
      const result = await Connection.query(
        `INSERT INTO imageuploader 
          (image_name, image_data, image_url, image_original_size, image_compressed_size, uploaded_by)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [file.originalname, compressedBuffer, "local-upload", originalSize, compressedSize, userEmail]
      );
      console.log("Database insert successful, ID:", result.rows[0].id); // Log insert success
    } catch (dbErr: any) {
      console.error("Database insert failed:", dbErr.message);
      return res.status(500).json({ error: "Failed to save image to database", details: dbErr.message });
    }

    res.status(200).json({ message: "Image uploaded successfully" });
  } catch (err: any) {
    console.error("Upload failed:", err.message);
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
});

// Get all compressed images from the database
interface JwtPayload {
  email: string;
  iat?: number;
  exp?: number;
}
interface JwtPayload {
  email: string;
  iat?: number;
  exp?: number;
}

app.get("/images-compress", async (req: Request, res: Response):Promise<any> => {
  try {
    // Inline token verification
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("No token provided");
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];
    let decoded: JwtPayload;
    try {
      decoded = JWT.verify(token, SEC_KEY) as JwtPayload;
      console.log("Decoded token:", decoded); // Log decoded payload
      if (!decoded.email) {
        console.log("Token missing email field");
        return res.status(401).json({ error: "Unauthorized: Invalid token payload" });
      }
    } catch (err: any) {
      console.error("Token verification failed:", err.message);
      return res.status(401).json({ error: "Unauthorized: Invalid token", details: err.message });
    }

    const userEmail = decoded.email;
    console.log("User email from token:", userEmail); // Log user email

    const result = await Connection.query(
      `
      SELECT id, image_name, image_data, image_original_size, image_compressed_size 
      FROM imageuploader
      WHERE uploaded_by = $1
      `,
      [userEmail]
    );
    console.log("Fetched images for user:", userEmail, "Count:", result.rows.length); // Log query results

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
  } catch (err: any) {
    console.error("Failed to fetch images:", err.message);
    res.status(500).json({ error: "Failed to fetch images", details: err.message });
  }
});
// Download a compressed image by ID
app.get("/download/:id", async (req: Request, res: Response): Promise<any> => {
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