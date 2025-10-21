import baseTemplate from "./baseTemplate.js"
import { getNotificationMessage } from "@statusscout/shared"

const notificationEmail = ({ type, notifications, website }) => baseTemplate({
  content: `<mj-column>
    <mj-text font-size="28px" font-weight="bold" padding-bottom="20px">
      ${type === 'critical' ? 'Critical Issues Detected' : 'New Issues Detected'}
    </mj-text>
    <mj-text>
      We have detected the following issues on your monitored website (${website.domain}):
    </mj-text>
    
    <mj-text font-size="16px">
      ${notifications.map(notification => `
        • ${getNotificationMessage(notification)}
      `).join('<br/>')}
    </mj-text>

    <mj-text>
      Read the full report here:
    </mj-text>
    <mj-button href="${process.env.APP_URL}/website/${website.index}/report" padding-top="20px">
      View Report
    </mj-button>
    <mj-text font-size="14px" color="#999999" padding-top="20px">
      You can update your notification preferences in your <a href="${process.env.APP_URL}/website/${website.index}/settings">website settings</a>.
    </mj-text>
  </mj-column>`
})

export default notificationEmail