import express from "express"
import {isAuthenticated} from "../middlewares/auth-middleware"
import { googleAuth, googleAuthCallback } from "../controllers/google-auth-controller"
import { userController, todoController } from "../../src/infra/di-container"
import asyncHandler from "express-async-handler";
const router = express.Router()

// Google Auth APIs
router.get("/google-auth", googleAuth)
router.get("/google/redirect", googleAuthCallback)

// Home API
router.get("/", (req, res) => {
    res.send("Hello World")
})

// User APIs
router.post("/signup", asyncHandler(userController.createUser))

router.post("/login", asyncHandler(userController.login))

router.post("/change-password", isAuthenticated, asyncHandler(userController.changePassword))

router.get("/logout", isAuthenticated, asyncHandler(userController.logout))

router.route("/user")
    .get(
        isAuthenticated, asyncHandler(userController.getUser)
    )
    .put(
        isAuthenticated,
        asyncHandler(userController.updateUser)
    )
    .delete(
        isAuthenticated, asyncHandler(userController.deleteUser)
    )

// TODO List APIs
router.route("/todo")
    .post(
        isAuthenticated,
        asyncHandler(todoController.createTask)
    )
    .get(
        isAuthenticated,
        asyncHandler(todoController.getAllUserTasks)
    )

router.route("/todo/:id")
    .get(
        isAuthenticated, 
        asyncHandler(todoController.getTask)
    )
    .put(
        isAuthenticated,
        asyncHandler(todoController.updateTask)
    )
    .delete(
        isAuthenticated,
        asyncHandler(todoController.deleteTask)
    )

export default router