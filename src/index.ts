import express, { Express } from "express";
import bodyParser from 'body-parser'
import dotenv from "dotenv"
import router from "./http/routes/routes"

const app: Express = express()
dotenv.config()
app.use(bodyParser.json({limit: "100mb"}))
app.use(bodyParser.urlencoded({limit:"50mb", extended: true}))

const port = process.env.PORT || 5000

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})

app.use("/", router)