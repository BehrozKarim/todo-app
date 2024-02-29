import { expect } from "chai";
import { TaskService } from "../../src/app/services/todo-service"
import prisma from "../../src/infra/client/prisma-client";
import sinon from "sinon";
import { AppResult } from "@carbonteq/hexapp";
import * as taskDtos from "../../src/app/dto/todo.dto";
import { Result } from "@carbonteq/fp";
import  {mailService} from "../../src/infra/mail-service";
import { container } from "tsyringe";
const taskService  = container.resolve(TaskService);
describe('TaskService', () => {
    afterEach(async () => {
        sinon.reset();
        sinon.restore();
    });

    describe('get', () => {
        it('should get a task', async () => {
            const task = {
                id: "8c07c5c4-096d-4b25-88ca-3cd1e8b0173f",
                userId: "8c07c5c4-096d-4b25-88ca-3cd1e8b0173f",
            };
            let data = {
                id: "8c07c5c4-096d-4b25-88ca-3cd1e8b0173f",
                title: "Do laundry",
                description: "Wash clothes and dry them",
                completed: false,
                userId: "8c07c5c4-096d-4b25-88ca-3cd1e8b0173f",
                updatedAt: new Date(),
                createdAt: new Date()
            }
            
            const taskDto = taskDtos.FetchTodoDto.create(task);
            prisma.todo.findUnique = sinon.stub().resolves(data);
            const result = await taskService.get(taskDto.unwrap());
            let newData = {
                ...data,
                Id: data.id
            }
            delete (newData as any).id;
            expect(result).to.deep.equal(AppResult.fromResult(Result.Ok(newData)));
        });
    });

    describe('create', () => {
        it('should create a new task', async () => {
            const task = {
                title: "Do laundry",
                description: "Wash clothes and dry them",
                completed: false,
                userId: "8c07c5c4-096d-4b25-88ca-3cd1e8b0173f",
            };
            const data = {
                id: "8c07c5c4-096d-4b25-88ca-3cd1e8b0173f",
                title: task.title,
                description: task.description,
                completed: task.completed,
                userId: task.userId,
                updatedAt: new Date(),
                createdAt: new Date()
            }
            prisma.todo.create = sinon.stub().resolves(data);
            const taskDto = taskDtos.NewTodoDto.create(task);
            const result = await taskService.create(taskDto.unwrap());
            const taskEntity = result.unwrap();
            expect(taskEntity.userId).to.equal(data.userId);
            expect(taskEntity.title).to.equal(data.title);
            expect(taskEntity.description).to.equal(data.description);
            expect(taskEntity.completed).to.equal(data.completed);
        });
    });

    describe('update', () => {
        it('should update a task', async () => {
            const task = {
                id: "8c07c5c4-096d-4b25-88ca-3cd1e8b0173f",
                title: "Do laundry",
                description: "Wash clothes and dry them",
                completed: false,
                userId: "8c07c5c4-096d-4b25-88ca-3cd1e8b0173f",
            };
            const data = {
                id: "8c07c5c4-096d-4b25-88ca-3cd1e8b0173f",
                title: "Do laundry",
                description: "Wash clothes and dry them",
                completed: false,
                userId: "8c07c5c4-096d-4b25-88ca-3cd1e8b0173f",
                updatedAt: new Date(),
                createdAt: new Date()
            }
            prisma.todo.findUnique = sinon.stub().resolves(data);
            prisma.todo.update = sinon.stub().resolves({...data, updatedAt: new Date()});
            const taskDto = taskDtos.UpdateTodoDto.create(task);
            const result = await taskService.update(taskDto.unwrap());
            let newData = {
                ...data,
                Id: data.id
            }
            delete (newData as any).id;
            const taskEntity = result.unwrap();
            expect(taskEntity.userId).to.equal(newData.userId);
            expect(taskEntity.title).to.equal(newData.title);
            expect(taskEntity.description).to.equal(newData.description);
            expect(taskEntity.completed).to.equal(newData.completed);
            expect(taskEntity.updatedAt).to.not.equal(data.updatedAt);
            expect(taskEntity.Id).to.equal(data.id);
            expect(taskEntity.createdAt).to.equal(data.createdAt);
            expect(taskEntity.updatedAt).to.not.equal(data.createdAt);
        });
    });

    describe('delete', () => {
        it('should delete a task', async () => {
            const task = {
                id: "8c07c5c4-096d-4b25-88ca-3cd1e8b0173f",
                userId: "8c07c5c4-096d-4b25-88ca-3cd1e8b0173f",
            };
            let data = {
                id: "8c07c5c4-096d-4b25-88ca-3cd1e8b0173f",
                title: "Do laundry",
                description: "Wash clothes and dry them",
                completed: false,
                userId: "8c07c5c4-096d-4b25-88ca-3cd1e8b0173f",
                updatedAt: new Date(),
                createdAt: new Date()
            }
            prisma.user.findUnique = sinon.stub().resolves({
                userId: "8c07c5c4-096d-4b25-88ca-3cd1e8b0173f",
                name: "Jane Smith",
                username: "jane_smith",
                email: "janesmith@gmail.com",
                password: "password",
                updatedAt: new Date(),
                createdAt: new Date()
            })
            const mailStub = sinon.stub(mailService, "sendEmail").resolves();
            prisma.todo.findUnique = sinon.stub().resolves(data);
            prisma.todo.delete = sinon.stub().resolves(data);
            const taskDto = taskDtos.FetchTodoDto.create(task);
            const result = await taskService.delete(taskDto.unwrap());
            let newData = {
                ...data,
                Id: data.id
            }
            delete (newData as any).id;
            expect(result).to.deep.equal(AppResult.fromResult(Result.Ok(newData)));

        });
    });

    describe('fetchByUserId', () => {
        it('should fetch tasks by user id', async () => {
            const task = {
                userId: "8c07c5c4-096d-4b25-88ca-3cd1e8b0173f",
            };
            const data = [
                {
                    id: "8c07c5c4-096d-4b25-88ca-3cd1e8b0173f",
                    title: "Do laundry",
                    description: "Wash clothes and dry them",
                    completed: false,
                    userId: "8c07c5c4-096d-4b25-88ca-3cd1e8b0173f",
                    updatedAt: new Date(),
                    createdAt: new Date()
                }
            ]
            prisma.todo.findMany = sinon.stub().resolves(data);
            const taskDto = taskDtos.FetchAllUserTodoDto.create(task);
            const result = await taskService.getAllUserTasks(taskDto.unwrap());
            let newData = data.map((d) => {
                return {
                    ...d,
                    Id: d.id
                }
            });
            newData.forEach((d) => {
                delete (d as any).id;
            });
            expect(result).to.deep.equal(AppResult.fromResult(Result.Ok(newData)));
        });
    });
});