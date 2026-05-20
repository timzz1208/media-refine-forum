export function averageScore(item) {
  if (!item.ratings.length) return 0;
  const totals = item.ratings.map(rating => (
    rating.useful + rating.copy + rating.insight + rating.convert + rating.fit
  ) / 5);
  return totals.reduce((sum, score) => sum + score, 0) / totals.length;
}

export function itemStatus(item) {
  if (item.extracted) return "extracted";
  if (averageScore(item) >= 4) return "refining";
  return "pending";
}

export function toFixedScore(score) {
  return Number(score || 0).toFixed(1);
}
