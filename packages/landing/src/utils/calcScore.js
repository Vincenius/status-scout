const calcScore = (count, maxAmount) => {
  if (count <= 0) return 100;
  if (count >= maxAmount) return 0;

  // Quadratic decay
  const s = 100 * Math.pow(1 - count / maxAmount, 2);
  return Math.round(s);
}

export default calcScore