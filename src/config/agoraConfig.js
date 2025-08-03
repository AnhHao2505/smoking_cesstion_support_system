export const AGORA_CONFIG = {
  appId: null, // Sẽ được lấy động từ backend AgoraController
  token: null,
  channel: "",
};

// Backend API endpoints
export const AGORA_API = {
  GET_VIDEO_TOKEN: (appointmentId, channelName, userId) =>
    `/get-video-token?appointmentId=${appointmentId}&channelName=${channelName}&userId=${userId}`, // Endpoint từ AgoraController với đầy đủ parameters
};

export const generateChannelName = (appointmentId) => {
  return `appointment_${appointmentId}`;
};

export const generateUserUID = (userId) => {
  return (
    userId || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );
};

// Optional: Add more Agora-related configurations
export const AGORA_SETTINGS = {
  // Video settings
  video: {
    width: 1280,
    height: 720,
    frameRate: 30,
    bitrateMin: 400,
    bitrateMax: 1000,
  },

  // Audio settings
  audio: {
    sampleRate: 48000,
    bitrate: 128,
    channels: 2,
  },

  // Call settings
  call: {
    maxDuration: 3600, // 1 hour in seconds
    reconnectAttempts: 3,
    heartbeatInterval: 30000, // 30 seconds
  },
};
