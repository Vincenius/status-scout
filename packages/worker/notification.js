import { ObjectId } from "mongodb";
import { getIssueHistory } from '@statusscout/shared'

const runNotifications = async ({ db, website }) => {
  console.log('checking for notifications for', website.domain)

  const [uptime, checks] = await Promise.all([
    db.collection('checks').find({ websiteId: new ObjectId(website._id), check: 'uptime' })
      .sort({ createdAt: 1 })
      .limit(2)
      .toArray(),
    db.collection('checks').aggregate([
      { $match: { websiteId: new ObjectId(website._id), check: { $ne: 'uptime' } } },
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
  console.log({ issues, uptime })

  // if prev uptime was up and now down & critical notification -> send notification

  // if recent job has new issues with critical -> send notification
}

// new function for daily trigger

// check if any new issues in last 24h
// check if issues still active

export default runNotifications;