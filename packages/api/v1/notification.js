import { sendSms } from "../utils/bird.js";
import { sendEmail, getHtml } from "../utils/email.js"
import template from '../utils/templates/notificationEmail.js'
import { getNotificationMessage } from "@statusscout/shared"

const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);

const getMessage = ({ type, website, notifications }) => {
  const websiteName = website?.domain || 'your website'
  return `[StatusScout] New ${type} issues detected on ${websiteName}:\n\n${notifications.map(n => `• ${getNotificationMessage(n)}`).join('\n')}\n\nRead the report here: ${process.env.APP_URL}/website/${website?.index}/report`
}

export default async function notificationRoutes(fastify, opts) {
  fastify.post('/', { config: { auth: false } }, async (request, reply) => {
    if (request.headers['x-api-key'] === process.env.API_KEY) {
      const body = request.body || {}
      const { type, website, notifications, channel } = body

      if (channel?.type === 'email') {
        const emailMjml = template({
          type: type,
          website: website,
          notifications: notifications
        })
        const emailHtml = getHtml(emailMjml)

        await sendEmail({
          to: channel.value,
          subject: `[StatusScout] ${capitalize(type)} Issue Report for ${website?.domain}`,
          html: emailHtml
        })
      }

      if (channel?.type === 'sms') {
        await sendSms({
          phoneNumber: channel.value,
          message: getMessage({ type, website, notifications })
        })
      }

      return { message: 'OK' }
    } else {
      return reply.code(401).send({ message: 'Unauthorized' })
    }
  })
}
