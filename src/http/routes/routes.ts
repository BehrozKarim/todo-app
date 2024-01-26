import express from "express"
import userController from "../controllers/user-controller"
import {isAuthenticated} from "../middlewares/auth-middleware"
import { googleAuth, googleAuthCallback } from "../controllers/google-auth-controller"
import * as validate from "../middlewares/validate-middleware"
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
router.post("/signup", validate.validateSignup, userController.createUser.bind(userController))

router.post("/login", validate.validateLogin, userController.login.bind(userController))

router.post("/change-password", isAuthenticated, validate.validateResetPassword, userController.changePassword.bind(userController))

router.get("/logout", isAuthenticated, userController.logout.bind(userController))

router.route("/user")
    .get(
        isAuthenticated, userController.getUser.bind(userController)
    )
    .put(
        isAuthenticated, validate.validateUpdateUser,
        userController.updateUser.bind(userController)
    )
    .delete(
        isAuthenticated, userController.deleteUser.bind(userController)
    )



// TODO List APIs
router.route("/todo")
    .post(
        isAuthenticated, validate.validateTodoSchema,
        todoController.createTask.bind(todoController)
    )
    .get(
        isAuthenticated, validate.validateAllTasksQuery,
        todoController.getAllUserTasks.bind(todoController)
    )

router.route("/todo/:id")
    .get(
        isAuthenticated, validate.validateIdSchema,
        todoController.getTask.bind(todoController)
    )
    .put(
        isAuthenticated, validate.validateIdSchema,
        validate.validateUpdateTodoSchema,
        todoController.updateTask.bind(todoController)
    )
    .delete(
        isAuthenticated, validate.validateIdSchema,
        todoController.deleteTask.bind(todoController)
    )

export default router