import express from "express";
import dotenv from "dotenv";

const app = express();

app.get("/", (req, res) => {
  res.send("helo");
});
app.listen(process.env.PORT, () => {
  console.log(`server is running on port ${process.env.PORT}`);
});
