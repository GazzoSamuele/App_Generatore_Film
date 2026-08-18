import "dotenv/config";
import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.log("MONGODB_URI assente nel file .env");
  process.exit(1);
}

mongoose
  .connect(uri, { serverSelectionTimeoutMS: 8000 })
  .then(async () => {
    console.log("RISULTATO: connessione riuscita");
    await mongoose.disconnect();
  })
  .catch((errore: unknown) => {
    const messaggio = errore instanceof Error ? errore.message : String(errore);
    console.log("RISULTATO: connessione fallita");
    console.log("MESSAGGIO:", messaggio.slice(0, 400));
    process.exit(1);
  });
