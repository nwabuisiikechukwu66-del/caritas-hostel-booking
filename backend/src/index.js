import "dotenv/config";
import express from "express";
import cors from "cors";
import { bookingsRouter } from "./routes/bookings.js";
import { complaintsRouter } from "./routes/complaints.js";
import { adminRouter } from "./routes/admin.js";
import { authRouter } from "./routes/auth.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api", authRouter);
app.use("/api", bookingsRouter);
app.use("/api", complaintsRouter);
app.use("/api", adminRouter);

// Central error handler - so a thrown error anywhere returns JSON instead of
// an HTML stack trace to the client.
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "internal_server_error" });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Hostel API listening on :${port}`));
