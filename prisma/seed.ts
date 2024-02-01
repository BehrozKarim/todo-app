// prisma/seed.ts

import { PrismaClient } from '@prisma/client';
import {faker} from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    
    for (let i = 0; i < 10; i++) {
        const user = await prisma.user.create({
            data: {
                name: faker.person.fullName(),
                userId: faker.string.uuid(),
                username: faker.internet.userName(),
                email: faker.internet.email(),
                password: await bcrypt.hash(faker.internet.password(), 10),
            },
        })

        for (let j = 0; j < 5; j++)
        {
            const task = await prisma.todo.create({
                data: {
                    id: faker.string.uuid(),
                    title: faker.lorem.sentence(),
                    description: faker.lorem.paragraph(),
                    userId: user.userId,
                },
            })
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

