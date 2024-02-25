import { expect } from "chai";
import { UserEntity } from "../../src/domain/user-entity";
import { UUIDVo } from "@carbonteq/hexapp";

describe('User Entity', () => {
    describe('create with valid data', () => {
        it('should create a new user entity', () => {
            const user = {
                name: "Jane Smith",
                username: "jane_smith",
                email: "janesmith@gmail.com",
                password: "password",
            };
            const uEntity = UserEntity.create({username: user.username, email: user.email, password: user.password, name: user.name});
            expect(uEntity.Id).to.not.be.undefined;
            expect(uEntity.Id).to.be.instanceOf(UUIDVo);

            expect(uEntity.name).to.equal(user.name);
            expect(uEntity.username).to.equal(user.username);
            expect(uEntity.email).to.equal(user.email);
            expect(uEntity.password).to.equal(user.password);

            expect(uEntity).to.be.instanceOf(UserEntity);
            
        });

        it('serialize method should return serialized data', () => {
            const user = {
                name: "Jane Smith",
                username: "jane_smith",
                email: "janesmith@gmail.com",
                password: "password",
            };
            const uEntity = UserEntity.create({username: user.username, email: user.email, password: user.password, name: user.name});
            const serialized = uEntity.serialize();
            expect(serialized).to.be.an('object');
            expect(serialized).to.have.property('Id');
            expect(serialized).to.have.property('name');
            expect(serialized).to.have.property('username');
            expect(serialized).to.have.property('email');
            expect(serialized).to.have.property('password');
            expect(serialized).to.have.property('createdAt');
            expect(serialized).to.have.property('updatedAt');

            expect(serialized.Id).to.be.a('string');
            expect(serialized.name).to.equal(user.name);
            expect(serialized.username).to.equal(user.username);
            expect(serialized.email).to.equal(user.email);
            expect(serialized.password).to.equal(user.password);

        });

        it("Ids are not same when multiple created", () => {
            const user1 = {
                name: "Jane Smith",
                username: "jane_smith",
                email: "janesmith@gmail.com",
                password: "password",
            };

            const user2 = {
                name: "John Smith",
                username: "john_smith",
                email: "johnsmith@gmail.com",
                password: "password",
            };

            const uEntity1 = UserEntity.create({username: user1.username, email: user1.email, password: user1.password, name: user1.name});
            const uEntity2 = UserEntity.create({username: user2.username, email: user2.email, password: user2.password, name: user2.name});
            expect(uEntity1.Id).to.not.equal(uEntity2.Id);
        });

        it("updating entities should update the updatedAt field", () => {
            const user = {
                name: "Jane Smith",
                username: "jane_smith",
                email: "janesmith@gmail.com",
                password: "password",
            };
            const uEntity = UserEntity.create({username: user.username, email: user.email, password: user.password, name: user.name});
            let serialized = uEntity.serialize();
            serialized.updatedAt = new Date()
            const updatedAt = uEntity.updatedAt;
            setTimeout(() => {}, 100);

            uEntity.fromSerialized(serialized);
            expect(uEntity.updatedAt).to.not.equal(updatedAt);
            expect(uEntity.updatedAt).to.not.equal(uEntity.createdAt);
        });
    });
});