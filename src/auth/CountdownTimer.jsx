import React, { useEffect, useState, useRef } from 'react';

// 🛠 Define this BEFORE using it in useState
const convertToSeconds = (timeStr) => {
  const [hrs, mins, secs] = timeStr.split(':').map(Number);
  return hrs * 3600 + mins * 60 + secs;
};

// Calculate remaining time based on shift start time and duration
const calculateRemainingTime = (shiftStartTime, durationSeconds) => {
  if (!shiftStartTime) return durationSeconds;

  const startTime = new Date(shiftStartTime).getTime();
  const now = new Date().getTime();
  const elapsedMs = now - startTime;
  const elapsedSeconds = Math.floor(elapsedMs / 1000);
  const remaining = Math.max(0, durationSeconds - elapsedSeconds);

  return remaining;
};

// Global timer state to synchronize all CountdownTimer instances
let globalTimerInterval = null;
let globalTimerSubscribers = new Map();
let lastUpdateTime = null;

const subscribeToGlobalTimer = (id, callback) => {
  globalTimerSubscribers.set(id, callback);

  // Start global timer if not already running
  if (!globalTimerInterval) {
    globalTimerInterval = setInterval(() => {
      lastUpdateTime = Date.now();
      globalTimerSubscribers.forEach(cb => cb());
    }, 1000);
  }

  return () => {
    globalTimerSubscribers.delete(id);
    // Stop global timer if no more subscribers
    if (globalTimerSubscribers.size === 0 && globalTimerInterval) {
      clearInterval(globalTimerInterval);
      globalTimerInterval = null;
    }
  };
};

const CountdownTimer = ({ initialTime = "00:05:00", shiftStartTime = null }) => {
  const durationSeconds = convertToSeconds(initialTime);
  const componentIdRef = useRef(Math.random().toString(36));

  // Initialize with calculated remaining time if shift start time is provided
  const [timeLeft, setTimeLeft] = useState(() => {
    if (shiftStartTime) {
      return calculateRemainingTime(shiftStartTime, durationSeconds);
    }
    return durationSeconds;
  });

  useEffect(() => {
    // If shift start time is provided, use global timer for synchronization
    if (shiftStartTime) {
      const unsubscribe = subscribeToGlobalTimer(componentIdRef.current, () => {
        const remaining = calculateRemainingTime(shiftStartTime, durationSeconds);
        setTimeLeft(remaining);
      });
      return unsubscribe;
    }

    // For simple countdown without shift start time
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer); // Cleanup
  }, [shiftStartTime, durationSeconds]);

  const formatTime = (totalSeconds) => {
    const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const secs = String(Math.floor(totalSeconds % 60)).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  return (
    <button className="cancel">
      {timeLeft > 0 ? formatTime(timeLeft) : "Time's up!"}
    </button>
  );
};

export default CountdownTimer;
