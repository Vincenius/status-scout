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


export const runNotifications = async ({ db, website }) => {
  console.log('checking critical notifications for', website.domain)

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


export const runDailyNotification = async ({ db, website }) => {
  console.log('checking daily notifications for', website.domain)

  // only consider checks from the last 24 hours
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000)

  const [uptime, [todayCheck], [yesterdayCheck]] = await Promise.all([
    db.collection('checks').find({ websiteId: website._id, check: 'uptime', createdAt: { $gte: since.toISOString() } })
      .sort({ createdAt: -1 })
      .limit(2)
      .toArray(),
    db.collection('checks').aggregate([
      { $match: { websiteId: website._id, check: { $ne: 'uptime' }, createdAt: { $gte: since.toISOString() }, checkType: 'full' } },
      { $sort: { check: 1, createdAt: -1 } },
      {
        $group: {
          _id: "$check",
          latest: { $first: "$$ROOT" }
        }
      },
      {
        $replaceRoot: { newRoot: "$latest" }
      }
    ]).toArray(),
    db.collection('checks').aggregate([
      { $match: { websiteId: website._id, check: { $ne: 'uptime' }, createdAt: { $lt: since.toISOString() }, checkType: 'full' } },
      { $sort: { check: 1, createdAt: -1 } },
      {
        $group: {
          _id: "$check",
          latest: { $first: "$$ROOT" }
        }
      },
      {
        $replaceRoot: { newRoot: "$latest" }
      }
    ]).toArray(),
  ])

  console.log({ todayCheck, yesterdayCheck })

  if (!todayCheck || !yesterdayCheck) {
    console.log('not enough data for daily notification')
    return
  }

  const issues = getIssueHistory([...checks, ...latestCheck])
  issues.pop()

  const notifications = {
    ...checkDefaultNotifications,
    ...(website?.notifications || {})
  }

  const dailyNotifications = []

  if (notifications.uptime === 'daily') {
    if (uptime.length >= 2) {
      const [prev, recent] = uptime
      if (prev?.result?.status === 'success' && recent?.result?.status !== 'success') {
        dailyNotifications.push({ type: 'uptime', createdAt: recent.createdAt, jobId: recent.jobId, details: 'Uptime check failed' })
      }
    }
  }

  const allIssues = issues.map(issueGroup => issueGroup.issues).flat()
    .filter(i => !i.resolvedAt)

  for (const issue of allIssues) {
    if (notifications[issue.check] === 'daily') {
      dailyNotifications.push({ type: issue.check, createdAt: issue.createdAt, jobId: issue.jobId, details: issue.title })
    }
  }

  if (dailyNotifications.length) {
    await sendNotifications({ db, type: 'daily', website, notifications: dailyNotifications })
  }
}
