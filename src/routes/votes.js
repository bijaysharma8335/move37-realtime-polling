const express = require('express');

module.exports = ({ broadcastPollCounts, prisma }) => {
  const router = express.Router();


  //create vote and broadcast poll counts
  router.post('/', async (req, res) => {
    const { userId, pollOptionId } = req.body;
    if (!userId || !pollOptionId) return res.status(400).json({ error: "userId, pollOptionId required" });

    try {
      const vote = await prisma.vote.create({
        data: { userId, pollOptionId },
        include: { pollOption: true }
      });
      await broadcastPollCounts(vote.pollOption.pollId);
      res.json(vote);
    } catch (err) {
      if (err.code === "P2002") return res.status(400).json({ error: "duplicate vote" });
      res.status(500).json({ error: "server error" });
    }
  });

  return router;
};
