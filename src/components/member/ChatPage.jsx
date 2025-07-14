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
  Divider,
  message,
  Modal,
  Select,
  Spin,
  Empty,
  Tag,
  Rate
} from 'antd';
import {
  MessageOutlined,
  SendOutlined,
  UserOutlined,
  SearchOutlined,
  PlusOutlined,
  PhoneOutlined,
  VideoCameraOutlined,
  MoreOutlined,
  TeamOutlined,
  StarOutlined,
  CommentOutlined
} from '@ant-design/icons';
import { getAllCoaches, chooseCoach } from '../../services/coachManagementService';
import { 
  getAllPrivateChatRooms, 
  getChatRoomMessages, 
  deleteMessage,
  getWSChannelsDoc
} from '../../services/chatService';
import webSocketService from '../../services/websocketService';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/Dashboard.css';
import '../../styles/ChatPage.css';

const { Sider, Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const COMMUNITY_ROOM_IDS = [3, 25, 26];
const ChatPage = () => {
  const { currentUser } = useAuth();
  const [coaches, setCoaches] = useState([]);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedChatRoom, setSelectedChatRoom] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [coachSelectionModal, setCoachSelectionModal] = useState(false);
  const [selectingCoach, setSelectingCoach] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [activeTab, setActiveTab] = useState('private'); // 'private' or 'community'
  const [communityRoomId, setCommunityRoomId] = useState(COMMUNITY_ROOM_IDS[0]);
  const [communityMessages, setCommunityMessages] = useState([]);
  const [loadingCommunityMessages, setLoadingCommunityMessages] = useState(false);
  const [sendingCommunityMessage, setSendingCommunityMessage] = useState(false);
  const communityMessagesEndRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
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
  // Community chat logic
  const loadCommunityMessages = async (roomId) => {
    try {
      setLoadingCommunityMessages(true);
      const res = await fetch(`/chat/community/${roomId}/messages`, {
        headers: {
          'Authorization': `Bearer ${currentUser?.token}`
        }
      });
      const data = await res.json();
      setCommunityMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      setCommunityMessages([]);
    } finally {
      setLoadingCommunityMessages(false);
    }
  };

  const subscribeToCommunityRoom = (roomId) => {
    if (wsConnected && roomId) {
      try {
        webSocketService.subscribeToCommunityChat(roomId, (message) => {
          const newMsg = {
            id: message.id || Date.now(),
            content: message.content,
            senderId: message.senderId,
            senderName: message.senderName,
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
        // silent
      }
    }
  };

  useEffect(() => {
    if (activeTab === 'community') {
      loadCommunityMessages(communityRoomId);
      subscribeToCommunityRoom(communityRoomId);
    }
    // eslint-disable-next-line
  }, [activeTab, communityRoomId, wsConnected]);

  const handleCommunityRoomSelect = (roomId) => {
    setCommunityRoomId(roomId);
    setCommunityMessages([]);
  };

  const handleSendCommunityMessage = async () => {
    if (!newMessage.trim()) return;
    setSendingCommunityMessage(true);
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const messageData = {
      content: newMessage.trim(),
      type: 'text',
      senderId: currentUser.userId,
      senderName: 'You',
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
        webSocketService.sendCommunityMessage(communityRoomId, messageData);
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
      }
    } else {
      setCommunityMessages(prev => prev.map(msg =>
        msg.tempId === tempId
          ? { ...msg, status: 'failed' }
          : msg
      ));
    }
    setSendingCommunityMessage(false);
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
      
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      setConnectionStatus('failed');
      message.error('Không thể kết nối chat real-time. Vui lòng tải lại trang.');
    }
  };

  const reconnectWebSocket = async () => {
    try {
      setConnectionStatus('connecting');
      await webSocketService.connect();
      
      // Re-subscribe to current room if any
      if (selectedChatRoom?.roomId) {
        subscribeToRoom(selectedChatRoom.roomId);
      }
    } catch (error) {
      console.error('Reconnection failed:', error);
      setConnectionStatus('failed');
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch chat rooms first
      await fetchChatRooms();
      
      // Fetch coaches
      const coachesResponse = await getAllCoaches();
      const activeCoaches = coachesResponse.content;
      setCoaches(activeCoaches);

    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('Failed to load chat data');
    } finally {
      setLoading(false);
    }
  };

  const fetchChatRooms = async () => {
    try {
      const chatRoomsResponse = await getAllPrivateChatRooms();
      console.log('Chat rooms response:', chatRoomsResponse);
      
      // Handle different response formats
      let rooms = [];
      if (Array.isArray(chatRoomsResponse)) {
        rooms = chatRoomsResponse;
      } else if (chatRoomsResponse.data && Array.isArray(chatRoomsResponse.data)) {
        rooms = chatRoomsResponse.data;
      } else if (chatRoomsResponse.success && Array.isArray(chatRoomsResponse.data)) {
        rooms = chatRoomsResponse.data;
      }
      
      setChatRooms(rooms);
      console.log('Set chat rooms:', rooms);
      
    } catch (error) {
      console.log('No existing chat rooms found or error:', error);
      setChatRooms([]);
    }
  };

  const handleRoomSelect = async (room) => {
    try {
      // Unsubscribe from previous room if any
      if (selectedChatRoom?.roomId && selectedChatRoom.roomId !== room.roomId) {
        webSocketService.unsubscribeFromPrivateChat(selectedChatRoom.roomId);
      }
      
      setSelectedChatRoom(room);
      setSelectedCoach(null); // Clear selected coach when selecting room
      
      // Load messages for this room
      await loadMessages(room.roomId);
      
      // Subscribe to this room for real-time messages
      subscribeToRoom(room.roomId);
      
    } catch (error) {
      console.error('Error selecting room:', error);
      message.error('Không thể chọn phòng chat');
    }
  };

  const handleCoachSelect = (coach) => {
    // Clear selected room when selecting coach
    if (selectedChatRoom?.roomId) {
      webSocketService.unsubscribeFromPrivateChat(selectedChatRoom.roomId);
      setSelectedChatRoom(null);
    }
    
    setSelectedCoach(coach);
    setMessages([]); // Clear messages when switching to new coach
    
    // Look for existing room with this coach
    const existingRoom = chatRooms.find(room => 
      room.roomName && room.roomName.toLowerCase().includes(coach.name.toLowerCase())
    );
    
    if (existingRoom) {
      handleRoomSelect(existingRoom);
    }
  };

  const subscribeToRoom = (roomId) => {
    if (wsConnected && roomId) {
      try {
        // Subscribe to private chat for this room
        webSocketService.subscribeToPrivateChat(roomId, (message) => {
          console.log('Received real-time message:', message);
          
          // Add received message to local state
          const newMsg = {
            id: message.id || Date.now(),
            content: message.content,
            senderId: message.senderId,
            senderName: message.senderName,
            receiverId: message.receiverId,
            receiverName: message.receiverName,
            timestamp: message.timestamp || new Date().toISOString(),
            type: message.type || 'text'
          };
          
          setMessages(prev => {
            // Avoid duplicate messages
            const exists = prev.some(msg => msg.id === newMsg.id);
            if (exists) return prev;
            return [...prev, newMsg];
          });
        });
        
        console.log('Subscribed to room:', roomId);
      } catch (error) {
        console.error('Failed to subscribe to room:', error);
      }
    }
  };

  const loadMessages = async (roomId) => {
    try {
      setLoadingMessages(true);
      console.log('Loading messages for room:', roomId);
      
      const response = await getChatRoomMessages(roomId);
      console.log('Messages response:', response);
      
      // Handle different response formats
      let messagesData = [];
      if (Array.isArray(response)) {
        messagesData = response;
      } else if (response.data && Array.isArray(response.data)) {
        messagesData = response.data;
      } else if (response.success && Array.isArray(response.data)) {
        messagesData = response.data;
      }
      
      setMessages(messagesData);
      console.log('Loaded messages:', messagesData);
      
    } catch (error) {
      console.error('Error loading messages:', error);
      message.error('Không thể tải tin nhắn');
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      return;
    }

    if (!selectedChatRoom?.roomId) {
      message.warning('Vui lòng chọn một phòng chat trước');
      return;
    }

    setSendingMessage(true);
    try {
      // Prepare message data
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const messageData = {
        content: newMessage.trim(),
        type: 'text',
        senderId: currentUser.userId,
        senderName: currentUser.fullName || currentUser.name || 'You',
        receiverId: selectedCoach?.coachId || null,
        receiverName: selectedCoach?.name || '',
        timestamp: new Date().toISOString(),
        tempId: tempId
      };

      // Add message to local state immediately with "sending" status
      const tempMessage = {
        id: tempId,
        ...messageData,
        status: 'sending' // sending, sent, failed
      };
      
      setMessages(prev => [...prev, tempMessage]);
      setNewMessage('');

      // Send via WebSocket if connected
      if (wsConnected) {
        try {
          // Use the Promise-based sendPrivateMessage
          const confirmedMessage = await webSocketService.sendPrivateMessage(selectedChatRoom.roomId, messageData);
          
          // Update message status to "sent" when confirmed
          setMessages(prev => prev.map(msg => 
            msg.tempId === tempId 
              ? { ...msg, status: 'sent', id: confirmedMessage.messageId || confirmedMessage.id || tempId }
              : msg
          ));

          console.log('✅ Message sent and confirmed:', confirmedMessage);
          
        } catch (error) {
          console.error('❌ Failed to send via WebSocket:', error);
          
          // Update message status to "failed"
          setMessages(prev => prev.map(msg => 
            msg.tempId === tempId 
              ? { ...msg, status: 'failed' }
              : msg
          ));
          
          message.error(`Không thể gửi tin nhắn: ${error.message}`);
        }
      } else {
        // Update status to failed if not connected
        setMessages(prev => prev.map(msg => 
          msg.tempId === tempId 
            ? { ...msg, status: 'failed' }
            : msg
        ));
        message.warning('WebSocket chưa kết nối. Vui lòng đợi kết nối.');
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      message.error('Không thể gửi tin nhắn: ' + error.message);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleChooseCoach = async (coach) => {
    try {
      setSelectingCoach(true);
      const response = await chooseCoach(coach.coachId);
      
      if (response.success) {
        message.success(`Successfully selected ${coach.name} as your coach!`);
        setCoachSelectionModal(false);
        // Refresh data to update assignment status and potentially new chat rooms
        await fetchData();
      } else {
        message.error(response.message || 'Failed to select coach');
      }
    } catch (error) {
      console.error('Error choosing coach:', error);
      message.error('Failed to select coach. Please try again.');
    } finally {
      setSelectingCoach(false);
    }
  };

  // Handle retry failed message
  const handleRetryMessage = async (failedMessage) => {
    if (!selectedChatRoom?.roomId) {
      message.warning('Vui lòng chọn một phòng chat trước');
      return;
    }

    // Update message status to sending
    setMessages(prev => prev.map(msg => 
      msg.id === failedMessage.id || msg.tempId === failedMessage.tempId
        ? { ...msg, status: 'sending' }
        : msg
    ));

    try {
      if (wsConnected) {
        const messageData = {
          content: failedMessage.content,
          type: failedMessage.type || 'text',
          senderId: currentUser.userId,
          senderName: currentUser.fullName || currentUser.name || 'You',
          receiverId: selectedCoach?.coachId || null,
          receiverName: selectedCoach?.name || '',
          timestamp: new Date().toISOString(),
          tempId: failedMessage.tempId || failedMessage.id
        };

        const confirmedMessage = await webSocketService.sendPrivateMessage(selectedChatRoom.roomId, messageData);
        
        // Update message status to "sent" when confirmed
        setMessages(prev => prev.map(msg => 
          (msg.id === failedMessage.id || msg.tempId === failedMessage.tempId)
            ? { ...msg, status: 'sent', id: confirmedMessage.messageId || confirmedMessage.id || failedMessage.id }
            : msg
        ));

        message.success('Tin nhắn đã được gửi lại thành công');
        
      } else {
        // Update status to failed if not connected
        setMessages(prev => prev.map(msg => 
          (msg.id === failedMessage.id || msg.tempId === failedMessage.tempId)
            ? { ...msg, status: 'failed' }
            : msg
        ));
        message.warning('WebSocket chưa kết nối. Vui lòng đợi kết nối.');
      }
    } catch (error) {
      console.error('❌ Failed to retry message:', error);
      
      // Update message status to "failed"
      setMessages(prev => prev.map(msg =>
        (msg.id === failedMessage.id || msg.tempId === failedMessage.tempId)
          ? { ...msg, status: 'failed' }
          : msg
      ));
      
      message.error(`Không thể gửi lại tin nhắn: ${error.message}`);
    }
  };

  // Debug function to check message confirmation
  const debugMessageStatus = () => {
    console.log('🔍 Debug: Current messages with status:', messages.map(msg => ({
      id: msg.id,
      tempId: msg.tempId,
      content: msg.content.substring(0, 20) + '...',
      status: msg.status,
      timestamp: msg.timestamp
    })));
    
    if (webSocketService.pendingMessages) {
      console.log('🔍 Debug: Pending messages:', Array.from(webSocketService.pendingMessages.keys()));
    }
  };

  // Call debug function when messages change (for development)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      debugMessageStatus();
    }
  }, [messages]);

  const communityRooms = COMMUNITY_ROOM_IDS.map(id => ({
    roomId: id,
    roomName: `Community Room ${id}`,
    type: 'community'
  }));
  const filteredChatRooms = chatRooms.filter(room =>
    room.roomName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCoaches = coaches.filter(coach =>
    coach.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coach.certificates?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coach.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatMessageTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getRoomDisplayName = (room) => {
    // Extract coach name from room name
    if (room.roomName) {
      // "Consultation room between Dr. Lan Nguyen and Tester Member Premium"
      const match = room.roomName.match(/between (.+?) and/);
      if (match) {
        return match[1]; // Returns "Dr. Lan Nguyen"
      }
      return room.roomName;
    }
    return `Room ${room.roomId}`;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>Loading chat...</div>
      </div>
    );
  }

  return (
    <Layout style={{ height: '100vh', background: '#f0f2f5' }}>
      {/* Left Sidebar - Chat Rooms and Coaches */}
      <Sider 
        width={350} 
        style={{ 
          background: '#fff',
          borderRight: '1px solid #f0f0f0',
          overflow: 'hidden'
        }}
      >
        <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Title level={4} style={{ margin: 0 }}>
                <MessageOutlined /> Chat
              </Title>
            </div>
            {/* Tab Buttons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button 
                type={activeTab === 'private' ? 'primary' : 'default'}
                size="small"
                icon={<CommentOutlined />}
                onClick={() => setActiveTab('private')}
              >
                Private Chat
              </Button>
              <Button 
                type={activeTab === 'community' ? 'primary' : 'default'}
                size="small"
                icon={<TeamOutlined />}
                onClick={() => setActiveTab('community')}
              >
                Community
              </Button>
            </div>
            {/* WebSocket Connection Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Badge 
                status={connectionStatus === 'connected' ? 'success' : 
                       connectionStatus === 'connecting' ? 'processing' : 'error'} 
                text={
                  connectionStatus === 'connected' ? 'Kết nối thành công' :
                  connectionStatus === 'connecting' ? 'Đang kết nối...' :
                  connectionStatus === 'failed' ? 'Kết nối thất bại' : 'Chưa kết nối'
                }
                style={{ fontSize: '11px' }}
              />
              {(connectionStatus === 'failed' || connectionStatus === 'disconnected') && (
                <Button 
                  type="link" 
                  size="small" 
                  onClick={reconnectWebSocket}
                  loading={connectionStatus === 'connecting'}
                  style={{ padding: '0', fontSize: '11px', height: 'auto' }}
                >
                  Kết nối lại
                </Button>
              )}
            </div>
          </Space>
        </div>

        <div style={{ height: 'calc(100vh - 180px)', overflow: 'auto' }}>
          {activeTab === 'private' ? (
            filteredChatRooms.length > 0 ? (
              <List
                dataSource={filteredChatRooms}
                renderItem={(room) => (
                  <List.Item
                    style={{ 
                      padding: '12px 16px',
                      cursor: 'pointer',
                      backgroundColor: selectedChatRoom?.roomId === room.roomId 
                        ? '#e6f7ff' : 'transparent',
                      borderLeft: selectedChatRoom?.roomId === room.roomId 
                        ? '3px solid #1890ff' : '3px solid transparent'
                    }}
                    onClick={() => handleRoomSelect(room)}
                  >
                    <List.Item.Meta
                      avatar={
                        <Badge dot={wsConnected} status={wsConnected ? 'success' : 'default'}>
                          <Avatar 
                            icon={<MessageOutlined />}
                            size={48}
                            style={{ backgroundColor: '#1890ff' }}
                          />
                        </Badge>
                      }
                      title={
                        <div>
                          <Text strong>{getRoomDisplayName(room)}</Text>
                          <div style={{ fontSize: '12px' }}>
                            <Text type="secondary">Room ID: {room.roomId}</Text>
                          </div>
                        </div>
                      }
                      description={
                        <div>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {room.type} Room
                          </Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: '11px' }}>
                            {wsConnected ? 'Online' : 'Offline'}
                          </Text>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty 
                description="Chưa có phòng chat nào"
                style={{ marginTop: '50px' }}
              />
            )
          ) : (
            <>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
                <Text strong>Chọn phòng Community:</Text>
                <Space style={{ marginLeft: 8 }}>
                  {communityRooms.map(room => (
                    <Button
                      key={room.roomId}
                      type={communityRoomId === room.roomId ? 'primary' : 'default'}
                      onClick={() => handleCommunityRoomSelect(room.roomId)}
                      size="small"
                    >
                      {room.roomName}
                    </Button>
                  ))}
                </Space>
              </div>
            </>
          )}
        </div>
      </Sider>

      {/* Main Chat Area */}
      <Content style={{ display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'community' && communityRoomId ? (
          <>
            {/* Community Chat Header */}
            <div style={{
              background: '#fff',
              padding: '16px 24px',
              borderBottom: '1px solid #f0f0f0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                  <Avatar icon={<TeamOutlined />} size={40} style={{ backgroundColor: '#52c41a' }} />
                  <div>
                    <Title level={5} style={{ margin: 0 }}>
                      Community Room {communityRoomId}
                    </Title>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Room ID: {communityRoomId} • Community
                    </Text>
                  </div>
                </Space>
                <Space>
                  <Badge
                    status={wsConnected ? 'success' : 'error'}
                    text={wsConnected ? 'Connected' : 'Disconnected'}
                  />
                </Space>
              </div>
            </div>
            {/* Community Messages Area */}
            <div style={{
              flex: 1,
              overflow: 'auto',
              padding: '16px 24px',
              background: '#fafafa'
            }}>
              {loadingCommunityMessages ? (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                  <Spin size="large" />
                  <div style={{ marginTop: '16px' }}>Loading messages...</div>
                </div>
              ) : communityMessages.length > 0 ? (
                <div>
                  {communityMessages.map((msg) => (
                    <div
                      key={msg.id || msg.messageId}
                      style={{
                        marginBottom: '16px',
                        display: 'flex',
                        justifyContent: msg.senderId === currentUser.userId ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <div style={{ maxWidth: '70%' }}>
                        {msg.senderId !== currentUser.userId && (
                          <div style={{ marginBottom: '4px' }}>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              {msg.senderName}
                            </Text>
                          </div>
                        )}
                        <Card
                          size="small"
                          style={{
                            backgroundColor: msg.senderId === currentUser.userId ? '#52c41a' : '#fff',
                            color: msg.senderId === currentUser.userId ? '#fff' : '#000',
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                          bodyStyle={{ padding: '8px 12px' }}
                        >
                          <div>{msg.content}</div>
                          <div style={{
                            fontSize: '11px',
                            opacity: 0.7,
                            marginTop: '4px',
                            textAlign: 'right',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <span>{formatMessageTime(msg.timestamp)}</span>
                            {msg.senderId === currentUser.userId && (
                              <span style={{ marginLeft: '8px' }}>
                                {msg.status === 'sending' && (
                                  <Tag color="orange" size="small" style={{ fontSize: '10px', margin: 0 }}>
                                    Đang gửi...
                                  </Tag>
                                )}
                                {msg.status === 'sent' && (
                                  <Tag color="green" size="small" style={{ fontSize: '10px', margin: 0 }}>
                                    ✓ Đã gửi
                                  </Tag>
                                )}
                                {msg.status === 'failed' && (
                                  <Tag
                                    color="red"
                                    size="small"
                                    style={{ fontSize: '10px', margin: 0 }}
                                  >
                                    ✗ Thất bại
                                  </Tag>
                                )}
                              </span>
                            )}
                          </div>
                        </Card>
                      </div>
                    </div>
                  ))}
                  <div ref={communityMessagesEndRef} />
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  marginTop: '50px',
                  color: '#999'
                }}>
                  <MessageOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                  <div>Bắt đầu cuộc trò chuyện trong Community Room {communityRoomId}</div>
                </div>
              )}
            </div>
            {/* Community Message Input */}
            <div style={{
              background: '#fff',
              padding: '16px 24px',
              borderTop: '1px solid #f0f0f0'
            }}>
              <Space.Compact style={{ width: '100%' }}>
                <TextArea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  autoSize={{ minRows: 1, maxRows: 4 }}
                  onPressEnter={(e) => {
                    if (e.shiftKey) return;
                    e.preventDefault();
                    handleSendCommunityMessage();
                  }}
                  style={{ resize: 'none' }}
                />
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  loading={sendingCommunityMessage}
                  onClick={handleSendCommunityMessage}
                  disabled={!newMessage.trim() || !wsConnected}
                  title={!wsConnected ? 'WebSocket chưa kết nối' : ''}
                >
                  Gửi
                </Button>
              </Space.Compact>
            </div>
          </>
        ) : selectedChatRoom ? (
          <>
            {/* Chat Header */}
            <div style={{
              background: '#fff',
              padding: '16px 24px',
              borderBottom: '1px solid #f0f0f0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                  <Avatar
                    icon={<MessageOutlined />}
                    size={40}
                    style={{ backgroundColor: '#1890ff' }}
                  />
                  <div>
                    <Title level={5} style={{ margin: 0 }}>
                      {getRoomDisplayName(selectedChatRoom)}
                    </Title>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Room ID: {selectedChatRoom.roomId} • {selectedChatRoom.type}
                    </Text>
                  </div>
                </Space>
                <Space>
                  <Badge
                    status={wsConnected ? 'success' : 'error'}
                    text={wsConnected ? 'Connected' : 'Disconnected'}
                  />
                </Space>
              </div>
            </div>

            {/* Messages Area */}
            <div style={{
              flex: 1,
              overflow: 'auto',
              padding: '16px 24px',
              background: '#fafafa'
            }}>
              {loadingMessages ? (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                  <Spin size="large" />
                  <div style={{ marginTop: '16px' }}>Loading messages...</div>
                </div>
              ) : messages.length > 0 ? (
                <div>
                  {messages.map((msg) => (
                    <div
                      key={msg.id || msg.messageId}
                      style={{
                        marginBottom: '16px',
                        display: 'flex',
                        justifyContent: msg.senderId === currentUser.userId ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <div style={{ maxWidth: '70%' }}>
                        {msg.senderId !== currentUser.userId && (
                          <div style={{ marginBottom: '4px' }}>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              {msg.senderName}
                            </Text>
                          </div>
                        )}
                        <Card
                          size="small"
                          style={{
                            backgroundColor: msg.senderId === currentUser.userId ? '#1890ff' : '#fff',
                            color: msg.senderId === currentUser.userId ? '#fff' : '#000',
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                          bodyStyle={{ padding: '8px 12px' }}
                        >
                          <div>{msg.content}</div>
                          <div style={{
                            fontSize: '11px',
                            opacity: 0.7,
                            marginTop: '4px',
                            textAlign: 'right',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <span>{formatMessageTime(msg.timestamp)}</span>
                            {msg.senderId === currentUser.userId && (
                              <span style={{ marginLeft: '8px' }}>
                                {msg.status === 'sending' && (
                                  <Tag color="orange" size="small" style={{ fontSize: '10px', margin: 0 }}>
                                    Đang gửi...
                                  </Tag>
                                )}
                                {msg.status === 'sent' && (
                                  <Tag color="green" size="small" style={{ fontSize: '10px', margin: 0 }}>
                                    ✓ Đã gửi
                                  </Tag>
                                )}
                                {msg.status === 'failed' && (
                                  <Tag
                                    color="red"
                                    size="small"
                                    style={{ fontSize: '10px', margin: 0, cursor: 'pointer' }}
                                    onClick={() => handleRetryMessage(msg)}
                                    title="Click để gửi lại"
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
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  marginTop: '50px',
                  color: '#999'
                }}>
                  <MessageOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                  <div>Bắt đầu cuộc trò chuyện trong {getRoomDisplayName(selectedChatRoom)}</div>
                </div>
              )}
            </div>
            {/* Message Input */}
            <div style={{
              background: '#fff',
              padding: '16px 24px',
              borderTop: '1px solid #f0f0f0'
            }}>
              <Space.Compact style={{ width: '100%' }}>
                <TextArea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  autoSize={{ minRows: 1, maxRows: 4 }}
                  onPressEnter={(e) => {
                    if (e.shiftKey) return;
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  style={{ resize: 'none' }}
                />
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  loading={sendingMessage}
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || !wsConnected || !selectedChatRoom}
                  title={!wsConnected ? 'WebSocket chưa kết nối' : !selectedChatRoom ? 'Chưa chọn phòng chat' : ''}
                >
                  Gửi
                </Button>
              </Space.Compact>
            </div>
          </>
        ) : (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#fff'
          }}>
            <div style={{ textAlign: 'center' }}>
              <MessageOutlined style={{ fontSize: '64px', color: '#ccc', marginBottom: '16px' }} />
              <Title level={4} type="secondary">Chọn một phòng chat để bắt đầu</Title>
              <Text type="secondary">
                Chọn một phòng chat từ danh sách bên trái hoặc chọn huấn luyện viên để bắt đầu cuộc trò chuyện
              </Text>
            </div>
          </div>
        )}
      </Content>

      {/* Coach Selection Modal */}
      <Modal
        title={
          <Space>
            <TeamOutlined />
            <span>Chọn Huấn luyện viên</span>
          </Space>
        }
        open={coachSelectionModal}
        onCancel={() => setCoachSelectionModal(false)}
        footer={null}
        width={800}
      >
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary">
            Chọn một huấn luyện viên để bắt đầu nhận hỗ trợ trong hành trình cai thuốc lá của bạn.
          </Text>
        </div>

        <List
          dataSource={coaches}
          renderItem={(coach) => (
            <List.Item
              actions={[
                <Button
                  type="primary"
                  loading={selectingCoach}
                  onClick={() => handleChooseCoach(coach)}
                  disabled={coach.full}
                >
                  {coach.full ? 'Đã đầy' : 'Chọn Coach'}
                </Button>
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Avatar 
                    src={coach.photo_url} 
                    icon={<UserOutlined />}
                    size={64}
                  />
                }
                title={
                  <div>
                    <Text strong style={{ fontSize: '16px' }}>
                      {coach.name}
                    </Text>
                    <div style={{ marginTop: '4px' }}>
                      <Tag color="blue">{coach.certificates}</Tag>
                      {coach.full && <Tag color="red">Đã đầy</Tag>}
                    </div>
                  </div>
                }
                description={
                  <div>
                    <div style={{ marginTop: '8px' }}>
                      <Text type="secondary">
                        Email: {coach.email}
                      </Text>
                    </div>
                    <div style={{ marginTop: '4px' }}>
                      <Text type="secondary">
                        Liên hệ: {coach.contact_number}
                      </Text>
                    </div>
                    <div style={{ marginTop: '8px' }}>
                      <Space>
                        <Text type="secondary">
                          <TeamOutlined /> {coach.currentMemberAssignedCount} thành viên
                        </Text>
                        <Text type="secondary">
                          Trạng thái: {coach.full ? 'Đã đầy' : 'Còn chỗ'}
                        </Text>
                      </Space>
                    </div>
                    <div style={{ marginTop: '8px' }}>
                      <Text strong>Lịch làm việc:</Text>
                      <div style={{ marginTop: '4px' }}>
                        {coach.workingHours?.length > 0 ? (
                          coach.workingHours.slice(0, 3).map((schedule, index) => (
                            <div key={index} style={{ fontSize: '12px' }}>
                              <Text type="secondary">
                                {schedule.dayOfWeek}: {schedule.startTime} - {schedule.endTime}
                              </Text>
                            </div>
                          ))
                        ) : (
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            Chưa có lịch làm việc
                          </Text>
                        )}
                        {coach.workingHours?.length > 3 && (
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            ... và {coach.workingHours.length - 3} ngày khác
                          </Text>
                        )}
                      </div>
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Modal>
    </Layout>
  );
};

export default ChatPage;
