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
router.post("/signup", userController.createUser.bind(userController))

router.post("/login", userController.login.bind(userController))

router.post("/change-password", isAuthenticated, userController.changePassword.bind(userController))

router.get("/logout", isAuthenticated, userController.logout.bind(userController))

router.route("/user")
    .get(
        isAuthenticated, userController.getUser.bind(userController)
    )
    .put(
        isAuthenticated,
        userController.updateUser.bind(userController)
    )
    .delete(
        isAuthenticated, userController.deleteUser.bind(userController)
    )



// TODO List APIs
router.route("/todo")
    .post(
        isAuthenticated,
        todoController.createTask.bind(todoController)
    )
    .get(
        isAuthenticated,
        todoController.getAllUserTasks.bind(todoController)
    )

router.route("/todo/:id")
    .get(
        isAuthenticated, 
        todoController.getTask.bind(todoController)
    )
    .put(
        isAuthenticated,
        todoController.updateTask.bind(todoController)
    )
    .delete(
        isAuthenticated,
        todoController.deleteTask.bind(todoController)
    )

export default router