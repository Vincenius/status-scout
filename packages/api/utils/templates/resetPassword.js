import baseTemplate from "./baseTemplate"

// TODO USE
const resetPassword = ({ token }) => baseTemplate({
  content: `<mj-column>
    <mj-text font-size="28px" font-weight="bold" padding-bottom="20px">
      Reset Your Password
    </mj-text>
    </mj-text>
    <mj-text>
      We received a request to reset the password for your account.<br/>
      To set a new password, please click the button below within the next hour:
    </mj-text>
    <mj-button href="${process.env.APP_URL}/reset-password?token=${token}" padding-top="20px">
      Reset Password
    </mj-button>
    <mj-text font-size="14px" color="#999999" padding-top="20px">
      If you didn’t request this change, you can safely ignore this email. Your password will remain the same.
    </mj-text>
  </mj-column>`
})

export default resetPassword