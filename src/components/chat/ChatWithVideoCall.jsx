import React, { useState } from "react";
import { Button, Space, message } from "antd";
import { VideoCameraOutlined } from "@ant-design/icons";
import VideoCallModal from "../videocall/VideoCallModal";
import { getCurrentUser } from "../../utils/auth";

const ChatWithVideoCall = ({
  otherUserId,
  otherUserName,
  otherUserRole,
  isConnected = true,
  children, // Để chứa nội dung chat hiện tại
}) => {
  const [isVideoCallVisible, setIsVideoCallVisible] = useState(false);
  const currentUser = getCurrentUser();
  const isCoach = currentUser?.role === "COACH";

  // Xác định coach và member
  const coachId = isCoach ? currentUser.userId : otherUserId;
  const memberId = isCoach ? otherUserId : currentUser.userId;
  const coachName = isCoach
    ? currentUser.name || "Huấn luyện viên"
    : otherUserName;
  const memberName = isCoach ? otherUserName : currentUser.name || "Thành viên";

  const handleVideoCall = () => {
    if (!isConnected) {
      message.warning("Vui lòng kết nối chat trước khi gọi video");
      return;
    }

    setIsVideoCallVisible(true);
    message.info("Đang khởi tạo cuộc gọi video...");
  };

  const handleCloseVideoCall = () => {
    setIsVideoCallVisible(false);
  };

  return (
    <div>
      {/* Chat Header với nút Video Call */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          borderBottom: "1px solid #f0f0f0",
          backgroundColor: "#fafafa",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              color: isConnected ? "green" : "orange",
              fontWeight: "bold",
            }}
          >
            ● {isConnected ? "Connected" : "Connecting..."}
          </span>
          <span style={{ color: "#666" }}>Chat với {otherUserName}</span>
        </div>

        <Space>
          <Button
            type="primary"
            icon={<VideoCameraOutlined />}
            onClick={handleVideoCall}
            size="small"
            disabled={!isConnected}
          >
            Gọi video
          </Button>
        </Space>
      </div>

      {/* Nội dung chat hiện tại */}
      {children}

      {/* Video Call Modal */}
      <VideoCallModal
        visible={isVideoCallVisible}
        onClose={handleCloseVideoCall}
        coachId={coachId}
        memberId={memberId}
        coachName={coachName}
        memberName={memberName}
      />
    </div>
  );
};

export default ChatWithVideoCall;
