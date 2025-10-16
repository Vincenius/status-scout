export const mapUser = (user) => {
  return {
    email: user.email,
    subscription: user.subscription,
    confirmed: user.confirmed,
    notificationChannels: user.notificationChannels
      ? user.notificationChannels.map(c => ({ type: c.type, value: c.value, verified: c.verified, id: c.id }))
      : [],
  };
};
