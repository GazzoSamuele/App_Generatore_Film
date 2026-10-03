import "dotenv/config";
import express, { type ErrorRequestHandler } from "express";
import { connectDB } from "./config/db.js";
import apiRoutes from "./routes/api.routes.js";

const app = express();
const PORT = process.env.PORT ?? 3001;

app.disable("x-powered-by");

app.set("trust proxy", 1);

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

app.use("/api", (_req, res) => {
  res.status(404).json({ errore: "Endpoint non trovato" });
});

const gestisciErrori: ErrorRequestHandler = (errore, _req, res, next) => {
  if (res.headersSent) {
    next(errore);
    return;
  }

  if (errore?.type === "entity.parse.failed") {
    res
      .status(400)
      .json({ errore: "Il corpo della richiesta non è un JSON valido" });
    return;
  }
  if (errore?.type === "entity.too.large") {
    res.status(413).json({ errore: "Richiesta troppo grande" });
    return;
  }

  console.error("Errore non gestito:", errore);
  res.status(500).json({ errore: "Errore interno del server" });
};

app.use(gestisciErrori);

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server in ascolto su http://localhost:${PORT}`);
  });
}

export default app;
