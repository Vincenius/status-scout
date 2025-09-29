import { ObjectId } from 'mongodb'
import fastifyPassport from '@fastify/passport';
import { connectDB } from '../db.js'

export default async function flowRoutes(fastify, opts) {
  fastify.get('/flows',
    { preValidation: fastifyPassport.authenticate('session', { failureRedirect: '/login' }) },
    async (request, reply) => {
      const user = request.user
      const { websiteId } = request.query
      if (!websiteId) {
        reply.code(400).send({ error: 'websiteId is required' });
        return;
      }

      const db = await connectDB();

      try {
        const website = await db.collection('websites').findOne({
          userId: user._id,
          deleted: { $ne: true },
          index: websiteId,
        })

        const flows = await db
          .collection('flows')
          .find({ websiteId: website._id.toString() })
          .toArray();

        return flows;
      } catch (e) {
        console.error(e);
        reply.code(500).send({ error: 'Internal server error' });
      }
    });

  fastify.post('/flows',
    { preValidation: fastifyPassport.authenticate('session', { failureRedirect: '/login' }) },
    async (request, reply) => {
      const user = request.user
      const body = request.body

      // todo validate body

      const { websiteId, check } = body
      const { name, steps } = check

      const db = await connectDB()

      try {
        const website = await db.collection('websites').findOne({
          userId: user._id,
          deleted: { $ne: true },
          _id: new ObjectId(websiteId),
        })

        if (!website) {
          reply.code(400).send({ error: 'Website not found' });
          return;
        }

        const result = await db.collection('flows').insertOne({
          websiteId: websiteId,
          createdAt: new Date(),
          name,
          steps,
        });

        return { id: result.insertedId };
      } catch (e) {
        console.error(e)
        reply.code(500).send({ error: 'Internal server error' });
      }
    })

  fastify.delete('/flows/:id',
    { preValidation: fastifyPassport.authenticate('session', { failureRedirect: '/login' }) },
    async (request, reply) => {
      const user = request.user
      const { id } = request.params

      const db = await connectDB()

      try {
        const flow = await db.collection('flows').findOne({ _id: new ObjectId(id) })
        if (!flow) {
          reply.code(404).send({ error: 'Flow not found' });
          return;
        }

        const website = await db.collection('websites').findOne({
          _id: new ObjectId(flow.websiteId),
          userId: user._id,
          deleted: { $ne: true },
        })

        if (!website) {
          reply.code(403).send({ error: 'Forbidden' });
          return;
        }

        await db.collection('flows').deleteOne({ _id: new ObjectId(id) })

        reply.code(204).send();
      } catch (e) {
        console.error(e)
        reply.code(500).send({ error: 'Internal server error' });
      }
    });

  fastify.put('/flows',
    { preValidation: fastifyPassport.authenticate('session', { failureRedirect: '/login' }) },
    async (request, reply) => {
      const user = request.user
      const body = request.body

      // todo validate body

      const { websiteId, check } = body
      const { name, steps, editId } = check

      const db = await connectDB()

      try {
        const [website, flow] = await Promise.all([
          db.collection('websites').findOne({
            userId: user._id,
            deleted: { $ne: true },
            _id: new ObjectId(websiteId),
          }),
          db.collection('flows').findOne({ _id: new ObjectId(editId) })
        ])

        if (!website) {
          reply.code(400).send({ error: 'Website not found' });
          return;
        }

        if (!flow) {
          reply.code(404).send({ error: 'Flow not found' });
          return;
        }

        if (flow.websiteId !== websiteId) {
          reply.code(403).send({ error: 'Forbidden' });
          return;
        }

        await db.collection('flows').updateOne(
          { _id: new ObjectId(editId) },
          { $set: { name, steps } }
        );

        return { id: editId };
      } catch (e) {
        console.error(e)
        reply.code(500).send({ error: 'Internal server error' });
      }
    });
}
