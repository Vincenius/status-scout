export const sendVerification = async ({ phonenumber }) => {
  const response = await fetch(`https://api.bird.com/workspaces/${process.env.BIRD_WORKSPACE_ID}/verify`, {
    method: 'POST',
    headers: {
      "Authorization": `AccessKey ${process.env.BIRD_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "identifier": {
        "phonenumber": phonenumber,
      },
      steps: [
        {
          "channelId": process.env.BIRD_CHANNEL_ID
        },
        {
          "navigatorId": process.env.BIRD_NAVIGATOR_ID
        }]
    })
  });

  return response.json();
};

export const checkVerification = async ({ verificationId, code }) => {
  const response = await fetch(`https://api.bird.com/workspaces/${process.env.BIRD_WORKSPACE_ID}/verify/${verificationId}`, {
    method: 'POST',
    headers: {
      "Authorization": `AccessKey ${process.env.BIRD_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "code": code
    })
  });

  return response.json();
};
