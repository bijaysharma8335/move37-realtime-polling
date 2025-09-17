/**
 * Simple seed script to create demo users, a poll with options, and some votes.
 * Run with: node prisma/seed.js
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    // --- Clean up existing data (reset tables) ---
    // Order matters because of foreign key constraints:
    // Delete votes → pollOptions → polls → users
    await prisma.vote.deleteMany();
    await prisma.pollOption.deleteMany();
    await prisma.poll.deleteMany();
    await prisma.user.deleteMany();

    // --- Create Users ---
    const alice = await prisma.user.create({
        data: {
            name: "Alice",
            email: "alice@example.com",
            passwordHash: "password1" // 🔑 In production, hash passwords (bcrypt)
        },
    });

    const bob = await prisma.user.create({
        data: {
            name: "Bob",
            email: "bob@example.com",
            passwordHash: "password2"
        },
    });

    // --- Create a Poll with options ---
    const poll = await prisma.poll.create({
        data: {
            question: "What is your favorite programming language?",
            isPublished: true,
            creatorId: alice.id, // Alice is the creator of this poll
            options: {
                create: [
                    { text: "JavaScript" },
                    { text: "Python" },
                    { text: "TypeScript" },
                    { text: "Go" },
                ],
            },
        },
        include: { options: true }, // Return poll + its options in one query
    });

    // --- Cast Votes ---
    // Alice votes for "JavaScript" (first option)
    await prisma.vote.create({
        data: { userId: alice.id, pollOptionId: poll.options[0].id }
    });

    // Bob votes for "Python" (second option)
    await prisma.vote.create({
        data: { userId: bob.id, pollOptionId: poll.options[1].id }
    });

    console.log("✅ Seed finished. Demo users, poll, options, and votes created.");
}

// --- Run main(), handle errors, and close DB connection ---
main()
    .catch((e) => {
        console.error("❌ Error seeding database:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
