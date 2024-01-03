import express, { Express } from "express";
import bodyParser from 'body-parser'
import {createUser} from "./api/user-api"

const app: Express = express()
app.use(bodyParser.json({limit: "100mb"}))
app.use(bodyParser.urlencoded({limit:"50mb", extended: true}))

app.listen(5000, () => {
    console.log("App running on 5000 port")
})

// return hello world on get request
app.get("/", (req, res) => {
    res.send("Hello World")
})

app.get("/signup", (req, res) => {
    createUser(req, res)
})