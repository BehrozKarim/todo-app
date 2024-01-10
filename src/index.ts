import express, { Express } from "express";
import bodyParser from 'body-parser'
import dotenv from "dotenv"
import router from "./routes/routes"

const app: Express = express()
dotenv.config()
app.use(bodyParser.json({limit: "100mb"}))
app.use(bodyParser.urlencoded({limit:"50mb", extended: true}))

app.listen(5000, () => {
    console.log("App running on 5000 port")
})

app.use("/", router)