import React, { useState, useEffect } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import { AGORA_CONFIG, generateChannelName } from "../../config/agoraConfig";
import {
  AudioOutlined,
  AudioMutedOutlined,
  VideoCameraOutlined,
  VideoCameraAddOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import { message, Modal, Rate, Input } from "antd";
import { getVideoCallToken } from "../../services/agoraTokenService";
import appointmentService from "../../services/appointmentService";
import { getCurrentUser } from "../../utils/auth";

const { TextArea } = Input;

const VideoCallModal = ({ appointmentId, isConsultant, onCallEnd }) => {
  const [isJoined, setIsJoined] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");
  const [appointmentDetails, setAppointmentDetails] = useState(null);
  const [client] = useState(() =>
    AgoraRTC.createClient({ mode: "rtc", codec: "vp8" })
  );

  const currentUser = getCurrentUser();
  const isCoach =
    currentUser?.role === "COACH" || currentUser?.userRole === "COACH";

  // Load appointment details khi component mount
  useEffect(() => {
    if (appointmentId) {
      loadAppointmentDetails();
    }
  }, [appointmentId]);

  const loadAppointmentDetails = async () => {
    try {
      const details = await appointmentService.getAppointmentDetails(
        appointmentId
      );
      setAppointmentDetails(details);
      console.log("📋 Appointment details loaded:", details);
    } catch (error) {
      message.error("Không thể tải thông tin cuộc hẹn: " + error.message);
    }
  };

  useEffect(() => {
    const initializeAgora = async () => {
      // Set up event listeners
      client.on("user-published", handleUserPublished);
      client.on("user-unpublished", handleUserUnpublished);
      client.on("user-left", handleUserLeft);

      try {
        const channelName = generateChannelName(appointmentId);
        const userId = currentUser?.userId || currentUser?.id || Date.now();

        // Sử dụng service mới để lấy token
        const tokenData = await getVideoCallToken(appointmentId, userId);

        await client.join(
          tokenData.appId,
          tokenData.channelName,
          tokenData.token,
          tokenData.uid
        );

        const videoTrack = await AgoraRTC.createCameraVideoTrack();
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();

        setLocalVideoTrack(videoTrack);
        setLocalAudioTrack(audioTrack);

        await client.publish([videoTrack, audioTrack]);

        videoTrack.play("local-video");

        setIsJoined(true);
      } catch (error) {
        console.error("Failed to join channel:", error);
      }
    };

    initializeAgora();

    return () => {
      cleanup();
    };
  }, [appointmentId]);

  const handleUserPublished = async (user, mediaType) => {
    await client.subscribe(user, mediaType);

    if (mediaType === "video") {
      const remoteVideoTrack = user.videoTrack;
      remoteVideoTrack?.play(`remote-video-${user.uid}`);
    }

    if (mediaType === "audio") {
      const remoteAudioTrack = user.audioTrack;
      remoteAudioTrack?.play();
    }

    setRemoteUsers((prevUsers) => [
      ...prevUsers.filter((u) => u.uid !== user.uid),
      user,
    ]);
  };

  const handleUserUnpublished = (user) => {
    setRemoteUsers((prevUsers) => prevUsers.filter((u) => u.uid !== user.uid));
  };

  const handleUserLeft = (user) => {
    setRemoteUsers((prevUsers) => prevUsers.filter((u) => u.uid !== user.uid));
  };

  const toggleVideo = async () => {
    if (localVideoTrack) {
      await localVideoTrack.setEnabled(!isVideoEnabled);
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const toggleAudio = async () => {
    if (localAudioTrack) {
      await localAudioTrack.setEnabled(!isAudioEnabled);
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  const endCall = async () => {
    try {
      await cleanup();

      // Nếu là coach, đánh dấu appointment hoàn thành
      if (isCoach && appointmentId) {
        try {
          await appointmentService.completeAppointment(appointmentId);
          message.success("✅ Cuộc hẹn đã được đánh dấu hoàn thành!");
        } catch (error) {
          console.error("Error completing appointment:", error);
          message.warning(
            "Cuộc gọi đã kết thúc nhưng không thể cập nhật trạng thái cuộc hẹn"
          );
        }
      }

      // Nếu là member, hiển thị modal feedback
      if (!isCoach && appointmentId) {
        setShowFeedbackModal(true);
      } else {
        onCallEnd();
      }
    } catch (error) {
      console.error("Error ending call:", error);
      message.error("❌ Có lỗi khi kết thúc cuộc gọi");
      onCallEnd();
    }
  };

  const handleFeedbackSubmit = async () => {
    try {
      // Validation rating trước khi gửi
      if (!rating || rating < 1 || rating > 5) {
        message.error("Vui lòng chọn mức độ hài lòng từ 1 đến 5 sao!");
        return;
      }

      const feedbackData = {
        rating: Number(rating), // Đảm bảo rating là số
        feedback: feedback.trim() || undefined,
      };

      console.log("🔍 Sending feedback data:", feedbackData);

      await appointmentService.giveFeedback(appointmentId, feedbackData);

      message.success("🎉 Cảm ơn bạn đã đánh giá!");
      setShowFeedbackModal(false);
      onCallEnd();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      message.error("Không thể gửi đánh giá: " + error.message);
      // Vẫn đóng modal và kết thúc call
      setShowFeedbackModal(false);
      onCallEnd();
    }
  };

  const cleanup = async () => {
    if (localVideoTrack) {
      localVideoTrack.stop();
      localVideoTrack.close();
    }
    if (localAudioTrack) {
      localAudioTrack.stop();
      localAudioTrack.close();
    }
    if (client) {
      await client.leave();
    }
    setIsJoined(false);
  };

  const getAgoraToken = async (channelName) => {
    try {
      const response = await fetch(`http://localhost:5000/api/agora/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          channelName,
          appointmentId,
          role: isConsultant ? "host" : "audience",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (error) {
      console.error("Failed to get Agora token:", error);
    }
    return null;
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "black",
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ flex: 1, position: "relative" }}>
        <div style={{ width: "100%", height: "100%", background: "#111827" }}>
          {remoteUsers.length > 0 ? (
            remoteUsers.map((user) => (
              <div
                key={user.uid}
                id={`remote-video-${user.uid}`}
                style={{ width: "100%", height: "100%" }}
              />
            ))
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: "128px",
                    height: "128px",
                    background: "#374151",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                  }}
                >
                  <VideoCameraOutlined
                    style={{ fontSize: "64px", color: "white" }}
                  />
                </div>
                <p style={{ fontSize: "20px", color: "white" }}>
                  Waiting for {isConsultant ? "patient" : "consultant"} to
                  join...
                </p>
              </div>
            </div>
          )}
        </div>

        <div
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            width: "192px",
            height: "144px",
            background: "#1f2937",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <div id="local-video" style={{ width: "100%", height: "100%" }} />
        </div>

        <div
          style={{
            position: "absolute",
            top: "16px",
            left: "16px",
            background: "rgba(0, 0, 0, 0.5)",
            color: "white",
            padding: "16px",
            borderRadius: "8px",
          }}
        >
          <p className="text-sm">Appointment #{appointmentId}</p>
          <p className="text-xs text-gray-300">
            {isConsultant ? "Consultant View" : "Patient View"}
          </p>
        </div>
      </div>

      <div className="bg-gray-900 p-6">
        <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
          <button
            onClick={toggleAudio}
            style={{
              padding: "16px",
              borderRadius: "50%",
              border: "none",
              cursor: "pointer",
              background: isAudioEnabled ? "#374151" : "#dc2626",
              color: "white",
              transition: "background-color 0.3s",
              width: "60px",
              height: "60px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isAudioEnabled ? (
              <AudioOutlined style={{ fontSize: "24px" }} />
            ) : (
              <AudioMutedOutlined style={{ fontSize: "24px" }} />
            )}
          </button>

          <button
            onClick={toggleVideo}
            style={{
              padding: "16px",
              borderRadius: "50%",
              border: "none",
              cursor: "pointer",
              background: isVideoEnabled ? "#374151" : "#dc2626",
              color: "white",
              transition: "background-color 0.3s",
              width: "60px",
              height: "60px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isVideoEnabled ? (
              <VideoCameraOutlined style={{ fontSize: "24px" }} />
            ) : (
              <VideoCameraAddOutlined style={{ fontSize: "24px" }} />
            )}
          </button>

          <button
            onClick={endCall}
            style={{
              padding: "16px",
              borderRadius: "50%",
              border: "none",
              cursor: "pointer",
              background: "#dc2626",
              color: "white",
              transition: "background-color 0.3s",
              width: "60px",
              height: "60px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <PhoneOutlined style={{ fontSize: "24px" }} />
          </button>
        </div>
      </div>

      {/* Feedback Modal */}
      <Modal
        title="Đánh giá cuộc gọi tư vấn"
        open={showFeedbackModal}
        onOk={handleFeedbackSubmit}
        onCancel={() => {
          setShowFeedbackModal(false);
          onCallEnd();
        }}
        okText="Gửi đánh giá"
        cancelText="Bỏ qua"
        centered
      >
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <h4>Bạn hài lòng như thế nào với cuộc tư vấn?</h4>
          <Rate
            value={rating}
            onChange={(value) => {
              // Đảm bảo rating luôn có giá trị từ 1-5
              const validRating = value || 1;
              setRating(validRating);
              console.log("🌟 Rating changed to:", validRating);
            }}
            style={{ fontSize: "28px", color: "#fadb14" }}
            allowClear={false} // Không cho phép clear rating về 0
          />
          <div style={{ marginTop: "8px", fontSize: "14px", color: "#666" }}>
            {rating === 1 && "Rất không hài lòng"}
            {rating === 2 && "Không hài lòng"}
            {rating === 3 && "Bình thường"}
            {rating === 4 && "Hài lòng"}
            {rating === 5 && "Rất hài lòng"}
          </div>
        </div>

        <div>
          <h4>Chia sẻ thêm cảm nhận của bạn (tùy chọn):</h4>
          <TextArea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Nhập ý kiến phản hồi của bạn..."
            rows={4}
            maxLength={500}
            showCount
          />
        </div>

        {appointmentDetails && (
          <div
            style={{
              marginTop: "16px",
              padding: "12px",
              background: "#f5f5f5",
              borderRadius: "6px",
            }}
          >
            <small>
              <strong>Cuộc hẹn:</strong> #{appointmentId}
              <br />
              <strong>Chuyên viên:</strong>{" "}
              {appointmentDetails.coachName || "N/A"}
              <br />
              <strong>Thời gian:</strong>{" "}
              {appointmentDetails.appointmentDate &&
              appointmentDetails.appointmentTime
                ? `${appointmentDetails.appointmentDate} ${appointmentDetails.appointmentTime}`
                : "N/A"}
            </small>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default VideoCallModal;
