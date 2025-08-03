import React, { useEffect, useRef, useState } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import { message } from "antd";
import { getCurrentUser } from "../../utils/auth";
import {
  AGORA_CONFIG,
  generateChannelName,
  generateUserUID,
} from "../../config/agoraConfig";
import { getVideoCallToken } from "../../services/agoraTokenService";
import appointmentService from "../../services/appointmentService";

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

export default function VideoCallMeeting({ appointmentId, userId, onLeave }) {
  const [localTracks, setLocalTracks] = useState([]);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const currentUser = getCurrentUser();

  useEffect(() => {
    let mounted = true;

    const initCall = async () => {
      try {
        const resolvedUserId = userId || currentUser?.userId || Date.now();
        const resolvedAppointmentId = appointmentId || `temp_${Date.now()}`;

        const channelName = generateChannelName(resolvedAppointmentId);
        const uidString = generateUserUID(
          resolvedUserId,
          currentUser?.role || "user"
        );

        const tokenData = await fetchAgoraToken(
          channelName,
          resolvedUserId,
          resolvedAppointmentId
        );
        if (!mounted) return;

        await client.join(
          tokenData.app_id,
          tokenData.channelName,
          tokenData.token,
          uidString
        );
        const [audioTrack, videoTrack] =
          await AgoraRTC.createMicrophoneAndCameraTracks();
        setLocalTracks([audioTrack, videoTrack]);

        await client.publish([audioTrack, videoTrack]);
        videoTrack.play(localVideoRef.current);

        client.on("user-published", async (user, mediaType) => {
          await client.subscribe(user, mediaType);
          if (mediaType === "video") {
            setRemoteUsers([user]);
            setTimeout(() => {
              if (remoteVideoRef.current && user.videoTrack) {
                user.videoTrack.play(remoteVideoRef.current);
              }
            }, 100);
          }
          if (mediaType === "audio" && user.audioTrack) {
            user.audioTrack.play();
          }
        });

        client.on("user-unpublished", () => {
          setRemoteUsers([]);
        });
      } catch (error) {
        console.error("Video call error:", error);
        message.error("❌ Không thể kết nối video call");
      }
    };

    initCall();

    return () => {
      mounted = false;
      localTracks.forEach((track) => {
        try {
          track.stop();
          track.close();
        } catch {}
      });
      client.leave().catch(() => {});
      if (onLeave) onLeave();
    };
  }, [appointmentId, userId]);

  const fetchAgoraToken = async (channelName, uid, appointmentId) => {
    try {
      const response = await fetch(
        `/get-video-token?channelName=${channelName}&userId=${uid}&appointmentId=${appointmentId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        const errText = await response.text();
        console.error("❌ Backend error:", errText);
      }
    } catch (error) {
      console.error("API error:", error.message);
    }

    // Fallback tạm thời (chỉ dùng khi backend lỗi)
    return {
      app_id: AGORA_CONFIG.appId,
      channelName,
      token: "TEMP_TOKEN",
      uid,
    };
  };

  return (
    <div style={{ display: "flex", height: "100%" }}>
      <div ref={localVideoRef} style={{ flex: 1, background: "#000" }} />
      {remoteUsers.length > 0 ? (
        <div ref={remoteVideoRef} style={{ flex: 1, background: "#000" }} />
      ) : (
        <div
          style={{
            flex: 1,
            background: "#111",
            color: "#fff",
            textAlign: "center",
            paddingTop: "20%",
          }}
        >
          ⏳ Chờ người khác tham gia cuộc gọi...
        </div>
      )}
    </div>
  );
}
