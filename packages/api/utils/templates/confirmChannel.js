import baseTemplate from "./baseTemplate.js"

const confirmChannel = ({ token }) => baseTemplate({
  content: `<mj-column>
    <mj-text font-size="28px" font-weight="bold" padding-bottom="20px">
      Confirm your new notification channel
    </mj-text>
    <mj-text>
      To complete adding this email address as a notification channel, please confirm your email address by clicking the button below:
    </mj-text>
    <mj-button href="${process.env.APP_URL}/verify-channel?token=${token}" padding-top="20px">
      Verify Email
    </mj-button>
    <mj-text font-size="14px" color="#999999" padding-top="20px">
      If you didn’t add this notification channel, you can safely ignore this email.
    </mj-text>
  </mj-column>`
})

export default confirmChannel