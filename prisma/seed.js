/**
 * Simple seed script to create demo users, a poll with options and some votes.
 * Run with: node prisma/seed.js
 */
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    await prisma.vote.deleteMany();
    await prisma.pollOption.deleteMany();
    await prisma.poll.deleteMany();
    await prisma.user.deleteMany();

    const alice = await prisma.user.create({
        data: { name: "Alice", email: "alice@example.com", passwordHash: "password1" },
    });
    const bob = await prisma.user.create({
        data: { name: "Bob", email: "bob@example.com", passwordHash: "password2" },
    });
    const poll = await prisma.poll.create({
        data: {
            question: "What is your favorite programming language?",
            isPublished: true,
            creatorId: alice.id,
            options: {
                create: [
                    { text: "JavaScript" },
                    { text: "Python" },
                    { text: "TypeScript" },
                    { text: "Go" },
                ],
            },
        },
        include: { options: true },
    });

    // Cast a couple of votes
    await prisma.vote.create({ data: { userId: alice.id, pollOptionId: poll.options[0].id } });

    await prisma.vote.create({ data: { userId: bob.id, pollOptionId: poll.options[1].id } });

    console.log("Seed finished.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
