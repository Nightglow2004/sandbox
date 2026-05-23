const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")

const connectDB = require("./config/db")
const projectRoutes = require("./routes/projectRoutes")

dotenv.config()

console.log(process.env.MONGO_URI)

connectDB()

const app = express()

app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
  res.send("API Running")
})

app.use("/api/projects", projectRoutes)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})