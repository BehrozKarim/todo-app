"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.getAllUsers = exports.getUser = exports.deleteUser = exports.updateUser = exports.createUser = void 0;
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const utils_1 = require("../utils/utils");
const jwt = __importStar(require("jsonwebtoken"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const prisma = new client_1.PrismaClient();
function createUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let password_hash = yield bcrypt.hash(req.body.password, 10);
        if (yield (0, utils_1.usernameExists)(req.body.username)) {
            res.status(400).json("Username already exists");
            return;
        }
        const user = yield prisma.user.create({
            data: {
                name: req.body.name,
                username: req.body.username,
                password: password_hash,
            },
        }).then((user) => {
            res.json(user);
        }).catch((err) => {
            res.json(err.message);
        });
    });
}
exports.createUser = createUser;
function login(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield prisma.user.findUnique({
            where: { username: req.body.username },
        });
        if (user) {
            if (yield bcrypt.compare(req.body.password, user.password)) {
                const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d', });
                res.json({ token: token,
                    expiresIn: '1d',
                    userId: user.id,
                    username: user.username,
                    name: user.name });
            }
            else {
                res.status(400).json("Invalid Password");
            }
        }
        else {
            res.status(400).json("Invalid Username");
        }
    });
}
exports.login = login;
function logout(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        res.json("Logged out");
    });
}
function updateUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield prisma.user.update({
            where: { id: req.params.id },
            data: {
                name: req.body.name,
                username: req.body.username,
                password: req.body.password,
            },
        });
        res.json(user);
    });
}
exports.updateUser = updateUser;
function deleteUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield prisma.user.delete({
            where: { id: req.params.id },
        });
        res.json(user);
    });
}
exports.deleteUser = deleteUser;
function getUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield prisma.user.findUnique({
            where: { id: req.params.id },
        });
        res.json(user);
    });
}
exports.getUser = getUser;
function getAllUsers(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const users = yield prisma.user.findMany();
        res.json(users);
    });
}
exports.getAllUsers = getAllUsers;
