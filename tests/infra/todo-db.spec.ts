import { expect } from 'chai';
import sinon from 'sinon';
import { TodoDbRepo } from '../../src/infra/Repos/todo-db-repo';
import { TaskEntity } from '../../src/domain/todo-entity';
import { Result } from "@carbonteq/fp";
import prisma from '../../src/infra/client/prisma-client';

const db = new TodoDbRepo();

describe('TodoDbRepo', () => {
    
    afterEach(async () => {
        sinon.reset();
        sinon.restore();
    });

    describe('create', () => {
        it('should create a new todo entity', async () => {
            const todo = {
                title: "Do laundry",
                description: "Wash clothes and dry them",
                completed: false,
                userId: "1234",
            };
            const tEntity = TaskEntity.create({title: todo.title, description: todo.description, userId: todo.userId});
            const data = {
                id: tEntity.Id.serialize(),
                title: tEntity.title,
                description: tEntity.description,
                completed: tEntity.completed,
                userId: tEntity.userId,
                updatedAt: tEntity.updatedAt,
                createdAt: tEntity.createdAt
            }
            prisma.todo.create = sinon.stub().resolves(data);
            const result = await db.insert(tEntity);
            expect(result).to.deep.equal(Result.Ok(tEntity));
        });
    });

    describe('findById', () => {
        it('should find a todo entity by id', async () => {
            const todo = {
                title: "Do laundry",
                description: "Wash clothes and dry them",
                completed: false,
                userId: "1234",
            };
            const tEntity = TaskEntity.create({title: todo.title, description: todo.description, userId: todo.userId});
            const data = {
                id: tEntity.Id.serialize(),
                title: tEntity.title,
                description: tEntity.description,
                completed: tEntity.completed,
                userId: tEntity.userId,
                updatedAt: tEntity.updatedAt,
                createdAt: tEntity.createdAt
            }

            prisma.todo.findUnique = sinon.stub().resolves(data);
            const result = await db.fetchById(tEntity.Id);
            expect(result).to.deep.equal(Result.Ok(tEntity));
        });
    });

    describe('deleteById', () => {
        it('should delete a todo entity by id', async () => {
            const todo = {
                title: "Do laundry",
                description: "Wash clothes and dry them",
                completed: false,
                userId: "1234",
            };
            const tEntity = TaskEntity.create({title: todo.title, description: todo.description, userId: todo.userId});
            const data = {
                id: tEntity.Id.serialize(),
                title: tEntity.title,
                description: tEntity.description,
                completed: tEntity.completed,
                userId: tEntity.userId,
                updatedAt: tEntity.updatedAt,
                createdAt: tEntity.createdAt
            }
            prisma.todo.delete = sinon.stub().resolves(data);
            const result = await db.deleteById(tEntity.Id);
            expect(result).to.deep.equal(Result.Ok(tEntity));
        }); 
    });

    describe('fetchByUserId', () => {
        it('should fetch all todo entities belonging to a user', async () => {
            const todo = {
                title: "Do laundry",
                description: "Wash clothes and dry them",
                completed: false,
                userId: "1234",
            };
            const tEntity = TaskEntity.create({title: todo.title, description: todo.description, userId: todo.userId});
            const data = {
                id: tEntity.Id.serialize(),
                title: tEntity.title,
                description: tEntity.description,
                completed: tEntity.completed,
                userId: tEntity.userId,
                updatedAt: tEntity.updatedAt,
                createdAt: tEntity.createdAt
            }
            prisma.todo.findMany = sinon.stub().resolves([data]);
            const result = await db.fetchByUserId(tEntity.userId, 1);
            expect(result).to.deep.equal(Result.Ok([tEntity]));
        });
    });

    describe('update', () => {
        it('should update a todo entity', async () => {
            const todo = {
                title: "Do laundry",
                description: "Wash clothes and dry them",
                completed: false,
                userId: "1234",
            };
            const tEntity = TaskEntity.create({title: todo.title, description: todo.description, userId: todo.userId});
            const data = {
                id: tEntity.Id.serialize(),
                title: tEntity.title,
                description: tEntity.description,
                completed: tEntity.completed,
                userId: tEntity.userId,
                updatedAt: tEntity.updatedAt,
                createdAt: tEntity.createdAt
            }
            prisma.todo.update = sinon.stub().resolves(data);
            const result = await db.update(tEntity);
            expect(result).to.deep.equal(Result.Ok(tEntity));
        });
    });


});