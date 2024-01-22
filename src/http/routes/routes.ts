import express from "express"
import {createUser, getUser, deleteUser, updateUser, login, changePassword} from "../controllers/user-controller"
import {isAuthenticated} from "../../middlewares/auth-middleware"
import { createTask, deleteTask, getAllUserTasks, getTask, updateTask } from "../controllers/todo-controller"
import { googleAuth, googleAuthCallback } from "../controllers/google-auth-controller"
import * as validate from "../../middlewares/validate-middleware"
const router = express.Router()

router.get("/google-auth", googleAuth)
router.get("/google/redirect", googleAuthCallback)

router.get("/", (req, res) => {
    res.send("Hello World")
})

// User APIs
router.post("/signup", validate.validateSignup, createUser)

router.post("/login", validate.validateLogin, login)

router.get("/user", isAuthenticated, getUser)

router.put("/user", isAuthenticated, validate.validateUpdateUser, updateUser)

router.delete("/user", isAuthenticated, deleteUser)

router.post("/change-password", isAuthenticated, validate.validateResetPassword, changePassword)

router.get("/logout", isAuthenticated, (req, res) => {
    res.json({message: "Logout Successful"})
})

// TODO List APIs
router.post("/todo", isAuthenticated, validate.validateTodoSchema, createTask)

router.put("/todo/:id", isAuthenticated, validate.validateIdSchema, validate.validateUpdateTodoSchema, updateTask)

router.get("/todo/:id", isAuthenticated, validate.validateIdSchema, getTask)

router.get("/todo", isAuthenticated, validate.validateAllTasksQuery, getAllUserTasks)

router.delete("/todo/:id", isAuthenticated, validate.validateIdSchema, deleteTask)

export default router