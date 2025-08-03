import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import agoraService from '../../services/agoraService';

const AgoraContext = createContext();

export const useAgora = () => {
  const context = useContext(AgoraContext);
  if (!context) {
    throw new Error('useAgora must be used within an AgoraProvider');
  }
  return context;
};

export const AgoraProvider = ({ children }) => {
  const [client, setClient] = useState(null);
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentToken, setCurrentToken] = useState(null);
  const [currentChannel, setCurrentChannel] = useState(null);
  const [appId, setAppId] = useState(null);

  // Refs for token renewal
  const tokenRenewalTimer = useRef(null);
  const channelRef = useRef(null);
  const userIdRef = useRef(null);
  const appointmentIdRef = useRef(null);

  useEffect(() => {
    // Khởi tạo Agora client
    const agoraClient = AgoraRTC.createClient({ 
      mode: 'rtc', 
      codec: 'vp8' 
    });

    // Event handlers
    agoraClient.on('user-published', async (user, mediaType) => {
      try {
        await agoraClient.subscribe(user, mediaType);
        console.log('Subscribed to user:', user.uid, mediaType);

        setRemoteUsers(prevUsers => {
          const existingUser = prevUsers.find(u => u.uid === user.uid);
          if (existingUser) {
            return prevUsers.map(u => 
              u.uid === user.uid 
                ? { ...u, [mediaType + 'Track']: user[mediaType + 'Track'] }
                : u
            );
          } else {
            return [...prevUsers, {
              uid: user.uid,
              [mediaType + 'Track']: user[mediaType + 'Track']
            }];
          }
        });
      } catch (error) {
        console.error('Failed to subscribe to user:', error);
      }
    });

    agoraClient.on('user-unpublished', (user, mediaType) => {
      console.log('User unpublished:', user.uid, mediaType);
      setRemoteUsers(prevUsers => 
        prevUsers.map(u => 
          u.uid === user.uid 
            ? { ...u, [mediaType + 'Track']: null }
            : u
        )
      );
    });

    agoraClient.on('user-left', (user) => {
      console.log('User left:', user.uid);
      setRemoteUsers(prevUsers => 
        prevUsers.filter(u => u.uid !== user.uid)
      );
    });

    agoraClient.on('connection-state-change', (curState, revState) => {
      console.log('Connection state changed:', curState, revState);
    });

    // Token privilege will expire event
    agoraClient.on('token-privilege-will-expire', async () => {
      console.log('Token will expire, renewing...');
      await renewToken();
    });

    // Token privilege expired event
    agoraClient.on('token-privilege-did-expire', async () => {
      console.log('Token expired, renewing...');
      await renewToken();
    });

    setClient(agoraClient);

    return () => {
      if (tokenRenewalTimer.current) {
        clearTimeout(tokenRenewalTimer.current);
      }
      agoraClient.removeAllListeners();
    };
  }, []);

  // Renew token function
  const renewToken = async () => {
    if (!channelRef.current || !userIdRef.current || !appointmentIdRef.current) {
      console.error('Missing channel info for token renewal');
      return;
    }

    try {
      console.log('Renewing token...');
      const tokenResponse = await agoraService.refreshToken(
        channelRef.current,
        userIdRef.current,
        appointmentIdRef.current
      );

      if (tokenResponse.success && client) {
        await client.renewToken(tokenResponse.data.token);
        setCurrentToken(tokenResponse.data.token);
        console.log('Token renewed successfully');
        
        // Schedule next renewal (renew 1 minute before expiry)
        scheduleTokenRenewal();
      } else {
        console.error('Failed to renew token:', tokenResponse.error);
        setError('Failed to renew authentication token');
      }
    } catch (error) {
      console.error('Error renewing token:', error);
      setError('Token renewal failed');
    }
  };

  // Schedule token renewal (tokens usually expire in 24 hours, renew after 23 hours)
  const scheduleTokenRenewal = () => {
    if (tokenRenewalTimer.current) {
      clearTimeout(tokenRenewalTimer.current);
    }
    
    // Renew token after 23 hours (23 * 60 * 60 * 1000 ms)
    tokenRenewalTimer.current = setTimeout(() => {
      renewToken();
    }, 23 * 60 * 60 * 1000);
  };

  // Join channel với token từ backend
  const joinChannel = async (channelName, userId = null, appointmentId = null) => {
    if (!client) {
      throw new Error('Agora client not initialized');
    }

    setLoading(true);
    setError(null);

    try {
      // Lấy token từ backend
      console.log('Getting token from backend...', { channelName, userId, appointmentId });
      const tokenResponse = await agoraService.getToken(channelName, userId, appointmentId);
      
      if (!tokenResponse.success) {
        throw new Error(tokenResponse.error || 'Failed to get token from server');
      }

      const { app_id, token, uid, channelName: responseChannelName } = tokenResponse.data;
      
      // Lưu thông tin để dùng cho token renewal
      channelRef.current = responseChannelName || channelName;
      userIdRef.current = userId;
      appointmentIdRef.current = appointmentId;
      setCurrentToken(token);
      setCurrentChannel(responseChannelName || channelName);
      setAppId(app_id);

      console.log('Token received:', { app_id, uid, channelName: responseChannelName });

      // Create local tracks
      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks({
        // Audio track configuration
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        // Video track configuration
        video: {
          width: 640,
          height: 480,
          frameRate: 30,
          bitrateMin: 400,
          bitrateMax: 1000
        }
      });

      setLocalAudioTrack(audioTrack);
      setLocalVideoTrack(videoTrack);

      // Join channel với token từ backend
      const joinedUid = await client.join(app_id, responseChannelName || channelName, token, uid || userId);
      console.log('Joined channel successfully:', joinedUid);

      // Publish local tracks
      await client.publish([audioTrack, videoTrack]);
      console.log('Published local tracks');

      setJoined(true);
      
      // Schedule token renewal
      scheduleTokenRenewal();

      return { 
        uid: joinedUid, 
        channelName: responseChannelName || channelName,
        token,
        appId: app_id
      };

    } catch (error) {
      console.error('Failed to join channel:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Leave channel
  const leaveChannel = async () => {
    if (!client) return;

    setLoading(true);

    try {
      // Clear token renewal timer
      if (tokenRenewalTimer.current) {
        clearTimeout(tokenRenewalTimer.current);
        tokenRenewalTimer.current = null;
      }

      // Unpublish local tracks
      if (localAudioTrack || localVideoTrack) {
        await client.unpublish();
      }

      // Close local tracks
      if (localAudioTrack) {
        localAudioTrack.close();
        setLocalAudioTrack(null);
      }
      if (localVideoTrack) {
        localVideoTrack.close();
        setLocalVideoTrack(null);
      }

      // Leave channel
      await client.leave();
      
      // Clear state
      setRemoteUsers([]);
      setJoined(false);
      setCurrentToken(null);
      setCurrentChannel(null);
      setAppId(null);
      
      // Clear refs
      channelRef.current = null;
      userIdRef.current = null;
      appointmentIdRef.current = null;
      
      console.log('Left channel successfully');

    } catch (error) {
      console.error('Failed to leave channel:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Toggle microphone
  const toggleMicrophone = async () => {
    if (localAudioTrack) {
      await localAudioTrack.setEnabled(!localAudioTrack.enabled);
      return localAudioTrack.enabled;
    }
    return false;
  };

  // Toggle camera
  const toggleCamera = async () => {
    if (localVideoTrack) {
      await localVideoTrack.setEnabled(!localVideoTrack.enabled);
      return localVideoTrack.enabled;
    }
    return false;
  };

  // Switch camera (front/back for mobile)
  const switchCamera = async () => {
    if (localVideoTrack) {
      try {
        await localVideoTrack.switchDevice();
        return true;
      } catch (error) {
        console.error('Failed to switch camera:', error);
        return false;
      }
    }
    return false;
  };

  // Get available devices
  const getDevices = async () => {
    try {
      const devices = await AgoraRTC.getDevices();
      return {
        microphones: devices.filter(device => device.kind === 'audioinput'),
        cameras: devices.filter(device => device.kind === 'videoinput'),
        speakers: devices.filter(device => device.kind === 'audiooutput')
      };
    } catch (error) {
      console.error('Failed to get devices:', error);
      return { microphones: [], cameras: [], speakers: [] };
    }
  };

  // Switch microphone device
  const switchMicrophone = async (deviceId) => {
    if (localAudioTrack) {
      try {
        await localAudioTrack.switchDevice(deviceId);
        return true;
      } catch (error) {
        console.error('Failed to switch microphone:', error);
        return false;
      }
    }
    return false;
  };

  // Switch camera device
  const switchCameraDevice = async (deviceId) => {
    if (localVideoTrack) {
      try {
        await localVideoTrack.switchDevice(deviceId);
        return true;
      } catch (error) {
        console.error('Failed to switch camera device:', error);
        return false;
      }
    }
    return false;
  };

  // Get channel info from backend
  const getChannelInfo = async (channelName) => {
    try {
      const response = await agoraService.getChannelInfo(channelName);
      return response;
    } catch (error) {
      console.error('Failed to get channel info:', error);
      return { success: false, error: error.message };
    }
  };

  // Check connection status
  const getConnectionState = () => {
    if (!client) return 'DISCONNECTED';
    return client.connectionState;
  };

  // Get network quality
  const getNetworkQuality = () => {
    if (!client) return null;
    // This would need to be implemented with Agora's network quality API
    return null;
  };

  const contextValue = {
    // State
    client,
    localVideoTrack,
    localAudioTrack,
    remoteUsers,
    joined,
    loading,
    error,
    currentToken,
    currentChannel,
    appId,

    // Methods
    joinChannel,
    leaveChannel,
    toggleMicrophone,
    toggleCamera,
    switchCamera,
    getDevices,
    switchMicrophone,
    switchCameraDevice,
    getChannelInfo,
    renewToken,

    // Utility methods
    isAudioEnabled: localAudioTrack?.enabled || false,
    isVideoEnabled: localVideoTrack?.enabled || false,
    remoteUserCount: remoteUsers.length,
    connectionState: getConnectionState(),
    networkQuality: getNetworkQuality(),

    // Additional info
    tokenExpiry: null, // Could be calculated from token if needed
    channelInfo: currentChannel ? { name: currentChannel, appId } : null
  };

  return (
    <AgoraContext.Provider value={contextValue}>
      {children}
    </AgoraContext.Provider>
  );
};