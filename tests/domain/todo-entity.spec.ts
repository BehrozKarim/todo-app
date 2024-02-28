import { expect } from "chai";
import { TaskEntity } from "../../src/domain/todo-entity";
import { UUIDVo } from "@carbonteq/hexapp";

describe('Task Entity', () => {
    describe('create with valid data', () => {
        it('should create a new task entity', () => {
            const task = {
                title: "Do laundry",
                description: "Wash clothes and dry them",
                completed: false,
                userId: "8c07c5c4-096d-4b25-88ca-3cd1e8b0173f",
            };
            const tEntity = TaskEntity.create({title: task.title, description: task.description, userId: task.userId});
            expect(tEntity.Id).to.not.be.undefined;
            expect(tEntity.Id).to.be.instanceOf(UUIDVo);

            expect(tEntity.title).to.equal(task.title);
            expect(tEntity.description).to.equal(task.description);
            expect(tEntity.completed).to.equal(task.completed).to.be.false;
            expect(tEntity.userId).to.equal(task.userId);

            expect(tEntity).to.be.instanceOf(TaskEntity);
            
        });

        it('serialize method should return serialized data', () => {
            const task = {
                title: "Do laundry",
                description: "Wash clothes and dry them",
                completed: false,
                userId: "8c07c5c4-096d-4b25-88ca-3cd1e8b0173f",
            };
            const tEntity = TaskEntity.create({title: task.title, description: task.description, userId: task.userId});
            const serialized = tEntity.serialize();
            expect(serialized).to.be.an('object');
            expect(serialized).to.have.property('Id');
            expect(serialized).to.have.property('title');
            expect(serialized).to.have.property('description');
            expect(serialized).to.have.property('completed');
            expect(serialized).to.have.property('userId');
            expect(serialized).to.have.property('createdAt');
            expect(serialized).to.have.property('updatedAt');

            expect(serialized.Id).to.be.a('string');
            expect(serialized.title).to.equal(task.title);
            expect(serialized.description).to.equal(task.description);
            expect(serialized.completed).to.equal(task.completed);
            expect(serialized.userId).to.equal(task.userId);

        });

        it("Ids are not same when multiple created", () => {
            const task1 = {
                title: "Do laundry",
                description: "Wash clothes and dry them",
                completed: false,
                userId: "8c07c5c4-096d-4b25-88ca-3cd1e8b0173f",
            };
            const task2 = {
                title: "Do laundry",
                description: "Wash clothes and dry them",
                completed: false,
                userId: "8c07c5c4-096d-4b25-88ca-3cd1e8b0173f",
            };
            const tEntity1 = TaskEntity.create({title: task1.title, description: task1.description, userId: task1.userId});
            const tEntity2 = TaskEntity.create({title: task2.title, description: task2.description, userId: task2.userId});
            expect(tEntity1.Id).to.not.equal(tEntity2.Id);
        });

        it("updating entities should update the updatedAt field", () => {
            const task = {
                title: "Do laundry",
                description: "Wash clothes and dry them",
                completed: false,
                userId: "8c07c5c4-096d-4b25-88ca-3cd1e8b0173f",
            };
            const tEntity = TaskEntity.create({title: task.title, description: task.description, userId: task.userId});
            const updatedAt = tEntity.updatedAt;
            let serialized = tEntity.serialize();
            setTimeout(() => {}, 100);
            serialized.updatedAt = new Date()
            const ent = TaskEntity.fromSerialized(serialized)
            expect(ent.updatedAt).to.not.equal(updatedAt);
            expect(ent.updatedAt).to.not.equal(ent.createdAt);
        })
    });
});

