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
exports.isAuthenticated = exports.validPassword = exports.usernameExists = void 0;
// validate username doesn't exist already
const client_1 = require("@prisma/client");
const jwt = __importStar(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
function usernameExists(username) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield prisma.user.findUnique({
            where: { username: username },
        });
        if (user) {
            return true;
        }
        else {
            return false;
        }
    });
}
exports.usernameExists = usernameExists;
function validPassword(password) {
    return __awaiter(this, void 0, void 0, function* () {
        if (password.length < 8) {
            return false;
        }
        else {
            return true;
        }
    });
}
exports.validPassword = validPassword;
function isAuthenticated(req, res, next) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        // spliting to extract token only
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        if (!token) {
            res.status(401).json("Unauthorized");
        }
        else {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                if (decoded.id) {
                    req.userId = decoded.id;
                    next();
                }
                else {
                    res.status(401).json("Unauthorized");
                }
            }
            catch (error) {
                res.status(401).json("Unauthorized");
            }
        }
    });
}
exports.isAuthenticated = isAuthenticated;