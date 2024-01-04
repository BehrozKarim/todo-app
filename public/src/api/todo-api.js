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
exports.deleteTask = exports.updateTask = exports.getAllUserTasks = exports.getTask = exports.addTask = void 0;
const client_1 = require("@prisma/client");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const prisma = new client_1.PrismaClient();
function addTask(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const task = yield prisma.todo.create({
            data: {
                title: req.body.title,
                description: req.body.description,
                userId: req.userId,
            },
        }).then((task) => {
            res.json({ message: "Task Created Successfully", task: task });
        }).catch((err) => {
            res.json({ message: err.message });
        });
    });
}
exports.addTask = addTask;
function getTask(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const task = yield prisma.todo.findUnique({
            where: { id: req.params.id },
        });
        res.json(task);
    });
}
exports.getTask = getTask;
function getAllUserTasks(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const tasks = yield prisma.todo.findMany({
            where: { userId: req.params.id },
        });
        res.json(tasks);
    });
}
exports.getAllUserTasks = getAllUserTasks;
function updateTask(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let current_task = yield prisma.todo.findUnique({
            where: { id: req.params.id },
        });
        const task = yield prisma.todo.update({
            where: { id: req.params.id },
            data: {
                // if title and description exist in req.body, then update, otherwise don't
                title: req.body.title ? req.body.title : current_task === null || current_task === void 0 ? void 0 : current_task.title,
                description: req.body.description ? req.body.description : current_task === null || current_task === void 0 ? void 0 : current_task.description,
                completed: req.body.completed ? req.body.completed : current_task === null || current_task === void 0 ? void 0 : current_task.completed,
            },
        });
        res.json(task);
    });
}
exports.updateTask = updateTask;
function deleteTask(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const task = yield prisma.todo.delete({
            where: { id: req.params.id },
        });
        res.json(task);
    });
}
exports.deleteTask = deleteTask;
