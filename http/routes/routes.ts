import express from "express"
import userController from "../controllers/user-controller"
import {isAuthenticated} from "../middlewares/auth-middleware"
import { googleAuth, googleAuthCallback } from "../controllers/google-auth-controller"
import todoController from "../controllers/todo-controller"
const router = express.Router()

// Google Auth APIs
router.get("/google-auth", googleAuth)
router.get("/google/redirect", googleAuthCallback)

// Home API
router.get("/", (req, res) => {
    res.send("Hello World")
})

// User APIs
router.post("/signup", userController.createUser)

router.post("/login", userController.login)

router.post("/change-password", isAuthenticated, userController.changePassword)

router.get("/logout", isAuthenticated, userController.logout)

router.route("/user")
    .get(
        isAuthenticated, userController.getUser
    )
    .put(
        isAuthenticated,
        userController.updateUser
    )
    .delete(
        isAuthenticated, userController.deleteUser
    )

// TODO List APIs
router.route("/todo")
    .post(
        isAuthenticated,
        todoController.createTask
    )
    .get(
        isAuthenticated,
        todoController.getAllUserTasks
    )

router.route("/todo/:id")
    .get(
        isAuthenticated, 
        todoController.getTask
    )
    .put(
        isAuthenticated,
        todoController.updateTask
    )
    .delete(
        isAuthenticated,
        todoController.deleteTask
    )

export default router