// import fastifyPassport from '@fastify/passport';

// export default async function authRoutes(fastify, opts) {
//   // Login route
//   fastify.post(
//     '/login',
//     { preValidation: fastifyPassport.authenticate('local', { failWithError: true }), config: { auth: false } },
//     async (req, reply) => {
//       // await req.logIn(req.user); todo later on
//       return { message: 'Logged in', user: req.user };
//     }
//   );

//   // Logout route
//   fastify.get('/logout', { config: { auth: false } }, async (req, reply) => {
//     await req.logout();
//     return { message: 'Logged out' };
//   });
// }

import fastifyPassport from '@fastify/passport';

export default async function authRoutes(fastify, opts) {
  fastify.post(
    '/login',
    {
      preValidation: fastifyPassport.authenticate('local', { failWithError: true }),
      config: { auth: false }
    },
    async (req, reply) => {
      // already logged in with secureSession
      return { message: 'Logged in', user: req.user };
    }
  );

  fastify.get('/logout', { config: { auth: false } }, async (req, reply) => {
    await req.logout();
    return { message: 'Logged out' };
  });
}
