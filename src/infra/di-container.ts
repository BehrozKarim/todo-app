import { container } from "tsyringe";
import { TodoRepository } from "../domain/todo-repository"
import { TodoDbRepo } from "./Repos/todo-db-repo"
import { UserRepository } from "../domain/user-repository";
import { UserDbRepo } from "./Repos/user-db-repo"
import { UserServiceInterface, UserService } from "../app/services/user-service";
import { TaskServiceInterface, TaskService } from "../app/services/todo-service";
import { UserController } from "../../http/controllers/user-controller";
import { TodoController } from "../../http/controllers/todo-controller";

container.register<UserServiceInterface>("UserServiceInterface", { useClass: UserService })
container.register<TaskServiceInterface>("TaskServiceInterface", { useClass: TaskService })
container.register<UserRepository>("UserRepository", { useClass: UserDbRepo })
container.register<TodoRepository>("TodoRepository", { useClass: TodoDbRepo })

export const userController = container.resolve(UserController)
export const todoController = container.resolve(TodoController)