import "reflect-metadata";
import { expect } from "chai";
import * as todoDto from "../../src/app/dto/todo.dto";
describe("When todo dto input is ", () => {
    describe('ok', () => {
        it("should create a new todo dto", () => {
            const data = {
                title: "Todo 1",
                description: "Description 1",
                userId: "123456789012345678901234567890123456",
            };
            const todo = todoDto.NewTodoDto.create(data);
            expect(todo.isOk()).to.be.true;
        });
    
        it("should create a fetch todo dto", () => {
            const data = {
                id: "123456789012345678901234567890123456",
                userId: "123456789012345678901234567890123456",
            };
            const todo = todoDto.FetchTodoDto.create(data);
            expect(todo.isOk()).to.be.true;
        });
    
        it("should create an update todo dto", () => {
            const data = {
                id: "123456789012345678901234567890123456",
                userId: "123456789012345678901234567890123456",
                title: "Todo 1",
                description: "Description 1",
                completed: false,
            };
            const todo = todoDto.UpdateTodoDto.create(data);
            expect(todo.isOk()).to.be.true;
        });
    
        it("should create a fetch all user todo dto", () => {
            const data = {
                userId: "123456789012345678901234567890123456",
            };
            const todo = todoDto.FetchAllUserTodoDto.create(data);
            expect(todo.isOk()).to.be.true;
        });
    });

    describe('erroneous', () => {
        it("should return an error for title", () => {
            const data = {
                description: "Description 1",
                userId: "123456789012345678901234567890123456",
            };
            const todo = todoDto.NewTodoDto.create(data);
            expect(todo.isOk()).to.be.false;
            const dtoErr = todo.unwrapErr();
            expect(dtoErr.message).to.equal(
                "['title' -> Required]"
            );
        })

        it("should return an error for description", () => {
            const data = {
                title: "Todo 1",
                userId: "123456789012345678901234567890123456",
            };
            const todo = todoDto.NewTodoDto.create(data);
            expect(todo.isOk()).to.be.false;
            const dtoErr = todo.unwrapErr();
            expect(dtoErr.message).to.equal(
                "['description' -> Required]"
            );
        });

        it("should return an error for missing user id", () => {
            const data = {
                title: "Todo 1",
                description: "Description 1",
            };
            const todo = todoDto.NewTodoDto.create(data);
            expect(todo.isOk()).to.be.false;
            const dtoErr = todo.unwrapErr();
            expect(dtoErr.message).to.equal(
                "['userId' -> Required]"
            );
        });

        it("should return an error for missing todo id", () => {
            const data = {
                userId: "123456789012345678901234567890123456",
            };
            const todo = todoDto.FetchTodoDto.create(data);
            expect(todo.isOk()).to.be.false;
            const dtoErr = todo.unwrapErr();
            expect(dtoErr.message).to.equal(
                "['id' -> Required]"
            );
        })
    });
});