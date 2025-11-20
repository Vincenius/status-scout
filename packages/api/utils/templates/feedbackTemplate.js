const feedbackTemplate = ({ userId }) => `<mjml>
  <mj-head>
    <mj-attributes>
      <mj-all font-family="Helvetica, Arial, sans-serif" />
      <mj-button background-color="#007bff" color="#ffffff" border-radius="4px" padding="20px" />
      <mj-text font-size="16px" line-height="1.5" color="#333333" />
    </mj-attributes>
  </mj-head>
  <mj-body>
    <mj-section padding="30px 0 10px 0">
      <mj-column>
        <mj-text>
          <p>Hi there,</p>
          <p>Thanks a lot for trying out StatusScout! I’d really love to hear about your experience: what you liked, what didn’t work, or anything you think we could improve.</p>
          <p>Any honest feedback means a lot and will help us make StatusScout better.</p>
          <p>Thanks in advance!</p>

          <p>Cheers,<br/>
Vincent</p>

        	P.S. If you’d prefer not to receive any more emails from me, just click <a href="${`${process.env.APP_URL}/unsubscribe?id=${userId}`}">unsubscribe</a>.
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`;

export default feedbackTemplate;