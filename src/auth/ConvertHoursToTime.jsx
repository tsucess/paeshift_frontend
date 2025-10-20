import React from 'react'

const ConvertHoursToTime = (decimalHours) => {
  const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
  if (minutes > 0) { 
    return `${hours} hr${hours !== 1 ? 's' : ''} ${minutes} min${minutes !== 1 ? 's' : ''}`;
  }
  return `${hours} hr${hours !== 1 ? 's' : ''}`;
}

export default ConvertHoursToTime





