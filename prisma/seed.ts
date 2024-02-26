// prisma/seed.ts

import { PrismaClient } from '@prisma/client';
import {faker} from '@faker-js/faker';
import * as bcrypt from 'bcrypt';
import * as asyncjs from 'async';
const prisma = new PrismaClient();
type user = {
    name: string;
    userId: string;
    username: string;
    email: string;
    password: string;
}

type todo = {
    id: string;
    title: string;
    description: string;
    userId: string;
}

let users: user[] = [];
// todos is a dict with userId as key and an array of todos as value
let todos: {[key: string]: todo[]} = {};

async function createData() {
    for (let i = 0; i < 10; i++) {
        const user = {
            name: faker.person.fullName(),
            userId: faker.string.uuid(),
            username: faker.internet.userName(),
            email: faker.internet.email(),
            password: await bcrypt.hash(faker.internet.password(), 10),
        }
        users.push(user);

        for (let j = 0; j < 5; j++)
        {
            const task = {
                id: faker.string.uuid(),
                title: faker.lorem.sentence(),
                description: faker.lorem.paragraph(),
                userId: user.userId
            }
            todos[user.userId] = todos[user.userId] || [];
            todos[user.userId].push(task);
        }
    }
}

async function seedData(data: user){
    await prisma.user.create({
        data: data
    });

    await asyncjs.each(todos[data.userId], async (task) => {
        await prisma.todo.create({
            data: task
        });
    });
}

async function main() {
    await createData();
    await asyncjs.each(users, async (user) => {
        await seedData(user);
    });
}

main()
    .catch(e => {
        throw e
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
