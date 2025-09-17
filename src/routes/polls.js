const express = require('express');

module.exports = ({ broadcastPollCounts, prisma }) => {
  const router = express.Router();

  router.post('/', async (req, res) => {
    const { question, creatorId, options, isPublished } = req.body;
    if (!question || !creatorId || !options?.length) {
      return res.status(400).json({ error: "question, creatorId, options required" });
    }
    const poll = await prisma.poll.create({
      data: {
        question,
        creatorId,
        isPublished: !!isPublished,
        options: { create: options.map(text => ({ text })) }
      },
      include: { options: true }
    });
    res.json(poll);
  });

  router.get('/:id', async (req, res) => {
    const poll = await prisma.poll.findUnique({
      where: { id: Number(req.params.id) },
      include: { options: { include: { votes: true } }, creator: true }
    });
    if (!poll) return res.status(404).json({ error: "Not found" });
    res.json({
      id: poll.id,
      question: poll.question,
      isPublished: poll.isPublished,
      creator: poll.creator,
      options: poll.options.map(o => ({ id: o.id, text: o.text, count: o.votes.length }))
    });
  });

  return router;
};
