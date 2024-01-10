import express, { Express, Request } from "express";
import bodyParser from 'body-parser'
import {createUser, getUser, deleteUser, getAllUsers, updateUser, login, changePassword} from "./api/user-api"
import {isAuthenticated} from "./utils/utils"
import { addTask, deleteTask, getAllUserTasks, getTask, updateTask } from "./api/todo-api"
import dotenv from "dotenv"
import { userInfo } from "os";

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
app.post("/signup", createUser)

app.post("/login", login)

app.get("/user", isAuthenticated, getUser)

app.put("/user", isAuthenticated, updateUser)

app.delete("/user", isAuthenticated, deleteUser)

app.post("/change-password", isAuthenticated, changePassword)

app.get("/logout", isAuthenticated, (req, res) => {
    res.json({message: "Logout Successful"})
})

// TODO: Remove this api
app.get("/users", isAuthenticated, getAllUsers)

// TODO List APIs
app.post("/todo", isAuthenticated, addTask)

app.put("/todo/:id", isAuthenticated, updateTask)

app.get("/todo/:id", isAuthenticated, getTask)

app.get("/todo", isAuthenticated, getAllUserTasks)

app.delete("/todo/:id", isAuthenticated, deleteTask)

