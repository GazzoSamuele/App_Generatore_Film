import "dotenv/config";
import express from "express";
import { connectDB } from "./config/db.js";
import apiRoutes from "./routes/api.routes.js";

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ messaggio: "🎬 Movie Recommender API - il server è vivo!" });
});

app.use("/api", async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (errore) {
    console.error("❌ Database non raggiungibile:", errore);
    res
      .status(503)
      .json({ errore: "Database non raggiungibile, riprova tra poco" });
  }
});

app.use("/api", apiRoutes);

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server in ascolto su http://localhost:${PORT}`);
  });
}

export default app;
