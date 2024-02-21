import { expect } from "chai";
import * as userDto from "../../src/app/dto/user.dto";
import * as todoDto from "../../src/app/dto/todo.dto";

describe("When user dto input is ", () => {
    describe("ok", () =>{
        it("should create a new user dto", () => {
            const data = {
                name: "John Doe",
                username: "john_doe",
                email: "john@example.com",
                password: "password",
            };
            const user = userDto.NewUserDto.create(data);
            expect(user.isOk()).to.be.true;
            const dto = user.unwrap();
            expect(dto).instanceOf(userDto.NewUserDto);
            expect(dto.serialize()).to.deep.equal(data);
        });
    
        it("should create an update user dto", () => {
            const data = {
                userId: "123456789012345678901234567890123456",
                name: "John Doe",
                username: "john_doe",
                email: "john_doe@gmail.com"
            };
            const user = userDto.UpdateUserDto.create(data);
            expect(user.isOk()).to.be.true;
            const dto = user.unwrap();
            expect(dto).instanceOf(userDto.UpdateUserDto);
           });
    
        it("should create a user password reset dto", () => {
            const data = {
                userId: "123456789012345678901234567890123456",
                oldPassword: "password",
                newPassword: "new_password",
            };
            const user = userDto.UserPasswordResetDto.create(data);
            expect(user.isOk()).to.be.true;
            const dto = user.unwrap();
            expect(dto).instanceOf(userDto.UserPasswordResetDto);
        });
    
        it("should create a user login dto", () => {
            const data = {
                email: "john_doe@gmail.com",
                password: "password",
            };
            const user = userDto.UserLoginDto.create(data);
            expect(user.isOk()).to.be.true;
            const dto = user.unwrap();
            expect(dto).instanceOf(userDto.UserLoginDto);
        });
    
        it("should create a get user dto", () => {
            const data = {
                userId: "123456789012345678901234567890123456",
            };
            const user = userDto.GetUserDto.create(data);
            expect(user.isOk()).to.be.true;
            const dto = user.unwrap();
            expect(dto).instanceOf(userDto.GetUserDto);
        });
    });

    describe("erroneous", () => {
        it("should return an error for email", () => {
            const data = {
                name: "John Doe",
                username: "john_doe",
                email: "john_doegmail.com",
                password: "password",
            };
            const user = userDto.NewUserDto.create(data);
            expect(user.isOk()).to.be.false;
            const dtoErr = user.unwrapErr();
            expect(dtoErr.message).to.equal(
                "['email' -> Invalid email]"
            );
        });
    
        it("should return an error for password", () => {
            const data = {
                name: "John Doe",
                username: "john_doe",
                email: "john_doe@gmail.com",
                password: "pass",
            };
            const user = userDto.NewUserDto.create(data);
            expect(user.isOk()).to.be.false;
            const dtoErr = user.unwrapErr();
            expect(dtoErr.message).to.equal(
                "['password' -> String must contain at least 8 character(s)]"
            );
        });
    
        it("should return an error for username", () => {
            const data = {
                name: "John Doe",
                username: "",
                email: "john_doe@gmail.com",
                password: "password",
            };
            const user = userDto.NewUserDto.create(data);
            expect(user.isOk()).to.be.false;
            const dtoErr = user.unwrapErr();
            expect(dtoErr.message).to.equal(
                "['username' -> String must contain at least 3 character(s)]"
            );
        });
    
        it("should return an error for missing user id", () => {
            const data = {
                name: "John Doe",
                username: "john_doe",
                email: "john_doe@gmail.com",
            };
            const user = userDto.UpdateUserDto.create(data);
            expect(user.isOk()).to.be.false;
            const dto = user.unwrapErr();
            expect(dto.message).to.equal(
                "['userId' -> Required]"
            )
        });

        it("should return multiple errors", () => {
            const data = {
                name: "John Doe",
                username: "jo",
                email: "john_doegmail.com",
                password: "pass",
            };
            const errors = [
                "'username' -> String must contain at least 3 character(s)",
                "'email' -> Invalid email",
                "'password' -> String must contain at least 8 character(s)"
            ]
            const user = userDto.NewUserDto.create(data);
            expect(user.isOk()).to.be.false;
            const dtoErr = user.unwrapErr();
            expect(dtoErr.message).to.equal(`[${errors.join(',')}]`);
        });

    });

});

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
