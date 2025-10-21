import { ObjectId } from "mongodb";
import { getIssueHistory, checkDefaultNotifications } from '@statusscout/shared'
import { sendNotifications } from './utils/sendNotifications.js';
// {
//   "createdAt": "2025-10-08T11:03:18.683Z",
//   "jobId": "204",
//   "issues": [
//     {
//       "createdAt": "2025-10-08T11:03:18.683Z",
//       "check": "custom",
//       "title": "12323123123",
//       "jobId": "204",
//       "resolvedAt": "2025-10-08T11:31:26.073Z"
//     }
//   ],
//   "result": {
//     "status": "warning"
//   }
// }


const runNotifications = async ({ db, website }) => {
  console.log('checking for notifications for', website.domain)

  const [uptime, checks] = await Promise.all([
    db.collection('checks').find({ websiteId: website._id, check: 'uptime' })
      .sort({ createdAt: -1 })
      .limit(2)
      .toArray(),
    db.collection('checks').aggregate([
      { $match: { websiteId: website._id, check: { $ne: 'uptime' } } },
      { $sort: { check: 1, createdAt: -1 } },
      {
        $group: {
          _id: "$check",
          entries: { $push: "$$ROOT" }
        }
      },
      {
        $project: {
          _id: 0,
          check: "$_id",
          entries: { $slice: ["$entries", 2] }
        }
      },
      { $unwind: "$entries" },
      { $replaceRoot: { newRoot: "$entries" } }
    ]).toArray(),
  ])

  const issues = getIssueHistory(checks)
  const notifications = {
    ...checkDefaultNotifications,
    ...(website?.notifications || {})
  }

  const criticalNotifications = []

  if (notifications.uptime === 'critical') {
    if (uptime.length === 2) {
      const [prev, recent] = uptime
      if (prev?.result?.status === 'success' && recent?.result?.status !== 'success') {
        criticalNotifications.push({ type: 'uptime', createdAt: recent.createdAt, jobId: recent.jobId, details: 'Uptime check failed' })
      }
    }
  }

  const recentIssues = issues[1]?.issues || []
  for (const issue of recentIssues) {
    if (notifications[issue.check] === 'critical') {
      criticalNotifications.push({ type: issue.check, createdAt: issue.createdAt, jobId: issue.jobId, details: issue.title })
    }
  }

  if (criticalNotifications.length) {
    await sendNotifications({ db, type: 'critical', website, notifications: criticalNotifications })
  }
}

// new function for daily trigger

// check if any new issues in last 24h
// check if issues still active (using resolvedAt)

export default runNotifications;