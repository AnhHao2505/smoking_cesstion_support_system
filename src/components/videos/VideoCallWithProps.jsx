import React, { useState, useEffect, useRef } from 'react';
import { Button, Space, Card, message, Spin, Typography } from 'antd';
import {
  AudioOutlined,
  AudioMutedOutlined,
  VideoCameraOutlined,
  VideoCameraAddOutlined,
  PhoneOutlined,
  SwapOutlined
} from '@ant-design/icons';
import { useAgora } from './AgoraContext';

const { Title, Text } = Typography;

const VideoCallWithProps = ({
  channelName,
  userId,
  appointmentId,
  onJoinSuccess,
  onJoinError,
  onLeave
}) => {
  const {
    joinChannel,
    leaveChannel,
    toggleMicrophone,
    toggleCamera,
    switchCamera,
    localVideoTrack,
    localAudioTrack,
    remoteUsers,
    joined,
    loading,
    error,
    isAudioEnabled,
    isVideoEnabled,
    currentToken,
    currentChannel,
    appId,
    connectionState
  } = useAgora();

  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [callStartTime, setCallStartTime] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRefs = useRef({});

  // Timer for call duration
  useEffect(() => {
    let interval;
    if (joined && callStartTime) {
      interval = setInterval(() => {
        setCallDuration(Math.floor((Date.now() - callStartTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [joined, callStartTime]);

  // Auto join when component mounts
  useEffect(() => {
    const autoJoin = async () => {
      try {
        console.log('Auto joining channel:', { channelName, userId, appointmentId });
        const result = await joinChannel(channelName, userId, appointmentId);
        setCallStartTime(Date.now());
        onJoinSuccess?.(result);
        message.success('Successfully joined video call');
      } catch (error) {
        console.error('Auto join failed:', error);
        onJoinError?.(error);
        message.error(`Failed to join call: ${error.message}`);
      }
    };

    if (channelName && userId && appointmentId && !joined) {
      autoJoin();
    }

    // Cleanup on unmount
    return () => {
      if (joined) {
        handleLeave();
      }
    };
  }, [channelName, userId, appointmentId]);

  // Play local video
  useEffect(() => {
    if (localVideoTrack && localVideoRef.current) {
      localVideoTrack.play(localVideoRef.current);
    }
  }, [localVideoTrack]);

  // Play remote videos
  useEffect(() => {
    remoteUsers.forEach(user => {
      if (user.videoTrack && remoteVideoRefs.current[user.uid]) {
        user.videoTrack.play(remoteVideoRefs.current[user.uid]);
      }
      if (user.audioTrack) {
        user.audioTrack.play();
      }
    });
  }, [remoteUsers]);

  const handleToggleAudio = async () => {
    try {
      const enabled = await toggleMicrophone();
      setIsAudioOn(enabled);
      message.info(enabled ? 'Microphone on' : 'Microphone off');
    } catch (error) {
      message.error('Failed to toggle microphone');
    }
  };

  const handleToggleVideo = async () => {
    try {
      const enabled = await toggleCamera();
      setIsVideoOn(enabled);
      message.info(enabled ? 'Camera on' : 'Camera off');
    } catch (error) {
      message.error('Failed to toggle camera');
    }
  };

  const handleSwitchCamera = async () => {
    try {
      await switchCamera();
      message.info('Camera switched');
    } catch (error) {
      message.error('Failed to switch camera');
    }
  };

  const handleLeave = async () => {
    try {
      await leaveChannel();
      onLeave?.();
    } catch (error) {
      console.error('Failed to leave channel:', error);
      message.error('Failed to leave call');
    }
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div style={{ 
        height: '400px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#000'
      }}>
        <div style={{ textAlign: 'center', color: '#fff' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px' }}>Connecting to video call...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        height: '400px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f5f5f5'
      }}>
        <Card>
          <div style={{ textAlign: 'center' }}>
            <Title level={4} type="danger">Connection Failed</Title>
            <Text>{error}</Text>
            <div style={{ marginTop: '16px' }}>
              <Button type="primary" onClick={() => window.location.reload()}>
                Reload Page
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ 
      height: '80vh', 
      background: '#000', 
      position: 'relative',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header with call info */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        background: 'rgba(0,0,0,0.5)',
        color: '#fff',
        padding: '12px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <Text style={{ color: '#fff' }}>
            Channel: {currentChannel || channelName}
          </Text>
          <br />
          <Text style={{ color: '#fff', fontSize: '10px' }}>
            App ID: {appId ? `${appId.substring(0, 8)}...` : 'Loading...'}
          </Text>
          {joined && (
            <div>
              <Text style={{ color: '#fff', fontSize: '12px' }}>
                Duration: {formatDuration(callDuration)}
              </Text>
            </div>
          )}
        </div>
        <div>
          <Text style={{ color: '#fff', fontSize: '12px' }}>
            Participants: {remoteUsers.length + 1}
          </Text>
          <br />
          <Text style={{ color: '#fff', fontSize: '10px' }}>
            Status: {connectionState || 'Unknown'}
          </Text>
          {currentToken && (
            <div>
              <Text style={{ color: '#fff', fontSize: '10px' }}>
                Token: Active
              </Text>
            </div>
          )}
        </div>
      </div>

      {/* Video Container */}
      <div style={{ flex: 1, position: 'relative' }}>
        {/* Remote Videos */}
        {remoteUsers.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: remoteUsers.length === 1 ? '1fr' : 'repeat(2, 1fr)',
            gap: '8px',
            height: '100%',
            padding: '50px 8px 80px 8px'
          }}>
            {remoteUsers.map(user => (
              <div
                key={user.uid}
                style={{
                  background: '#333',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                <div
                  ref={el => remoteVideoRefs.current[user.uid] = el}
                  style={{ width: '100%', height: '100%' }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: '8px',
                  left: '8px',
                  background: 'rgba(0,0,0,0.7)',
                  color: '#fff',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}>
                  User {user.uid}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            padding: '50px 0 80px 0'
          }}>
            <div style={{ textAlign: 'center' }}>
              <VideoCameraOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
              <div>Waiting for others to join...</div>
            </div>
          </div>
        )}

        {/* Local Video (Picture in Picture) */}
        <div style={{
          position: 'absolute',
          top: '60px',
          right: '16px',
          width: '200px',
          height: '150px',
          background: '#333',
          borderRadius: '8px',
          overflow: 'hidden',
          border: '2px solid #1890ff'
        }}>
          <div
            ref={localVideoRef}
            style={{ width: '100%', height: '100%' }}
          />
          <div style={{
            position: 'absolute',
            bottom: '4px',
            left: '4px',
            background: 'rgba(0,0,0,0.7)',
            color: '#fff',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '10px'
          }}>
            You
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(0,0,0,0.8)',
        padding: '16px',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <Space size="large">
          <Button
            type={isAudioOn ? "primary" : "default"}
            danger={!isAudioOn}
            shape="circle"
            size="large"
            icon={isAudioOn ? <AudioOutlined /> : <AudioMutedOutlined />}
            onClick={handleToggleAudio}
            title={isAudioOn ? "Mute microphone" : "Unmute microphone"}
          />
          
          <Button
            type={isVideoOn ? "primary" : "default"}
            danger={!isVideoOn}
            shape="circle"
            size="large"
            icon={isVideoOn ? <VideoCameraOutlined /> : <VideoCameraAddOutlined />}
            onClick={handleToggleVideo}
            title={isVideoOn ? "Turn off camera" : "Turn on camera"}
          />
          
          <Button
            type="default"
            shape="circle"
            size="large"
            icon={<SwapOutlined />}
            onClick={handleSwitchCamera}
            title="Switch camera"
            disabled={!isVideoOn}
          />
          
          <Button
            type="primary"
            danger
            shape="circle"
            size="large"
            icon={<PhoneOutlined />}
            onClick={handleLeave}
            title="End call"
            style={{ 
              background: '#ff4d4f',
              borderColor: '#ff4d4f'
            }}
          />
        </Space>
      </div>
    </div>
  );
};

export default VideoCallWithProps;