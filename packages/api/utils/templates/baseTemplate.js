// TODO replace logo link

const baseTemplate = ({ content, unsubscribeLink }) => `
<mjml>
  <mj-head>
    <mj-attributes>
      <mj-all font-family="Helvetica, Arial, sans-serif" />
      <mj-button background-color="#007bff" color="#ffffff" border-radius="4px" padding="20px" />
      <mj-text font-size="16px" line-height="1.5" color="#333333" />
    </mj-attributes>
  </mj-head>
  <mj-body background-color="#f9f9f9">
    <mj-section padding="40px 0">
      <mj-column width="100%" vertical-align="middle">
        <mj-image src="${process.env.APP_URL}/text-logo.png" alt="StatusScout Logo" width="240px" />
      </mj-column>
    </mj-section>

    <mj-section background-color="#ffffff" border-radius="8px" padding="40px 20px" text-align="center">
      ${content}
    </mj-section>

    <mj-section padding="30px 0 10px 0">
      <mj-column>
        <mj-image src="${process.env.APP_URL}/text-logo.png" alt="StatusScout Logo" width="120px" />
        <mj-text align="center" font-size="12px">
          <a href="https://statusscout.dev">StatusScout.dev</a><br/>
          <a href="mailto:hello@statusscout.dev">hello@statusscout.dev</a>
        </mj-text>
        ${unsubscribeLink && `<mj-text align="center" font-size="12px" color="#999999">
          <a href="${unsubscribeLink}" style="color:#999999; text-decoration:underline;">
            Unsubscribe
          </a>
        </mj-text>`}
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
`

export default baseTemplate