import baseTemplate from "./baseTemplate.js"

const notificationEmail = ({ userId }) => baseTemplate({
  unsubscribeLink: `${process.env.APP_URL}/unsubscribe?id=${userId}`,
  content: `<mj-column>
    <mj-text font-size="28px" font-weight="bold" padding-bottom="20px">
      Your Trial is Ending Soon
    </mj-text>
    <mj-text>
      We hope you've enjoyed using StatusScout during your trial period. If you have any feedback or questions, feel free to reach out by answering to this email.
    </mj-text>
    
    <mj-text>
      To continue monitoring your websites without interruption, consider upgrading to one of our paid plans.
    </mj-text>

    <mj-button href="${process.env.APP_URL}/checkout" padding-top="20px">
      Upgrade Now
    </mj-button>

    <mj-text>
      Thank you for choosing StatusScout! We look forward to continuing to support your website monitoring needs.
    </mj-text>
  </mj-column>`
})

export default notificationEmail