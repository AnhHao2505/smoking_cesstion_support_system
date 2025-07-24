import React, { useState, useEffect, useRef } from 'react';
import {
  Layout,
  Typography,
  List,
  Input,
  Button,
  Avatar,
  Space,
  Card,
  Badge,
  message,
  Spin,
  Tag
} from 'antd';
import {
  MessageOutlined,
  SendOutlined,
  TeamOutlined,
  LikeOutlined,
  MedicineBoxOutlined,
  StarOutlined,
  SmileOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { getChatRoomMessages } from '../../services/chatService';
import webSocketService from '../../services/websocketService';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/ChatPage.css';

const { Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

// Community Room definitions
const COMMUNITY_ROOMS = [
  { id: 3, name: 'Diễn đàn chia sẻ kinh nghiệm', type: 'COMMUNITY' },
  { id: 25, name: 'Diễn đàn hỗ trợ dược phẩm', type: 'COMMUNITY' },
  { id: 26, name: 'Góc giao lưu & kết nối', type: 'COMMUNITY' }
];
const COMMUNITY_ROOM_IDS = COMMUNITY_ROOMS.map(room => room.id);

const CommunityChat = () => {
  const { currentUser } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [communityRoomId, setCommunityRoomId] = useState(COMMUNITY_ROOM_IDS[0]);
  const [communityMessages, setCommunityMessages] = useState([]);
  const [loadingCommunityMessages, setLoadingCommunityMessages] = useState(false);
  const [sendingCommunityMessage, setSendingCommunityMessage] = useState(false);
  const [communityRooms, setCommunityRooms] = useState([]);
  const communityMessagesEndRef = useRef(null);

  // Format message time
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  // Scroll to bottom of messages
  useEffect(() => {
    communityMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [communityMessages]);

  useEffect(() => {
    fetchData();
    initializeWebSocket();
    return () => {
      webSocketService.disconnect();
      COMMUNITY_ROOM_IDS.forEach(id => webSocketService.unsubscribeFromCommunityChat(id));
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Use the predefined COMMUNITY_ROOMS data
      const communityRoomsData = COMMUNITY_ROOMS.map(room => ({
        roomId: room.id,
        roomName: room.name,
        type: room.type
      }));
      setCommunityRooms(communityRoomsData);
      
      // Load messages for the default community room
      await loadMessages(COMMUNITY_ROOM_IDS[0]);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('Không thể tải dữ liệu chat');
    } finally {
      setLoading(false);
    }
  };

  const initializeWebSocket = async () => {
    try {
      setConnectionStatus('connecting');
      
      // Add connection status listener
      webSocketService.onConnectionChange((connected) => {
        setWsConnected(connected);
        setConnectionStatus(connected ? 'connected' : 'disconnected');
      });

      // Connect to WebSocket
      await webSocketService.connect();
      
      // Subscribe to community room
      if (communityRoomId) {
        subscribeToCommunityRoom(communityRoomId);
      }
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      setConnectionStatus('failed');
      message.error('Không thể kết nối chat real-time. Vui lòng tải lại trang.');
    }
  };

  const subscribeToCommunityRoom = (roomId) => {
    if (wsConnected && roomId) {
      try {
        webSocketService.subscribeToCommunityChat(roomId, (message) => {
          const newMsg = {
            id: message.id || Date.now(),
            content: message.content,
            sender_id: message.sender_id,
            sender_name: message.sender_name,
            timestamp: message.timestamp || new Date().toISOString(),
            type: message.type || 'text'
          };
          setCommunityMessages(prev => {
            const exists = prev.some(msg => msg.id === newMsg.id);
            if (exists) return prev;
            return [...prev, newMsg];
          });
        });
      } catch (error) {
        console.error('Error subscribing to community room:', error);
      }
    }
  };

  const reconnectWebSocket = async () => {
    try {
      setConnectionStatus('connecting');
      await webSocketService.reconnect();
      
      if (communityRoomId) {
        subscribeToCommunityRoom(communityRoomId);
      }
    } catch (error) {
      console.error('WebSocket reconnection failed:', error);
      setConnectionStatus('failed');
      message.error('Không thể kết nối lại. Vui lòng tải lại trang.');
    }
  };

  const handleCommunityRoomSelect = async (roomId) => {
    setCommunityRoomId(roomId);
    setCommunityMessages([]);
    await loadMessages(roomId);
    subscribeToCommunityRoom(roomId);
  };

  const loadMessages = async (roomId) => {
    try {
      setLoadingCommunityMessages(true);
      // Using the standard chat room messages endpoint for all room types
      const messagesData = await getChatRoomMessages(roomId);
      setCommunityMessages(messagesData.map(msg => ({
        ...msg,
        sender_name: msg.sender_id === currentUser.userId ? 'You' : msg.sender_name
      })));
    } catch (error) {
      console.error('Error loading messages:', error);
      message.error('Không thể tải tin nhắn');
    } finally {
      setLoadingCommunityMessages(false);
    }
  };

  const handleSendCommunityMessage = async () => {
    if (!newMessage.trim()) return;
    setSendingCommunityMessage(true);
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const messageData = {
      content: newMessage.trim(),
      type: 'text',
      sender_id: currentUser.userId,
      sender_name: 'You',
      timestamp: new Date().toISOString(),
      tempId: tempId
    };
    const tempMessage = {
      id: tempId,
      ...messageData,
      status: 'sending'
    };
    setCommunityMessages(prev => [...prev, tempMessage]);
    setNewMessage('');
    if (wsConnected) {
      try {
        webSocketService.sendCommunityMessage(communityRoomId, messageData.content);
        setCommunityMessages(prev => prev.map(msg =>
          msg.tempId === tempId
            ? { ...msg, status: 'sent' }
            : msg
        ));
      } catch (error) {
        setCommunityMessages(prev => prev.map(msg =>
          msg.tempId === tempId
            ? { ...msg, status: 'failed' }
            : msg
        ));
        message.error('Không thể gửi tin nhắn');
      }
    } else {
      setCommunityMessages(prev => prev.map(msg =>
        msg.tempId === tempId
          ? { ...msg, status: 'failed' }
          : msg
      ));
      message.warning('WebSocket chưa kết nối. Vui lòng đợi kết nối.');
    }
    setSendingCommunityMessage(false);
  };

  const handleRetryMessage = async (failedMessage) => {
    if (!failedMessage || !failedMessage.content) {
      message.error('Không thể gửi lại tin nhắn trống');
      return;
    }

    // Update message status to sending
    setCommunityMessages(prev => prev.map(msg => 
      msg.id === failedMessage.id || msg.tempId === failedMessage.tempId
        ? { ...msg, status: 'sending' }
        : msg
    ));

    try {
      if (wsConnected) {
        await webSocketService.sendCommunityMessage(communityRoomId, failedMessage.content);
        
        // Update message status to "sent" when confirmed
        setCommunityMessages(prev => prev.map(msg => 
          (msg.id === failedMessage.id || msg.tempId === failedMessage.tempId)
            ? { ...msg, status: 'sent' }
            : msg
        ));

        message.success('Tin nhắn đã được gửi lại thành công');
      } else {
        // Update status to failed if not connected
        setCommunityMessages(prev => prev.map(msg => 
          (msg.id === failedMessage.id || msg.tempId === failedMessage.tempId)
            ? { ...msg, status: 'failed' }
            : msg
        ));
        message.warning('WebSocket chưa kết nối. Vui lòng đợi kết nối.');
      }
    } catch (error) {
      console.error('Failed to retry message:', error);
      
      // Update message status to "failed"
      setCommunityMessages(prev => prev.map(msg =>
        (msg.id === failedMessage.id || msg.tempId === failedMessage.tempId)
          ? { ...msg, status: 'failed' }
          : msg
      ));
      message.error('Không thể gửi lại tin nhắn');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>Đang tải phòng chat cộng đồng...</div>
      </div>
    );
  }

  return (
    <Layout className="chat-page">
      <Content style={{ display: 'flex', flexDirection: 'column', padding: '20px', height: 'calc(100vh - 120px)' }}>
        <div style={{ marginBottom: '15px' }}>
          <Title level={3} style={{ marginBottom: '10px' }}>Phòng Chat Cộng Đồng</Title>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center', 
            flexWrap: 'wrap',
            gap: '10px', 
            marginBottom: '10px' 
          }}>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {communityRooms.map(room => {
                // Define icons based on room ID
                let icon = <TeamOutlined />;
                let color = '#1890ff';
                let description = 'Phòng trò chuyện cộng đồng';
                
                if (room.roomId === 3) {
                  icon = <LikeOutlined />;
                  color = '#52c41a';
                  description = 'Chia sẻ kinh nghiệm cai thuốc lá cùng các thành viên khác';
                } else if (room.roomId === 25) {
                  icon = <MedicineBoxOutlined />;
                  color = '#f5222d';
                  description = 'Thảo luận về các sản phẩm hỗ trợ và dược phẩm cai thuốc lá';
                } else if (room.roomId === 26) {
                  icon = <StarOutlined />;
                  color = '#fa8c16';
                  description = 'Kết nối và giao lưu với các thành viên trong cộng đồng';
                }
                
                return (
                  <div key={room.roomId} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                    <Button
                      type={communityRoomId === room.roomId ? 'primary' : 'default'}
                      onClick={() => handleCommunityRoomSelect(room.roomId)}
                      icon={icon}
                      style={{
                        borderColor: communityRoomId === room.roomId ? color : undefined,
                        backgroundColor: communityRoomId === room.roomId ? color : undefined
                      }}
                    >
                      {room.roomName}
                    </Button>
                    <div style={{ flexGrow: 1 }}>
                      <div style={{ 
                        fontWeight: '600', 
                        fontSize: '14px',
                        marginBottom: '2px',
                        color: communityRoomId === room.roomId ? color : '#000'
                      }}>
                        {room.roomName}
                      </div>
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#666',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {description}
                      </div>
                      {communityRoomId === room.roomId && 
                        <div style={{ 
                          marginTop: '4px', 
                          fontSize: '11px', 
                          color: color,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <span>•</span> Đang kết nối
                        </div>
                      }
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <Card 
          style={{ 
            flex: 1, 
            marginBottom: '10px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            height: 'calc(100% - 100px)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}
          bodyStyle={{ 
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden'
          }}
        >
          <div style={{
            background: '#fff',
            padding: '12px 16px',
            borderBottom: '1px solid #f0f0f0',
            position: 'sticky',
            top: 0,
            zIndex: 5
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Space>
                {(() => {
                  const roomData = COMMUNITY_ROOMS.find(room => room.id === communityRoomId) || {};
                  
                  // Function to return appropriate icon based on iconType
                  const getRoomIcon = (iconType) => {
                    switch(iconType) {
                      case 'like': return <LikeOutlined />;
                      case 'medicine-box': return <MedicineBoxOutlined />;
                      case 'star': return <StarOutlined />;
                      default: return <TeamOutlined />;
                    }
                  };
                  
                  return (
                    <Avatar 
                      icon={getRoomIcon(roomData.iconType)} 
                      size={40} 
                      style={{ 
                        backgroundColor: roomData.color || '#52c41a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }} 
                    />
                  );
                })()}
                <div>
                  <Title level={5} style={{ margin: 0, fontWeight: '600' }}>
                    {communityRooms.find(room => room.roomId === communityRoomId)?.roomName || 
                      COMMUNITY_ROOMS.find(room => room.id === communityRoomId)?.name || 
                      `Phòng cộng đồng ${communityRoomId}`}
                  </Title>
                  <Text type="secondary" style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span><UserOutlined /> {communityMessages.length} tin nhắn</span> • 
                    {wsConnected ? 
                      <Badge status="success" text="Đang kết nối" style={{ fontSize: '12px' }} /> : 
                      <Badge status="error" text="Mất kết nối" style={{ fontSize: '12px' }} />}
                  </Text>
                </div>
              </Space>
            </div>
          </div>

          <div className="chat-messages" style={{ 
            flex: 1, 
            padding: '12px 20px', 
            overflowY: 'auto',
            background: '#fafafa',
            maxHeight: 'calc(100% - 120px)',
            scrollBehavior: 'smooth'
          }}>
            {loadingCommunityMessages ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Spin />
                <div style={{ marginTop: '10px' }}>Đang tải tin nhắn...</div>
              </div>
            ) : communityMessages.length > 0 ? (
              <div className="messages-container" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {communityMessages.map((msg) => (
                  <div key={msg.id || msg.tempId} className="chat-message" style={{
                    display: 'flex',
                    justifyContent: msg.sender_id === currentUser.userId ? 'flex-end' : 'flex-start',
                    position: 'relative',
                    marginBottom: '4px',
                  }}>
                    <div 
                      style={{ 
                        display: 'flex',
                        flexDirection: 'column',
                        maxWidth: '75%',
                        width: 'auto',
                        alignItems: msg.sender_id === currentUser.userId ? 'flex-end' : 'flex-start',
                        position: 'relative'
                      }}
                    >
                      {msg.sender_id !== currentUser.userId && (
                        <div style={{ 
                          marginBottom: '2px', 
                          fontSize: '12px', 
                          color: '#666',
                          fontWeight: '500',
                          paddingLeft: '4px'
                        }}>
                          <UserOutlined style={{ marginRight: '4px', fontSize: '10px' }} />
                          {msg.sender_name}
                        </div>
                      )}
                      <Card
                        size="small"
                        style={{ 
                          background: msg.sender_id === currentUser.userId ? '#1890ff' : '#fff',
                          color: msg.sender_id === currentUser.userId ? '#fff' : '#000',
                          border: 'none',
                          borderRadius: msg.sender_id === currentUser.userId ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                          wordBreak: 'break-word'
                        }}
                        bodyStyle={{ padding: '8px 12px' }}
                      >
                        <div style={{ fontSize: '14px', lineHeight: '1.5' }}>{msg.content}</div>
                        <div style={{
                          fontSize: '11px',
                          opacity: 0.7,
                          marginTop: '4px',
                          textAlign: 'right',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <span style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '3px'
                          }}>
                            <ClockCircleOutlined style={{ fontSize: '10px' }} /> 
                            {formatMessageTime(msg.timestamp)}
                          </span>
                          {msg.sender_id === currentUser.userId && (
                            <span>
                              {msg.status === 'sending' && (
                                <Tag color="orange" size="small" style={{ 
                                  fontSize: '10px', 
                                  margin: 0, 
                                  padding: '0 4px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '2px' 
                                }}>
                                  <ClockCircleOutlined /> Đang gửi...
                                </Tag>
                              )}
                              {msg.status === 'sent' && (
                                <Tag color="green" size="small" style={{ 
                                  fontSize: '10px', 
                                  margin: 0, 
                                  padding: '0 4px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '2px' 
                                }}>
                                  <SmileOutlined /> Đã gửi
                                </Tag>
                              )}
                              {msg.status === 'failed' && (
                                <Tag
                                  color="red"
                                  size="small"
                                  style={{ 
                                    fontSize: '10px', 
                                    margin: 0, 
                                    padding: '0 4px', 
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '2px'
                                  }}
                                  onClick={() => handleRetryMessage(msg)}
                                >
                                  ✗ Thất bại (Gửi lại)
                                </Tag>
                              )}
                            </span>
                          )}
                        </div>
                      </Card>
                    </div>
                  </div>
                ))}
                <div ref={communityMessagesEndRef} style={{ padding: '1px' }} />
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                color: '#999'
              }}>
                {(() => {
                  const roomData = COMMUNITY_ROOMS.find(room => room.id === communityRoomId) || {};
                  
                  // Function to return appropriate icon based on iconType
                  const getRoomIcon = (iconType) => {
                    switch(iconType) {
                      case 'like': return <LikeOutlined />;
                      case 'medicine-box': return <MedicineBoxOutlined />;
                      case 'star': return <StarOutlined />;
                      default: return <MessageOutlined />;
                    }
                  };
                  
                  return (
                    <Avatar 
                      icon={getRoomIcon(roomData.iconType)}
                      size={64} 
                      style={{ 
                        backgroundColor: roomData.color || '#1890ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0.6,
                        marginBottom: '16px'
                      }} 
                    />
                  );
                })()}
                <div style={{ marginBottom: '8px', fontWeight: 500 }}>
                  Chưa có tin nhắn nào trong {communityRooms.find(room => room.roomId === communityRoomId)?.roomName || 
                  COMMUNITY_ROOMS.find(room => room.id === communityRoomId)?.name || 
                  `Phòng cộng đồng ${communityRoomId}`}
                </div>
                <div style={{ fontSize: '13px', maxWidth: '300px' }}>
                  Hãy là người đầu tiên gửi tin nhắn và bắt đầu cuộc trò chuyện!
                </div>
              </div>
            )}
          </div>

          <div style={{
            background: '#fff',
            padding: '12px 16px',
            borderTop: '1px solid #f0f0f0',
            position: 'sticky',
            bottom: 0,
            zIndex: 5
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              width: '100%',
              background: '#f9f9f9',
              borderRadius: '8px',
              padding: '4px 8px',
              border: '1px solid #e8e8e8'
            }}>
              <TextArea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Nhập tin nhắn..."
                autoSize={{ minRows: 1, maxRows: 3 }}
                onPressEnter={(e) => {
                  if (e.shiftKey) return;
                  e.preventDefault();
                  handleSendCommunityMessage();
                }}
                style={{ 
                  resize: 'none',
                  border: 'none',
                  boxShadow: 'none',
                  background: 'transparent',
                  flex: 1,
                  padding: '8px 4px'
                }}
              />
              <Button
                type="primary"
                shape="circle"
                icon={<SendOutlined />}
                loading={sendingCommunityMessage}
                onClick={handleSendCommunityMessage}
                disabled={!newMessage.trim() || !wsConnected}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              />
            </div>
            {!wsConnected && (
              <div style={{ fontSize: '12px', color: '#ff4d4f', marginTop: '4px', textAlign: 'center' }}>
                Kết nối không thành công. Tin nhắn có thể không được gửi.
              </div>
            )}
          </div>
        </Card>
      </Content>
    </Layout>
  );
};

export default CommunityChat;
