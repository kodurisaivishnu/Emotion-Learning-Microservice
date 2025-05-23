export const getDominantEmotion = (logs) => {
  const counts = getEmotionBreakdown(logs);

  let maxEmotion = null;
  let maxCount = -1;

  for (const [emotion, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count;
      maxEmotion = emotion;
    }
  }

  return maxEmotion;
};


export const getEmotionBreakdown = (logs) => {
  const breakdown = {};

  for (const log of logs) {
    if (!breakdown[log.emotion]) breakdown[log.emotion] = 0;
    breakdown[log.emotion]++;
  }

  return breakdown;
};
