import express from "express";

const PORT=3000;

const app = express();
app.use(express.static("../frontend/public"));

app.get("/", (req, res) => {
    res.render("../../frontend/views/index.ejs")
})



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})