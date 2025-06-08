import express from "express";
import dotenv from "dotenv";
dotenv.config({
  path:'.env'
})
const app = express();

app.get("/", (req, res) => {
  res.send("helo");
});
app.listen(process.env.PORT, () => {
  console.log(`Server is running on ${process.env.PORT}`);
});
