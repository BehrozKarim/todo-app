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
app.post("/signup", (req, res) => {
    (0, user_api_1.createUser)(req, res);
});
app.get("/login", (req, res) => {
    (0, user_api_1.login)(req, res);
});
app.get("/user", utils_1.isAuthenticated, (req, res) => {
    (0, user_api_1.getUser)(req, res);
});
app.put("/user", (req, res) => {
    (0, user_api_1.updateUser)(req, res);
});
app.delete("/user", (req, res) => {
    (0, user_api_1.deleteUser)(req, res);
});
app.post("/logout", (req, res) => {
    res.json({ message: "Logout Successful" });
});
app.post("/change-password", utils_1.isAuthenticated, (req, res) => {
    (0, user_api_1.changePassword)(req, res);
});
// TODO: Remove this api
app.get("/users", (req, res) => {
    (0, user_api_1.getAllUsers)(req, res);
});
// TODO List APIs
app.post("/todo", utils_1.isAuthenticated, (req, res) => {
    (0, todo_api_1.addTask)(req, res).catch((err) => {
        res.json({ message: err.message });
    });
});
app.put("/todo/:id", utils_1.isAuthenticated, (req, res) => {
    (0, todo_api_1.updateTask)(req, res).catch((err) => {
        res.json({ message: err.message });
    });
});
