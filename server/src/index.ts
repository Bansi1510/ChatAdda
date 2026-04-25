import express, { Application, Request, Response } from "express";

const app: Application = express();

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("API running...");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});