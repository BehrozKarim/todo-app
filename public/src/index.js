"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const user_api_1 = require("./api/user-api");
const app = (0, express_1.default)();
app.use(body_parser_1.default.json({ limit: "100mb" }));
app.use(body_parser_1.default.urlencoded({ limit: "50mb", extended: true }));
app.listen(5000, () => {
    console.log("App running on 5000 port");
});
// return hello world on get request
app.get("/", (req, res) => {
    res.send("Hello World");
});
app.get("/signup", (req, res) => {
    (0, user_api_1.createUser)(req, res);
});
