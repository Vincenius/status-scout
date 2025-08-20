import { createAccount } from '../utils/brevo.js';

export default async function waitlistRoutes(fastify, opts) {
  fastify.post('/', { config: { auth: false } }, async (request, reply) => {
    const body = request.body || {}

    const res = await createAccount({
      email: body.email,
      firstName: body.name,
      listId: 3,
    })

    return { message: 'OK', res }
  })
}
