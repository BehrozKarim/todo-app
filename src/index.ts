import express, { Express } from "express";
import bodyParser from 'body-parser'
import {createUser, getUser, deleteUser, getAllUsers, updateUser, login, changePassword} from "./api/user-api"
import {isAuthenticated} from "./utils/utils"
import { addTask, deleteTask, getAllUserTasks, getTask, updateTask } from "./api/todo-api"
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

app.get("/user", isAuthenticated, (req, res) => {
    getUser(req, res)
})

app.put("/user", (req, res) => {
    updateUser(req, res)
})

app.delete("/user", (req, res) => {
    deleteUser(req, res)
})

app.get("/logout", (req, res) => {
    res.json({message: "Logout Successful"})
})

app.post("/change-password", isAuthenticated, (req, res) => {
    changePassword(req, res)
})

// TODO: Remove this api
app.get("/users", (req, res) => {
    getAllUsers(req, res)
})

// TODO List APIs
app.post("/todo", isAuthenticated, (req, res) => {
    addTask(req, res).catch((err) => {
        res.json({message: err.message})
    })
})

app.put("/todo/:id", isAuthenticated, (req, res) => {
    updateTask(req, res).catch((err) => {
        res.json({message: err.message})
    })
})

app.get("/todo/:id", isAuthenticated, (req, res) => {
    getTask(req, res).catch((err) => {
        res.json({message: err.message})
    })
})

app.get("/todo", isAuthenticated, (req, res) => {
    getAllUserTasks(req, res).catch((err) => {
        res.json({message: err.message})
    })
})

app.delete("/todo/:id", isAuthenticated, (req, res) => {
    deleteTask(req, res).catch((err) => {
        res.json({message: err.message})
    })
})

