import { expect } from "chai";
import { userService } from "../../src/app/services/user-service";
import prisma from "../../client/prisma-client";
import sinon from "sinon";
import { AppResult } from "@carbonteq/hexapp";
import * as userDtos from "../../src/app/dto/user.dto";
import { Result } from "@carbonteq/fp";
import * as bcrypt from "bcrypt";

describe('UserService', () => {
    afterEach(async () => {
        sinon.reset();
        sinon.restore();
    });

    describe('get', () => {
        it('should get a user', async () => {
            const user = {
                userId: "8c07c5c4-096d-4b25-88ca-3cd1e8b0173f",
            };
            let data = {
                userId: "8c07c5c4-096d-4b25-88ca-3cd1e8b0173f",
                name: "Jane Smith",
                username: "jane_smith",
                email: "janesmith@gmail.com",
                password: "password",
                updatedAt: new Date(),
                createdAt: new Date()
            }

            const userDto = userDtos.GetUserDto.create(user);
            prisma.user.findUnique = sinon.stub().resolves(data);
            const result = await userService.get(userDto.unwrap());
            let newData = {
                ...data,
                Id: data.userId
            }
            delete (newData as any).userId;
            expect(result).to.deep.equal(AppResult.fromResult(Result.Ok(newData)));
        });
    });

    describe('create', () => {
        it('should create a new user', async () => {
            const user = {
                name: "Jane Smith",
                username: "jane_smith",
                email: "janesmith@gmail.com",
                password: "password",
            };
            const data = {
                userId: "8c07c5c4-096d-4b25-88ca-3cd1e8b0173f",
                name: user.name,
                username: user.username,
                email: user.email,
                password: user.password,
                updatedAt: new Date(),
                createdAt: new Date()
            }
            const userCreateDto = userDtos.NewUserDto.create(user);
            prisma.user.create = sinon.stub().resolves(data);
            const result = await userService.create(userCreateDto.unwrap());
            const userEnt = result.unwrap()
            expect(userEnt.name).to.equal(user.name);
            expect(userEnt.username).to.equal(user.username);
            expect(userEnt.email).to.equal(user.email);

        });
    });

    describe('update', () => {
        it('should update a user', async () => {
            const user = {
                userId: "8c07c5c4-096d-4b25-88ca-3cd1e8b0173f",
                name: "Jane Smith",
                username: "jane_smith",
                email: "janesmith@gmail.com",
                password: "password",
            };
            const userUpdateDto = userDtos.UpdateUserDto.create(user);
            const data = {
                userId: "8c07c5c4-096d-4b25-88ca-3cd1e8b0173f",
                name: user.name,
                username: user.username,
                email: user.email,
                password: user.password,
                updatedAt: new Date(),
                createdAt: new Date()
            }
            prisma.user.findUnique = sinon.stub().resolves(data);
            prisma.user.update = sinon.stub().resolves(data);
            const result = await userService.update(userUpdateDto.unwrap());
            const userEnt = result.unwrap()
            expect(userEnt.name).to.equal(data.name);
            expect(userEnt.username).to.equal(data.username);
            expect(userEnt.email).to.equal(data.email);
            expect(userEnt.createdAt).to.equal(data.createdAt);
            expect(userEnt.updatedAt).to.not.equal(data.updatedAt);
            expect(userEnt.Id).to.equal(data.userId);
            expect(userEnt.password).to.equal(data.password);
        });
    });

    describe('delete', () => {
        it('should delete a user', async () => {
            const user = {
                userId: "8c07c5c4-096d-4b25-88ca-3cd1e8b0173f",
            };
            const userDeleteDto = userDtos.GetUserDto.create(user);
            let data = {
                userId: "8c07c5c4-096d-4b25-88ca-3cd1e8b0173f",
                name: "Jane Smith",
                username: "jane_smith",
                email: "janesmith@gmail.com",
                password: "password",
                updatedAt: new Date(),
                createdAt: new Date()
            }
            prisma.user.findUnique = sinon.stub().resolves(data);
            prisma.user.delete = sinon.stub().resolves(data);
            const result = await userService.delete(userDeleteDto.unwrap());
            let newData = {
                ...data,
                Id: data.userId
            }
            delete (newData as any).userId;
            expect(result).to.deep.equal(AppResult.fromResult(Result.Ok(newData)));
        });
    });

    describe("login", () => {
        it("should login a user", async () => {
            const user = {
                email: "janesmith@gmail.com",
                password: "password",
            };
            const userLoginDto = userDtos.UserLoginDto.create(user);
            let data = {
                userId: "8c07c5c4-096d-4b25-88ca-3cd1e8b0173f",
                name: "Jane Smith",
                username: "jane_smith",
                email: "janesmith@gmail.com",
                password: await bcrypt.hash("password", 10),
                updatedAt: new Date(),
                createdAt: new Date()
            }
            prisma.user.findUnique = sinon.stub().resolves(data);
            const result = await userService.login(userLoginDto.unwrap());
            let newData = {
                ...data,
                Id: data.userId
            }
            delete (newData as any).userId;
            expect(result).to.deep.equal(AppResult.fromResult(Result.Ok(newData)));
        });
    });

    describe("changePassword", () => {
        it("should reset a user's password", async () => {
            const user = {
                userId: "8c07c5c4-096d-4b25-88ca-3cd1e8b0173f",
                oldPassword: "password",
                newPassword: "new_password",
            };
            const userPasswordResetDto = userDtos.UserPasswordResetDto.create(user);
            let data = {
                userId: "8c07c5c4-096d-4b25-88ca-3cd1e8b0173f",
                name: "Jane Smith",
                username: "jane_smith",
                email: "janesmith@gmail.com",
                password: await bcrypt.hash("password", 10),
                updatedAt: new Date(),
                createdAt: new Date()
            }
            prisma.user.findUnique = sinon.stub().resolves(data);
            prisma.user.update = sinon.stub().resolves(data);
            const result = await userService.changePassword(userPasswordResetDto.unwrap());
            const userEnt = result.unwrap()
            expect(userEnt.name).to.equal(data.name);
            expect(userEnt.username).to.equal(data.username);
            expect(userEnt.email).to.equal(data.email);
            expect(userEnt.createdAt).to.equal(data.createdAt);
            expect(userEnt.updatedAt).to.not.equal(data.updatedAt);
            expect(userEnt.Id).to.equal(data.userId);
            expect(await bcrypt.compare("new_password", userEnt.password??"")).to.equal(true);
        });
    });
});
