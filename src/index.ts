import express, { Express } from "express";
import bodyParser from 'body-parser'
import {createUser, getUser, deleteUser, getAllUsers, updateUser, login} from "./api/user-api"
import {isAuthenticated} from "./utils/utils"
import { addTask } from "./api/todo-api"
import dotenv from "dotenv"

const app: Express = express()
dotenv.config()
app.use(bodyParser.json({limit: "100mb"}))
app.use(bodyParser.urlencoded({limit:"50mb", extended: true}))

app.listen(5000, () => {
    console.log("App running on 5000 port")
})

app.get("/", (req, res) => {
    res.send("Hello World")
})

// User APIs
app.post("/signup", (req, res) => {
    createUser(req, res)
})

app.get("/login", (req, res) => {
    login(req, res)
})

app.get("/user/:id", isAuthenticated, (req, res) => {
    getUser(req, res)
})

app.get("/users", (req, res) => {
    getAllUsers(req, res)
})

app.put("/user/:id", (req, res) => {
    updateUser(req, res)
})

app.delete("/user/:id", (req, res) => {
    deleteUser(req, res)
})

// TODO List APIs
app.post("/todo", isAuthenticated, (req, res) => {
    addTask(req, res)
})