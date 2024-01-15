import express from "express"
import {createUser, getUser, deleteUser, getAllUsers, updateUser, login, changePassword} from "../controllers/user-api"
import {isAuthenticated} from "../auth-middleware/middleware"
import { createTask, deleteTask, getAllUserTasks, getTask, updateTask } from "../controllers/todo-api"
import { googleAuth, googleAuthCallback } from "../controllers/google-auth"
import exp from "constants"

const router = express.Router()

router.get("/google-auth", googleAuth)
router.get("/google/redirect", googleAuthCallback)

router.get("/", (req, res) => {
    res.send("Hello World")
})

// User APIs
router.post("/signup", createUser)

router.post("/login", login)

router.get("/user", isAuthenticated, getUser)

router.put("/user", isAuthenticated, updateUser)

router.delete("/user", isAuthenticated, deleteUser)

router.post("/change-password", isAuthenticated, changePassword)

router.get("/logout", isAuthenticated, (req, res) => {
    res.json({message: "Logout Successful"})
})

// TODO: Remove this api
router.get("/users", isAuthenticated, getAllUsers)

// TODO List APIs
router.post("/todo", isAuthenticated, createTask)

router.put("/todo/:id", isAuthenticated, updateTask)

router.get("/todo/:id", isAuthenticated, getTask)

router.get("/todo", isAuthenticated, getAllUserTasks)

router.delete("/todo/:id", isAuthenticated, deleteTask)

export default router