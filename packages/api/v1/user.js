import fastifyPassport from '@fastify/passport';
import CryptoJS from 'crypto-js'
import { v4 as uuidv4 } from 'uuid';
import { mapUser } from '../utils/user.js';
import { connectDB } from '../db.js';
import confirmChannel from '../utils/templates/confirmChannel.js';
import { getHtml, sendEmail } from '../utils/email.js';

export default async function userRoutes(fastify, opts) {
  fastify.get('/',
    { preValidation: fastifyPassport.authenticate('session', { failureRedirect: '/login' }) },
    async (request, reply) => {
      try {
        const user = request.user

        return mapUser(user)
      } catch (e) {
        console.error(e)
        reply.code(500).send({ error: 'Internal server error' });
      }
    })

  fastify.post('/notification-channel',
    { preValidation: fastifyPassport.authenticate('session', { failureRedirect: '/login' }) },
    async (request, reply) => {
      try {
        const { type, value } = request.body

        if (!type || !value) {
          return reply.code(400).send({ error: 'Invalid input' })
        }

        const user = request.user
        const db = await connectDB()

        const prevChannels = user.notificationChannels || []

        if (
          prevChannels.find(c => c.type === type && c.value === value) ||
          (type === 'email' && value === user.email)
        ) {
          return reply.code(409).send({ error: 'This channel already exists' })
        } else {
          let verificationToken = null
          if (type === 'email') {
            verificationToken = uuidv4()
            const emailMjml = confirmChannel({ token: verificationToken })
            const emailHtml = getHtml(emailMjml)
            await sendEmail({
              to: value,
              subject: 'Confirm your new email notification channel',
              html: emailHtml
            })
          }
          const updatedChannels = [...prevChannels, { type, value, verificationToken, verified: false }]

          await db.collection('users').updateOne({ _id: user._id }, {
            $set: { notificationChannels: updatedChannels }
          }, { returnDocument: 'after' })

          return { success: true }
        }
      } catch (e) {
        console.error(e)
        reply.code(500).send({ error: 'Internal server error' });
      }
    })

  fastify.delete('/notification-channel',
    { preValidation: fastifyPassport.authenticate('session', { failureRedirect: '/login' }) },
    async (request, reply) => {
      try {
        const { index } = request.query
        const idx = Number(index)

        if (isNaN(idx)) {
          return reply.code(400).send({ error: 'Invalid input' })
        }

        const user = request.user
        const db = await connectDB()

        const prevChannels = user.notificationChannels || []

        if (idx < 0 || idx  >= prevChannels.length) {
          return reply.code(404).send({ error: 'This channel does not exist' })
        } else {
          const updatedChannels = prevChannels.filter((_, i) => i !== idx)

          await db.collection('users').updateOne({ _id: user._id }, {
            $set: { notificationChannels: updatedChannels }
          }, { returnDocument: 'after' })

          return { success: true }
        }
      } catch (e) {
        console.error(e)
        reply.code(500).send({ error: 'Internal server error' });
      }
    })

  fastify.put('/password',
    { preValidation: fastifyPassport.authenticate('session', { failureRedirect: '/login' }) },
    async (request, reply) => {
      try {
        const { currentPassword, newPassword } = request.body

        // Validate input
        if (!currentPassword || !newPassword) {
          return reply.code(400).send({ error: 'Invalid input' })
        }

        const user = request.user

        const hashedCurrentPassword = CryptoJS.SHA256(currentPassword, process.env.PASSWORD_HASH_SECRET).toString(CryptoJS.enc.Hex)

        if (hashedCurrentPassword !== user.password) {
          return reply.code(403).send({ error: 'Current password is incorrect' })
        } else {
          const db = await connectDB()
          const hashedNewPassword = CryptoJS.SHA256(newPassword, process.env.PASSWORD_HASH_SECRET).toString(CryptoJS.enc.Hex)
          await db.collection('users').updateOne({ _id: user._id }, {
            $set: { password: hashedNewPassword }
          }, { returnDocument: 'after' })

          return { success: true }
        }
      } catch (e) {
        console.error(e)
        reply.code(500).send({ error: 'Internal server error' });
      }
    })
}
