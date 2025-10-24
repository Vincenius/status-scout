import { sendEmail } from '../utils/email.js'
import mjml2html from 'mjml'

const emailTemplate = ({ email = '', website = '', feedback = '' }) => mjml2html(`<mjml>
  <mj-body>
    <mj-section background-color="#f3f3f3">
      <mj-column>
        <mj-text font-weight="bold" font-size="24px" color="#000" font-family="helvetica">You got some feedback:</mj-text>
        <mj-text font-size="15px" color="#000" font-family="helvetica">Email: ${email}</mj-text>
        <mj-text font-size="15px" color="#000" font-family="helvetica">Website: ${website}</mj-text>
        <mj-text font-size="15px" color="#000" font-family="helvetica">Feedback:<br/>${feedback.replace(/\n/g, '<br/>')}</mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`).html

export default async function feedbackRoutes(fastify, opts) {

  fastify.post('/', { config: { auth: false } }, async (request, reply) => {
    const body = request.body || {}

    await sendEmail({
      to: 'hello@statusscout.dev',
      subject: 'StatusScout Feedback',
      html: emailTemplate(body),
    })

    return { message: 'OK' }
  })
}