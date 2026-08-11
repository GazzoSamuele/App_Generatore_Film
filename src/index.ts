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

app.use("/api", apiRoutes);

async function avvia() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server in ascolto su http://localhost:${PORT}`);
    });
  } catch (errore) {
    console.error("❌ Avvio fallito:", errore);
    process.exit(1);
  }
}

avvia();
