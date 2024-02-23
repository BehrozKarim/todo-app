import { expect } from 'chai';
import sinon from 'sinon';
import { UserDbRepo } from '../../src/infra/stores/user-db-repo';
import { UserEntity } from '../../src/domain/user-entity';
import { Result } from "@carbonteq/fp";
import prisma from '../../client/prisma-client';


const db = new UserDbRepo();
describe('UserDbRepo', () => {

    afterEach(async () => {
        sinon.restore();
    });

    describe('create', () => {
        it('should create a new user entity', async () => {
            const user = {
                name: "Jane Smith",
                username: "jane_smith",
                email: "janesmith@gmail.com",
                password: "password",
            };
            const uEntity = new UserEntity(user.username, user.email, user.password, user.name);
            const data = {
                userId: uEntity.Id.serialize(),
                name: uEntity.name??null,
                username: uEntity.username,
                email: uEntity.email,
                password: uEntity.password??null,
                updatedAt: uEntity.updatedAt,
                createdAt: uEntity.createdAt
            }
            prisma.user.create = sinon.stub().resolves(data);
            const result = await db.insert(uEntity);
            expect(result).to.deep.equal(Result.Ok(uEntity));
        });
    });

    describe('findById', () => {
        it('should find a user entity by id', async () => {
            const user = {
                name: "Jane Smith",
                username: "jane_smith",
                email: "janesmith@gmail.com",
                password: "password",
            };
            const uEntity = new UserEntity(user.username, user.email, user.password, user.name);
            const data = {
                userId: uEntity.Id.serialize(),
                name: uEntity.name??null,
                username: uEntity.username,
                email: uEntity.email,
                password: uEntity.password??null,
                updatedAt: uEntity.updatedAt,
                createdAt: uEntity.createdAt
            }

            prisma.user.findUnique = sinon.stub().resolves(data);
            const result = await db.fetchById(uEntity.Id);
            expect(result).to.deep.equal(Result.Ok(uEntity));
        });
    });

    describe('findByUsername', () => {
        it('should find a user entity by username', async () => {
            const user = {
                name: "Jane Smith",
                username: "jane_smith",
                email: "janesmith@gmail.com",
                password: "password",
            };
            const uEntity = new UserEntity(user.username, user.email, user.password, user.name);
            const data = {
                userId: uEntity.Id.serialize(),
                name: uEntity.name??null,
                username: uEntity.username,
                email: uEntity.email,
                password: uEntity.password??null,
                updatedAt: uEntity.updatedAt,
                createdAt: uEntity.createdAt
            }
            prisma.user.findUnique = sinon.stub().resolves(data);
            const result = await db.fetchByUsername(uEntity.username);
            expect(result).to.deep.equal(Result.Ok(uEntity));
        });
    });

    describe('findByEmail', () => {
        it('should find a user entity by email', async () => {
            const user = {
                name: "Jane Smith",
                username: "jane_smith",
                email: "janesmith@gmail.com",
                password: "password",
            };
            const uEntity = new UserEntity(user.username, user.email, user.password, user.name);
            const data = {
                userId: uEntity.Id.serialize(),
                name: uEntity.name??null,
                username: uEntity.username,
                email: uEntity.email,
                password: uEntity.password??null,
                updatedAt: uEntity.updatedAt,
                createdAt: uEntity.createdAt
            }
            prisma.user.findUnique = sinon.stub().resolves(data);
            const result = await db.fetchByEmail(uEntity.email);
            expect(result).to.deep.equal(Result.Ok(uEntity));
        });
    });

    describe('update', () => {
        it('should update a user entity', async () => {
            const user = {
                name: "Jane Smith",
                username: "jane_smith",
                email: "janesmith@gmail.com",
                password: "password",
            };
            const uEntity = new UserEntity(user.username, user.email, undefined, user.name);
            const data = {
                userId: uEntity.Id.serialize(),
                name: uEntity.name??null,
                username: uEntity.username,
                email: uEntity.email,
                password: uEntity.password??null,
                updatedAt: uEntity.updatedAt,
                createdAt: uEntity.createdAt
            }
            prisma.user.update = sinon.stub().resolves(data);
            const result = await db.update(uEntity);
            expect(result).to.deep.equal(Result.Ok(uEntity));
        });
    });

    describe('delete', () => {
        it('should delete a user entity', async () => {
            const user = {
                name: "Jane Smith",
                username: "jane_smith",
                email: "janesmith@gmail.com",
            };
            const uEntity = new UserEntity(user.username, user.email, undefined, user.name);
            const data = {
                userId: uEntity.Id.serialize(),
                name: uEntity.name??null,
                username: uEntity.username,
                email: uEntity.email,
                password: uEntity.password??null,
                updatedAt: uEntity.updatedAt,
                createdAt: uEntity.createdAt
            }
            prisma.user.delete = sinon.stub().resolves(data);
            const result = await db.deleteById(uEntity.Id);
            expect(result).to.deep.equal(Result.Ok(uEntity));
        });
    });

});


