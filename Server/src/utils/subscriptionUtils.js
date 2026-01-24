
export const isSubscriptionExpired = (subscription) => {
  if (!subscription) {
    return true;
  }

  if (!subscription.isActive) {
    return true;
  }

  const now = new Date();
  const endDate = subscription.endDate ? new Date(subscription.endDate) : null;

  if (endDate && endDate < now) {
    return true;
  }

  return false;
};

export const getSubscriptionStatus = (subscription) => {
  if (!subscription) {
    return "expired";
  }

  if (!subscription.isActive) {
    return "expired";
  }

  const now = new Date();
  const endDate = subscription.endDate ? new Date(subscription.endDate) : null;

  if (endDate && endDate < now) {
    return "expired";
  }

  if (endDate) {
    const daysUntilExpiry = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
      return "expiring";
    } else if (daysUntilExpiry > 7) {
      return "active";
    } else {
      return "expired";
    }
  }

  return "active";
};
