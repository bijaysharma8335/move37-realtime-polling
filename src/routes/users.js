const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();


// Create a new user
router.post('/', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: "All fields required" });
  const user = await prisma.user.create({ data: { name, email, passwordHash: password } });
  res.json(user);
});


//get the user by id
router.get('/:id', async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: Number(req.params.id) },
    include: { polls: true, votes: true }
  });
  if (!user) return res.status(404).json({ error: "Not found" });
  res.json(user);
});

module.exports = router;
