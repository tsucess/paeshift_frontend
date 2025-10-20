// utils/timeToSeconds.js
const timeToSeconds = (timeStr) => {
  try {
    const [hours, minutes, seconds] = timeStr.split(':').map(Number);
    
    if (
      isNaN(hours) || isNaN(minutes) || isNaN(seconds) ||
      hours < 0 || minutes < 0 || seconds < 0
    ) {
      throw new Error("Invalid time format");
    }

    return hours * 3600 + minutes * 60 + seconds;
  } catch (error) {
    console.error("Error converting time to seconds:", error.message);
    return null;
  }
};

export default timeToSeconds;
