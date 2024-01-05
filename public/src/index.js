"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const user_api_1 = require("./api/user-api");
const utils_1 = require("./utils/utils");
const todo_api_1 = require("./api/todo-api");
const dotenv_1 = __importDefault(require("dotenv"));
const app = (0, express_1.default)();
dotenv_1.default.config();
app.use(body_parser_1.default.json({ limit: "100mb" }));
app.use(body_parser_1.default.urlencoded({ limit: "50mb", extended: true }));
app.listen(5000, () => {
    console.log("App running on 5000 port");
});
app.get("/", (req, res) => {
    res.send("Hello World");
});
// User APIs
app.post("/signup", user_api_1.createUser);
app.post("/login", user_api_1.login);
app.get("/user", utils_1.isAuthenticated, user_api_1.getUser);
app.put("/user", utils_1.isAuthenticated, user_api_1.updateUser);
app.delete("/user", utils_1.isAuthenticated, user_api_1.deleteUser);
app.post("/change-password", utils_1.isAuthenticated, user_api_1.changePassword);
app.get("/logout", utils_1.isAuthenticated, (req, res) => {
    res.json({ message: "Logout Successful" });
});
// TODO: Remove this api
app.get("/users", utils_1.isAuthenticated, user_api_1.getAllUsers);
// TODO List APIs
app.post("/todo", utils_1.isAuthenticated, todo_api_1.addTask);
app.put("/todo/:id", utils_1.isAuthenticated, todo_api_1.updateTask);
app.get("/todo/:id", utils_1.isAuthenticated, todo_api_1.getTask);
app.get("/todo", utils_1.isAuthenticated, todo_api_1.getAllUserTasks);
app.delete("/todo/:id", utils_1.isAuthenticated, todo_api_1.deleteTask);
