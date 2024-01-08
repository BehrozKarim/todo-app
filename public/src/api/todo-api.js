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
const zod_1 = require("zod");
dotenv.config();
const prisma = new client_1.PrismaClient();
const todoSchema = zod_1.z.object({
    title: zod_1.z.string().min(3),
    description: zod_1.z.string().min(3),
});
function addTask(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = todoSchema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json(result.error);
            return;
        }
        if (!req.userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        yield prisma.todo.create({
            data: {
                title: req.body.title,
                description: req.body.description,
                userId: req.userId,
            },
        }).then((task) => {
            res.json({ message: "Task Created Successfully", task: task });
        }).catch((err) => {
            res.json({ message: err });
        });
    });
}
exports.addTask = addTask;
const idSchema = zod_1.z.object({
    id: zod_1.z.string().min(36),
});
function getTask(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = idSchema.safeParse(req.params);
        if (!result.success) {
            res.status(400).json(result.error);
            return;
        }
        yield prisma.todo.findUnique({
            where: { id: req.params.id, userId: req.userId },
        }).then((task) => {
            if (!task) {
                res.status(404).json({ message: "Task not found" });
                return;
            }
            res.json({
                message: "Task Fetched Successfully",
                task: task
            });
        }).catch((err) => {
            res.json({ message: err });
        });
    });
}
exports.getTask = getTask;
const updateTodoSchema = zod_1.z.object({
    title: zod_1.z.string().min(3).optional(),
    description: zod_1.z.string().min(3).optional(),
    completed: zod_1.z.boolean().optional(),
});
function updateTask(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = updateTodoSchema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json(result.error);
            return;
        }
        const idCheck = idSchema.safeParse(req.params);
        if (!idCheck.success) {
            res.status(400).json(idCheck.error);
            return;
        }
        let currentTask = yield prisma.todo.findUnique({
            where: { id: req.params.id, userId: req.userId },
        }).catch((err) => {
            res.json({ message: err.message });
        });
        if (!currentTask) {
            res.status(404).json({ message: "Task not found" });
            return;
        }
        currentTask.completed = req.body.completed ? req.body.completed : currentTask.completed;
        currentTask.title = req.body.title ? req.body.title : currentTask.title;
        currentTask.description = req.body.description ? req.body.description : currentTask.description;
        currentTask.updatedAt = new Date();
        currentTask = yield prisma.todo.update({
            where: { id: req.params.id, },
            data: currentTask,
        }).catch((err) => {
            res.json({ message: err.message });
        });
        res.json({ message: "Task Updated Successfully", task: currentTask });
    });
}
exports.updateTask = updateTask;
function getAllUserTasks(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const tasks = yield prisma.todo.findMany({
            where: { userId: req.userId },
        }).then((tasks) => {
            res.json(tasks);
        }).catch((err) => {
            res.json({ message: err.message });
        });
    });
}
exports.getAllUserTasks = getAllUserTasks;
function deleteTask(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = idSchema.safeParse(req.params);
        if (!result.success) {
            res.status(400).json(result.error);
            return;
        }
        yield prisma.todo.delete({
            where: { id: req.params.id, userId: req.userId },
        }).then((task) => {
            res.json({ message: "Task Deleted Successfully", task: task });
        }).catch((err) => {
            res.json({ message: err });
        });
    });
}
exports.deleteTask = deleteTask;
