import Fastify from 'fastify'

const fastify = Fastify({
  logger: true,
})

fastify.post('/', async function handler (req, res) {
  // todo check if website was already checked today -> check account status (paid / free)
  // run check
  console.log(req.body)
  return { hello: 'world' }
})

try {
  await fastify.listen({ port: 3001 })
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}