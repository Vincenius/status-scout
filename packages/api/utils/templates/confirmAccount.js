import baseTemplate from "./baseTemplate"

// todo use
const confirmAccount = ({ verificationLink }) => baseTemplate({
  content: `<mj-column>
    <mj-text font-size="28px" font-weight="bold" padding-bottom="20px">
      Welcome to StatusScout!
    </mj-text>
    </mj-text>
    <mj-text>
      To complete your registration, please confirm your email address by clicking the button below:
    </mj-text>
    <mj-button href="${verificationLink}" padding-top="20px">
      Verify Email
    </mj-button>
    <mj-text font-size="14px" color="#999999" padding-top="20px">
      If you didn’t sign up for StatusScout, you can safely ignore this email.
    </mj-text>
  </mj-column>`
})

export default confirmAccount