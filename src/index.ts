import express from "express";

const app = express();

const PORT = 8000;

app.listen(PORT);

app.get("/", (req, res) => {
  res.send("server is running");
});
