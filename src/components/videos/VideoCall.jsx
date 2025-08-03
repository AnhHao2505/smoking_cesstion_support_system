// src/components/VideoCall.jsx
import React, { useState, useCallback } from 'react';
import {
  LocalUser,
  RemoteUser,
  useJoin,
  useLocalCameraTrack,
  useLocalMicrophoneTrack,
  usePublish,
  useRemoteAudioTracks,
  useRemoteUsers,
} from 'agora-rtc-react';
import agoraService from '../../services/agoraService';

const VideoCall = () => {
  const [calling, setCalling] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Agora credentials từ API
  const [agoraCredentials, setAgoraCredentials] = useState({
    appId: null,
    token: null,
    channelName: agoraConfig.channelName,
    uid: null
  });

  // Agora hooks
  const { localCameraTrack } = useLocalCameraTrack(cameraOn);
  const { localMicrophoneTrack } = useLocalMicrophoneTrack(micOn);
  const { remoteUsers } = useRemoteUsers();
  const { audioTracks } = useRemoteAudioTracks(remoteUsers);

  // Join channel với credentials từ API
  useJoin({
    appid: agoraCredentials.appId,
    channel: agoraCredentials.channelName,
    token: agoraCredentials.token,
    uid: agoraCredentials.uid,
  }, calling && agoraCredentials.appId && agoraCredentials.token);

  // Publish local tracks
  usePublish([localMicrophoneTrack, localCameraTrack]);

  // Play remote audio tracks
  audioTracks.map((track) => track.play());

  // Lấy token từ API với parameters mới
  const fetchAgoraToken = useCallback(async (channelName, userId = 0, appointmentId = 0) => {
    setLoading(true);
    setError(null);

    try {
      const result = await agoraService.getToken(channelName, userId, appointmentId);
      
      if (result.success) {
        setAgoraCredentials({
          appId: result.data.app_id,
          token: result.data.token,
          channelName: result.data.channelName,
          uid: result.data.uid
        });
        return true;
      } else {
        setError(result.error);
        return false;
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleJoin = async () => {
    const userId = 0; 
    const appointmentId = 0; 
    const success = await fetchAgoraToken(agoraConfig.channelName, userId, appointmentId);
    
    if (success) {
      setCalling(true);
    }
  };

  const handleLeave = () => {
    setCalling(false);
    // Reset credentials khi leave
    setAgoraCredentials({
      appId: null,
      token: null,
      channelName: agoraConfig.channelName,
      uid: null
    });
    setError(null);
  };

  const toggleMic = () => {
    setMicOn(!micOn);
  };

  const toggleCamera = () => {
    setCameraOn(!cameraOn);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Agora Video Call Demo</h2>
      
      {/* Error Display */}
      {error && (
        <div style={{
          padding: '15px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Control Buttons */}
      <div style={{ marginBottom: '20px' }}>
        {!calling ? (
          <button 
            onClick={handleJoin}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: loading ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px'
            }}
          >
            {loading ? 'Connecting...' : 'Join Call'}
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={toggleMic}
              style={{
                padding: '10px 20px',
                backgroundColor: micOn ? '#28a745' : '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              {micOn ? 'Mute' : 'Unmute'}
            </button>
            
            <button 
              onClick={toggleCamera}
              style={{
                padding: '10px 20px',
                backgroundColor: cameraOn ? '#28a745' : '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              {cameraOn ? 'Stop Video' : 'Start Video'}
            </button>
            
            <button 
              onClick={handleLeave}
              style={{
                padding: '10px 20px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Leave Call
            </button>
          </div>
        )}
      </div>

      {/* Video Container */}
      {calling && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginTop: '20px'
        }}>
          {/* Local User Video */}
          <div style={{ 
            position: 'relative',
            backgroundColor: '#000',
            borderRadius: '10px',
            overflow: 'hidden',
            aspectRatio: '16/9'
          }}>
            <LocalUser
              audioTrack={localMicrophoneTrack}
              videoTrack={localCameraTrack}
              cameraOn={cameraOn}
              micOn={micOn}
              playAudio={micOn}
              playVideo={cameraOn}
              cover="https://via.placeholder.com/300x200?text=You"
            />
            <div style={{
              position: 'absolute',
              bottom: '10px',
              left: '10px',
              color: 'white',
              backgroundColor: 'rgba(0,0,0,0.5)',
              padding: '5px 10px',
              borderRadius: '5px',
              fontSize: '14px'
            }}>
              You
            </div>
          </div>

          {/* Remote Users Videos */}
          {remoteUsers.map((user) => (
            <div 
              key={user.uid}
              style={{ 
                position: 'relative',
                backgroundColor: '#000',
                borderRadius: '10px',
                overflow: 'hidden',
                aspectRatio: '16/9'
              }}
            >
              <RemoteUser
                user={user}
                cover="https://via.placeholder.com/300x200?text=Remote+User"
              />
              <div style={{
                position: 'absolute',
                bottom: '10px',
                left: '10px',
                color: 'white',
                backgroundColor: 'rgba(0,0,0,0.5)',
                padding: '5px 10px',
                borderRadius: '5px',
                fontSize: '14px'
              }}>
                User {user.uid}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Status Info */}
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '5px',
        fontSize: '14px'
      }}>
        <p><strong>Status:</strong> {calling ? 'In Call' : 'Not Connected'}</p>
        <p><strong>Channel:</strong> {agoraCredentials.channelName}</p>
        <p><strong>User ID:</strong> {agoraCredentials.uid || 'Not assigned'}</p>
        <p><strong>App ID:</strong> {agoraCredentials.appId ? `${agoraCredentials.appId.substring(0, 8)}...` : 'Not loaded'}</p>
        <p><strong>Token:</strong> {agoraCredentials.token ? 'Loaded' : 'Not loaded'}</p>
        <p><strong>Remote Users:</strong> {remoteUsers.length}</p>
        {calling && (
          <>
            <p><strong>Camera:</strong> {cameraOn ? 'ON' : 'OFF'}</p>
            <p><strong>Microphone:</strong> {micOn ? 'ON' : 'OFF'}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default VideoCall;