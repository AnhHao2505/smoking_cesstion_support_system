import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layout,
  Typography,
  Card,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Row,
  Col,
  Avatar,
  Descriptions,
  Steps,
  message,
  Alert,
  Progress,
  Timeline,
  Statistic,
  Divider,
  DatePicker,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  MedicineBoxOutlined,
  HeartOutlined,
  FireOutlined,
  TrophyOutlined,
  MessageOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined,
  FlagOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import moment from "moment";
import {
  getNewestQuitPlan,
  acceptQuitPlan,
  denyQuitPlan,
  checkPlanActionAvailability,
  getQuitPlanStatusText,
  getQuitPlanStatusColor,
  requestQuitPlan,
} from "../../services/quitPlanService";
import { getPhasesOfPlan } from "../../services/phaseService";
import { getCurrentUser } from "../../services/authService";
import "../../styles/Dashboard.css";

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

const MemberQuitPlanFlow = () => {
  const navigate = useNavigate();
  const [currentPlan, setCurrentPlan] = useState(null);
  const [planPhases, setPlanPhases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionType, setActionType] = useState(""); // 'accept' or 'deny'
  const [submitting, setSubmitting] = useState(false);

  const user = getCurrentUser();
  const memberId = user?.userId;

  useEffect(() => {
    if (memberId) {
      fetchMemberQuitPlanData();
    } else {
      setLoading(false);
      message.error("Please log in as a member to access this feature");
    }
  }, [memberId]);

  const fetchMemberQuitPlanData = async () => {
    try {
      setLoading(true);

      // Fetch current plan
      const currentPlanResponse = await getNewestQuitPlan();
      console.log("API Response:", currentPlanResponse);

      // Handle null response - user has no plan
      if (!currentPlanResponse) {
        console.log("No active quit plan found");
        setCurrentPlan(null);
        setPlanPhases([]);
        setLoading(false);
        return;
      }

      // Map API response to component expected format
      const planData = currentPlanResponse;
      // Add action availability
      const actionAvailability = checkPlanActionAvailability(planData);
      const planWithActions = { ...planData, ...actionAvailability };

      // Normalize status to match new status types
      let normalizedStatus = planData.quitPlanStatus;
      console.log("Original status from API:", planData.quitPlanStatus);
      if (normalizedStatus === "ACTIVE") normalizedStatus = "IN_PROGRESS";
      if (normalizedStatus === "DENIED") normalizedStatus = "REJECTED";
      if (normalizedStatus === "FAILED") normalizedStatus = "FAILED";
      if (normalizedStatus === "ACCEPTED") normalizedStatus = "ACCEPTED";
      if (normalizedStatus === "COMPLETED") normalizedStatus = "COMPLETED";
      if (normalizedStatus === "PENDING") normalizedStatus = "PENDING";
      console.log("Normalized status:", normalizedStatus);

      const mappedPlan = {
        quit_plan_id: planData.id,
        status: normalizedStatus,
        start_date: planData.startDate,
        end_date: planData.endDate,
        coach_name: planData.coachName,
        coach_id: planData.coachId,
        member_name: planData.memberName,
        member_id: planData.memberId,
        strategies_to_use: planData.copingStrategies,
        medications_to_use: planData.medicationsToUse,
        preparation_steps: planData.relapsePreventionStrategies,
        medication_instructions: planData.medicationInstructions,
        note: planData.additionalNotes,
        motivation: planData.motivation,
        reward_plan: planData.rewardPlan,
        support_resources: planData.supportResources,
        smoking_triggers_to_avoid: planData.smokingTriggersToAvoid,
        current_smoking_status: planData.currentSmokingStatus,
        // Add progress and duration fields from backend
        progressInDay: planData.progressInDay,
        durationInDays: planData.durationInDays,
        completionQuality: planData.completionQuality,
        finalEvaluation: planData.finalEvaluation, // Coach's final evaluation for completed plans
        // Add action availability based on status
        canAccept: normalizedStatus === "PENDING",
        canDeny: normalizedStatus === "PENDING",
      };
      console.log(mappedPlan);
      setCurrentPlan(mappedPlan);

      // Fetch plan phases if plan has ID
      const planId = planData.id;
      if (planId) {
        try {
          const phasesResponse = await getPhasesOfPlan(planId);
          console.log("Phases Response:", phasesResponse);
          // Handle single phase object or array of phases
          const phases = Array.isArray(phasesResponse)
            ? phasesResponse
            : [phasesResponse];
          // Sort phases by order if multiple phases exist
          const sortedPhases = phases.sort(
            (a, b) => (a.phaseOrder || 0) - (b.phaseOrder || 0)
          );
          setPlanPhases(sortedPhases);
        } catch (phaseError) {
          console.warn("Could not fetch phases:", phaseError);
          setPlanPhases([]);
        }
      }
    } catch (error) {
      console.error("Error fetching member quit plan data:", error);
      // No error message shown - UI will show appropriate state based on data
      setCurrentPlan(null);
      setPlanPhases([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanAction = (action) => {
    setActionType(action);

    // Reset date state when opening modal
    if (action === "accept") {
      const today = moment();
      setSelectedDateObj(today);
      setStartDate(today.format("YYYY-MM-DD"));
      setDateError("");
    }

    setActionModalVisible(true);
  };

  const [selectedDateObj, setSelectedDateObj] = useState(moment()); // Giữ đối tượng moment
  const [startDate, setStartDate] = useState(moment().format("YYYY-MM-DD")); // Today as default
  const [dateError, setDateError] = useState(""); // Lưu thông báo lỗi ngày

  const submitPlanAction = async () => {
    try {
      // Validate start date for accept action
      if (actionType === "accept") {
        // Kiểm tra nếu có lỗi về ngày
        if (dateError) {
          message.error(
            dateError || "Ngày bắt đầu không hợp lệ. Vui lòng kiểm tra lại."
          );
          return;
        }

        // Kiểm tra nếu chưa chọn ngày
        if (!startDate || !selectedDateObj) {
          setDateError("Vui lòng chọn ngày bắt đầu");
          message.error("Vui lòng chọn ngày bắt đầu");
          return;
        }

        // Kiểm tra lần cuối về tính hợp lệ của ngày
        if (!selectedDateObj.isValid()) {
          setDateError("Ngày không hợp lệ");
          message.error("Ngày không hợp lệ");
          return;
        }

        const formattedDate = selectedDateObj.format("YYYY-MM-DD");

        // Final validation - make sure startDate matches our selected date object
        if (formattedDate !== startDate) {
          setStartDate(formattedDate); // Ensure consistency
        }
      }

      setSubmitting(true);
      const planId = currentPlan.quit_plan_id;

      // Call appropriate API function
      let response;
      if (actionType === "accept") {
        // Lấy ngày từ selectedDateObj để đảm bảo tính nhất quán
        const validStartDate = selectedDateObj.format("YYYY-MM-DD");

        // Backend expects startDate for accept
        console.log(
          `Accepting plan with ID ${planId} and start date ${validStartDate}`
        );
        response = await acceptQuitPlan(planId, validStartDate);
      } else if (actionType === "deny") {
        response = await denyQuitPlan(planId);
      }

      if (response.success) {
        // Update local state immediately
        const newStatus = actionType === "accept" ? "ACCEPTED" : "REJECTED";

        // If accepting, calculate the end date based on the selected date object
        if (actionType === "accept") {
          // Use selectedDateObj directly to avoid any formatting/parsing issues
          if (!selectedDateObj || !selectedDateObj.isValid()) {
            message.error("Ngày bắt đầu không hợp lệ");
            setSubmitting(false);
            return;
          }

          // Calculate end date using the moment object directly
          const calculatedEndDate = selectedDateObj
            .clone()
            .add(currentPlan.durationInDays, "days")
            .format("YYYY-MM-DD");

          // Format start date in YYYY-MM-DD format for consistency
          const formattedStartDate = selectedDateObj.format("YYYY-MM-DD");

          setCurrentPlan({
            ...currentPlan,
            status: newStatus,
            start_date: formattedStartDate,
            end_date: calculatedEndDate,
            canAccept: false,
            canDeny: false,
          });
        } else {
          setCurrentPlan({
            ...currentPlan,
            status: newStatus,
            canAccept: false,
            canDeny: false,
          });
        }

        // Show appropriate success message
        const actionMessage =
          actionType === "accept"
            ? `Kế hoạch đã được chấp nhận! Hành trình cai thuốc của bạn sẽ bắt đầu từ ${selectedDateObj.format(
                "DD/MM/YYYY"
              )}.`
            : "Kế hoạch đã bị từ chối. Huấn luyện viên của bạn sẽ tạo kế hoạch mới.";
        message.success(actionMessage);

        // Refresh data to get latest state
        await fetchMemberQuitPlanData();
      } else {
        message.error(response.message || `Failed to ${actionType} plan`);
      }

      setActionModalVisible(false);
    } catch (error) {
      console.error(`Error ${actionType} plan:`, error);
      message.error(`Failed to ${actionType} plan`);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    // Custom color mapping for new status types
    switch (status) {
      case "REJECTED":
        return "red";
      case "FAILED":
        return "red";
      case "ACCEPTED":
        return "blue";
      case "PENDING":
        return "gold";
      case "COMPLETED":
        return "green";
      case "IN_PROGRESS":
        return "cyan";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    // Custom text mapping for new status types
    switch (status) {
      case "REJECTED":
        return "Đã từ chối";
      case "FAILED":
        return "Thất bại";
      case "ACCEPTED":
        return "Đã chấp nhận";
      case "PENDING":
        return "Đang chờ duyệt";
      case "COMPLETED":
        return "Đã hoàn thành";
      case "IN_PROGRESS":
        return "Đang thực hiện";
      default:
        return "Không xác định";
    }
  };

  const formatDate = (dateString) => {
    return moment(dateString).format("DD/MM/YYYY");
  };

  const getCurrentPhaseIndex = () => {
    if (!planPhases.length) return 0;
    // Since we may only have one phase currently, return 0 for active phase
    // or find the current phase based on order
    const currentPhase = planPhases.find((phase) => phase.phaseOrder === 1);
    return currentPhase ? 0 : 0;
  };

  const calculateProgress = () => {
    if (!currentPlan) return { percent: 0, status: "normal", color: "#1890ff" };

    // Kiểm tra dữ liệu đầu vào từ backend
    const isValidProgress =
      currentPlan.progressInDay !== undefined &&
      currentPlan.progressInDay !== null &&
      !isNaN(currentPlan.progressInDay);
    const isValidDuration =
      currentPlan.durationInDays !== undefined &&
      currentPlan.durationInDays !== null &&
      !isNaN(currentPlan.durationInDays);

    console.log("Debug progress data:", {
      progressInDay: currentPlan.progressInDay,
      durationInDays: currentPlan.durationInDays,
      isValidProgress,
      isValidDuration,
    });

    // Dữ liệu từ backend
    let totalDays = 0;
    let passedDays = 0;
    let percent = 0;

    if (isValidProgress && isValidDuration) {
      // Sử dụng dữ liệu từ backend
      totalDays = currentPlan.durationInDays;
      passedDays = currentPlan.progressInDay;

      if (totalDays > 0) {
        percent = Math.round((passedDays / totalDays) * 100);
      }
    } else {
      // Fallback: tính toán dựa trên ngày tháng
      const startDate = moment(currentPlan.start_date);
      const endDate = moment(currentPlan.end_date);
      const today = moment();

      totalDays = endDate.diff(startDate, "days");
      passedDays = today.diff(startDate, "days");
      percent = Math.max(0, Math.min(100, (passedDays / totalDays) * 100));
    }

    // Đảm bảo giá trị nằm trong khoảng hợp lệ
    passedDays = Math.max(0, Math.min(passedDays, totalDays));
    percent = Math.max(0, Math.min(100, percent));

    // Determine status and color based on plan status
    let status = "normal";
    let color = "#1890ff";
    let quality = "";

    if (currentPlan.status === "COMPLETED") {
      status = "success";

      // Sử dụng completionQuality từ backend nếu có
      if (currentPlan.completionQuality) {
        quality = currentPlan.completionQuality;
        // Dựa vào completionQuality để xác định màu sắc
        const qualityLower = quality.toLowerCase();
        if (qualityLower.includes("xuất sắc")) {
          color = "#52c41a"; // Xanh lá đậm
        } else if (qualityLower.includes("tốt")) {
          color = "#73d13d"; // Xanh lá
        } else if (qualityLower.includes("khá")) {
          color = "#bae637"; // Xanh vàng
        } else {
          color = "#faad14"; // Cam
        }
      } else {
        // Fallback: quyết định màu sắc dựa trên phần trăm hoàn thành
        if (percent >= 90) {
          color = "#52c41a"; // Bright green
          quality = "Xuất sắc";
        } else if (percent >= 75) {
          color = "#73d13d"; // Green
          quality = "Tốt";
        } else if (percent >= 50) {
          color = "#bae637"; // Light green
          quality = "Khá";
        } else {
          color = "#faad14"; // Orange
          quality = "Cần cải thiện";
        }
      }
    } else if (currentPlan.status === "FAILED") {
      status = "exception";
      color = "#f5222d"; // Red
      quality = "Thất bại";
    } else if (currentPlan.status === "REJECTED") {
      status = "exception";
      color = "#ff4d4f"; // Red
      quality = "Từ chối";
    }

    return {
      percent,
      status,
      color,
      quality,
      totalDays,
      passedDays,
    };
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="member-quit-plan-flow">
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Title level={2}>
            <HeartOutlined /> Hành trình cai thuốc của tôi
          </Title>
          <Space>
            <Button
              icon={<FileTextOutlined />}
              onClick={() => navigate("/member/quit-plan-history")}
            >
              Lịch sử kế hoạch
            </Button>
          </Space>
        </div>

        {/* Important reminders and warnings */}
        <div style={{ marginBottom: "24px" }}>
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: "12px" }}
            message="💡 Lời khuyên quan trọng"
            description="Hãy ghi nhận nhật ký hằng ngày đều đặn để tăng tiến độ của kế hoạch cai thuốc. Việc theo dõi hàng ngày sẽ giúp bạn duy trì động lực và đạt được mục tiêu."
          />
          <Alert
            type="warning"
            showIcon
            message="⚠️ Cảnh báo quan trọng"
            description="Offline liên tục 1/2 thời lượng của kế hoạch sẽ khiến kế hoạch thất bại. Hãy đảm bảo cập nhật tiến độ thường xuyên để duy trì kế hoạch của bạn."
          />
        </div>

        {!currentPlan ? (
          // No current plan
          <Card>
            <div className="text-center py-4">
              <ExclamationCircleOutlined
                style={{
                  fontSize: "64px",
                  color: "#faad14",
                  marginBottom: "20px",
                }}
              />
              <Title
                level={3}
                style={{ marginBottom: "20px", color: "#1890ff" }}
              >
                Chưa có kế hoạch cai thuốc
              </Title>
              <Paragraph style={{ fontSize: "16px", marginBottom: "20px" }}>
                Bạn chưa có kế hoạch cai thuốc nào. Hãy bắt đầu hành trình cai
                thuốc của mình bằng cách yêu cầu kế hoạch từ huấn luyện viên.
              </Paragraph>

              <Alert
                type="warning"
                showIcon
                style={{
                  marginBottom: "20px",
                  textAlign: "left",
                  maxWidth: "800px",
                  margin: "0 auto 20px",
                }}
                message="Tính năng dành cho thành viên Premium"
                description={
                  <div>
                    <Paragraph style={{ marginBottom: "8px" }}>
                      Kế hoạch cai thuốc là tính năng dành riêng cho thành viên
                      Premium. Hãy nâng cấp tài khoản của bạn thông qua nút{" "}
                      <strong>"Nâng cấp Premium"</strong> trên thanh điều hướng
                      để được tiếp cận với huấn luyện viên chuyên nghiệp và kế
                      hoạch cai thuốc cá nhân hóa.
                    </Paragraph>
                  </div>
                }
              />

              <Divider />

              <Alert
                message="Khuyến nghị trước khi yêu cầu kế hoạch cai thuốc"
                description={
                  <div>
                    <Paragraph style={{ marginBottom: "8px" }}>
                      Để có kế hoạch cai thuốc phù hợp nhất với tình trạng của
                      bạn, chúng tôi khuyến nghị:
                    </Paragraph>
                    <ul style={{ paddingLeft: "20px", marginBottom: "8px" }}>
                      <li>Đánh giá mức độ nghiện của bạn</li>
                      <li>Tư vấn với huấn luyện viên về mục tiêu cai thuốc</li>
                    </ul>
                    <Paragraph>
                      Sau khi gửi yêu cầu, huấn luyện viên sẽ tạo kế hoạch cai
                      thuốc cá nhân hóa cho bạn dựa trên thông tin sức khỏe và
                      mục tiêu của bạn khi tư vấn.
                    </Paragraph>
                  </div>
                }
                type="info"
                showIcon
                style={{
                  maxWidth: "700px",
                  margin: "0 auto 20px",
                  textAlign: "left",
                }}
              />

              <div
                style={{ width: "100%", maxWidth: "500px", margin: "0 auto" }}
              >
                <Button
                  type="primary"
                  size="large"
                  icon={<PlusOutlined />}
                  danger
                  onClick={() => {
                    Modal.confirm({
                      title: "Xác nhận yêu cầu kế hoạch cai thuốc",
                      content:
                        "Khi gửi yêu cầu, huấn luyện viên sẽ nhận thông báo và tạo kế hoạch cai thuốc cá nhân hóa cho bạn. Bạn sẽ nhận được thông báo khi kế hoạch được tạo.",
                      okText: "Gửi yêu cầu",
                      cancelText: "Hủy",
                      onOk: async () => {
                        try {
                          const response = await requestQuitPlan();
                          if (response.success) {
                            message.success(
                              response.message || "Đã gửi yêu cầu thành công!"
                            );
                            // Cập nhật lại dữ liệu sau khi yêu cầu thành công
                            setTimeout(() => fetchMemberQuitPlanData(), 1000);
                            // Navigate to initial addiction smoking page after successful request
                            setTimeout(() => navigate('/member/initial-addiction-smoking'), 1500);
                          } else {
                            message.error(
                              response.message || "Không thể gửi yêu cầu"
                            );
                          }
                        } catch (error) {
                          message.error(
                            "Có lỗi xảy ra: " +
                              (error.message || "Không thể gửi yêu cầu")
                          );
                        }
                      },
                    });
                  }}
                  style={{
                    width: "100%",
                    marginTop: "20px",
                    height: "50px",
                    fontSize: "16px",
                  }}
                >
                  Yêu cầu kế hoạch cai thuốc ngay
                </Button>

                <Divider style={{ margin: "30px 0 20px" }} />
              </div>
            </div>
          </Card>
        ) : (
          // Current plan exists
          <Row gutter={[16, 16]}>
            {/* Plan Status Card */}
            <Col xs={24}>
              <Card
                title={
                  <Space>
                    <CalendarOutlined />
                    Kế hoạch cai thuốc hiện tại
                    <Tag
                      color={getStatusColor(currentPlan.status)}
                      icon={
                        currentPlan.status === "IN_PROGRESS" ? (
                          <ClockCircleOutlined />
                        ) : currentPlan.status === "COMPLETED" ? (
                          <CheckCircleOutlined />
                        ) : currentPlan.status === "FAILED" ? (
                          <CloseCircleOutlined />
                        ) : currentPlan.status === "PENDING" ? (
                          <ClockCircleOutlined />
                        ) : currentPlan.status === "REJECTED" ? (
                          <CloseCircleOutlined />
                        ) : currentPlan.status === "ACCEPTED" ? (
                          <CheckCircleOutlined />
                        ) : null
                      }
                    >
                      {getStatusText(currentPlan.status)}
                    </Tag>
                  </Space>
                }
                extra={
                  currentPlan.canAccept || currentPlan.canDeny ? (
                    <Space>
                      {currentPlan.canDeny && (
                        <Button
                          danger
                          icon={<CloseCircleOutlined />}
                          onClick={() => handlePlanAction("deny")}
                        >
                          Từ chối
                        </Button>
                      )}
                      {currentPlan.canAccept && (
                        <Button
                          type="primary"
                          icon={<CheckCircleOutlined />}
                          onClick={() => handlePlanAction("accept")}
                        >
                          Chấp nhận kế hoạch
                        </Button>
                      )}
                    </Space>
                  ) : null
                }
              >
                {(currentPlan.canAccept || currentPlan.canDeny) && (
                  <Alert
                    message="Kế hoạch đang chờ phê duyệt"
                    description={
                      <div>
                        <p>
                          Huấn luyện viên{" "}
                          <strong>{currentPlan.coach_name}</strong> đã tạo kế
                          hoạch cai thuốc cá nhân hóa cho bạn.
                        </p>
                        <p>
                          Thời gian thực hiện:{" "}
                          <strong>{currentPlan.durationInDays} ngày</strong>{" "}
                          (Ngày bắt đầu (trong vòng 6 tháng kể từ hôm nay) sẽ
                          được xác định khi bạn chấp nhận kế hoạch)
                        </p>
                        <p>
                          Vui lòng xem xét chi tiết bên dưới và quyết định chấp
                          nhận hoặc yêu cầu thay đổi.
                        </p>
                      </div>
                    }
                    type="warning"
                    showIcon
                    className="mb-4"
                  />
                )}

                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="Ngày bắt đầu">
                        {formatDate(currentPlan.start_date)}
                      </Descriptions.Item>
                      <Descriptions.Item label="Ngày kết thúc dự kiến">
                        {formatDate(currentPlan.end_date)}
                      </Descriptions.Item>
                      <Descriptions.Item label="Thời gian thực hiện">
                        {currentPlan.durationInDays ||
                          moment(currentPlan.end_date).diff(
                            moment(currentPlan.start_date),
                            "days"
                          )}{" "}
                        ngày
                      </Descriptions.Item>
                      <Descriptions.Item label="Huấn luyện viên">
                        <Space>
                          <Avatar
                            src={currentPlan.coach_photo}
                            icon={<UserOutlined />}
                          />
                          {currentPlan.coach_name}
                        </Space>
                      </Descriptions.Item>
                    </Descriptions>
                  </Col>
                  <Col xs={24} md={12}>
                    {(currentPlan.status === "IN_PROGRESS" ||
                      currentPlan.status === "COMPLETED" ||
                      currentPlan.status === "FAILED") && (
                      <div>
                        <Title level={4}>Tiến độ</Title>
                        {(() => {
                          const progress = calculateProgress();
                          return (
                            <>
                              <Progress
                                type="circle"
                                percent={Math.round(progress.percent)}
                                status={progress.status}
                                strokeColor={progress.color}
                                width={120}
                                format={(percent) => `${percent}%`}
                                style={{ marginBottom: "15px" }}
                              />
                              <div className="mt-3">
                                <Statistic
                                  title="Số ngày đã hoàn thành"
                                  value={progress.passedDays}
                                  suffix={`/ ${progress.totalDays}`}
                                />

                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "flex-end",
                                    marginTop: "10px",
                                  }}
                                >
                                  {currentPlan.status === "COMPLETED" && (
                                    <Tag
                                      color={
                                        currentPlan.completionQuality
                                          ?.toLowerCase()
                                          .includes("cải thiện")
                                          ? "orange"
                                          : "green"
                                      }
                                      style={{
                                        fontSize: "11px",
                                        fontWeight: "bold",
                                        padding: "2px 6px",
                                        border: `1px solid ${progress.color}`,
                                        backgroundColor: progress.color,
                                        color: "white",
                                        textShadow: "0 1px 1px rgba(0,0,0,0.2)",
                                        boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                                      }}
                                      icon={<CheckCircleOutlined />}
                                    >
                                      {currentPlan.completionQuality ||
                                        progress.quality ||
                                        "Hoàn thành"}
                                    </Tag>
                                  )}

                                  {currentPlan.status === "FAILED" && (
                                    <Tag
                                      color="red"
                                      style={{
                                        fontSize: "11px",
                                        fontWeight: "bold",
                                        padding: "2px 6px",
                                        border: "1px solid #ad891fff",
                                        backgroundColor: "#ff4d4f",
                                        color: "white",
                                        textShadow: "0 1px 1px rgba(0,0,0,0.2)",
                                        boxShadow:
                                          "0 1px 2px rgba(255,77,79,0.2)",
                                      }}
                                      icon={<CloseCircleOutlined />}
                                    >
                                      Offline quá 1/2 thời lượng kế hoạch
                                    </Tag>
                                  )}
                                </div>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </Col>
                </Row>
              </Card>
            </Col>

            {/* Plan Details */}
            <Col xs={24} lg={16}>
              <Card title="Chi tiết kế hoạch">
                <Descriptions column={1} bordered>
                  <Descriptions.Item label="Chiến lược đối phó">
                    {currentPlan.strategies_to_use}
                  </Descriptions.Item>
                  <Descriptions.Item label="Thuốc hỗ trợ">
                    {currentPlan.medications_to_use ||
                      "Không có thuốc được kê toa"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Hướng dẫn sử dụng thuốc">
                    {currentPlan.medication_instructions}
                  </Descriptions.Item>
                  <Descriptions.Item label="Tình huống kích thích hút thuốc cần tránh">
                    {currentPlan.smoking_triggers_to_avoid}
                  </Descriptions.Item>
                  <Descriptions.Item label="Chiến lược phòng ngừa tái nghiện">
                    {currentPlan.preparation_steps}
                  </Descriptions.Item>
                  <Descriptions.Item label="Nguồn hỗ trợ">
                    {currentPlan.support_resources}
                  </Descriptions.Item>
                  <Descriptions.Item label="Động lực">
                    {currentPlan.motivation}
                  </Descriptions.Item>
                  <Descriptions.Item label="Kế hoạch thưởng">
                    {currentPlan.reward_plan}
                  </Descriptions.Item>
                  <Descriptions.Item label="Tình trạng hút thuốc hiện tại">
                    <Tag
                      color={
                        currentPlan.current_smoking_status === "NONE"
                          ? "green"
                          : "orange"
                      }
                    >
                      {currentPlan.current_smoking_status === "NONE"
                        ? "Không hút thuốc"
                        : currentPlan.current_smoking_status || "Chưa xác định"}
                    </Tag>
                  </Descriptions.Item>
                  {currentPlan.note && (
                    <Descriptions.Item label="Ghi chú bổ sung">
                      {currentPlan.note}
                    </Descriptions.Item>
                  )}
                </Descriptions>

                {planPhases.length > 0 && (
                  <>
                    <Divider />
                    <Title level={4}>
                      <FlagOutlined /> Các giai đoạn thực hiện
                    </Title>
                    <div className="phases-container">
                      {planPhases.map((phase, index) => (
                        <Card
                          key={phase.id}
                          size="small"
                          className="mb-3"
                          title={
                            <Space>
                              <Tag color="blue">
                                Giai đoạn {phase.phaseOrder}
                              </Tag>
                              {phase.name}
                            </Space>
                          }
                        >
                          <Row gutter={[16, 16]}>
                            <Col xs={24} md={12}>
                              <div>
                                <Text strong>Thời gian:</Text>
                                <br />
                                <Text>{phase.duration}</Text>
                              </div>
                              <Divider
                                type="vertical"
                                style={{ height: "auto", margin: "8px 0" }}
                              />
                              <div>
                                <Text strong>Mục tiêu khuyến nghị:</Text>
                                <br />
                                <Text>{phase.recommendGoal}</Text>
                              </div>
                            </Col>
                            <Col xs={24} md={12}>
                              <div>
                                <Text strong>Mục tiêu cụ thể:</Text>
                                {phase.goals &&
                                Array.isArray(phase.goals) &&
                                phase.goals.length > 0 ? (
                                  <ul style={{ marginTop: 8, paddingLeft: 16 }}>
                                    {phase.goals.map((goal, goalIndex) => (
                                      <li key={goalIndex}>
                                        <Text>{goal}</Text>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <div style={{ marginTop: 8 }}>
                                    <Text type="secondary" italic>
                                      Chưa có mục tiêu cụ thể
                                    </Text>
                                  </div>
                                )}
                              </div>
                            </Col>
                          </Row>
                        </Card>
                      ))}
                    </div>
                  </>
                )}
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Card title="Thao tác nhanh">
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Button
                    block
                    icon={<CheckCircleOutlined />}
                    onClick={() =>
                      (window.location.href = "/member/daily-record")
                    }
                  >
                    Báo cáo hàng ngày
                  </Button>
                  <Button
                    block
                    icon={<MessageOutlined />}
                    onClick={() => (window.location.href = "/member/chat")}
                  >
                    Nhắn tin với huấn luyện viên
                  </Button>
                  <Button
                    block
                    icon={<TrophyOutlined />}
                    onClick={() =>
                      (window.location.href = "/member/smoking-status")
                    }
                  >
                    Xem tiến độ
                  </Button>
                </Space>
              </Card>

              {currentPlan.status === "IN_PROGRESS" && (
                <Card title="Động lực" className="mt-4">
                  <div className="text-center">
                    <FireOutlined
                      style={{ fontSize: "32px", color: "#ff4d4f" }}
                    />
                    <Title level={4}>Tiếp tục cố gắng!</Title>
                    <Paragraph>
                      Mỗi ngày không hút thuốc là một chiến thắng. Bạn đang làm
                      rất tốt!
                    </Paragraph>
                  </div>
                </Card>
              )}

              {/* Add "Request Plan" for completed or failed plans */}
              {(currentPlan.status === "COMPLETED" ||
                currentPlan.status === "FAILED") && (
                <Card title="Kế hoạch tiếp theo" className="mt-4">
                  <div className="text-center">
                    {currentPlan.status === "COMPLETED" ? (
                      <>
                        <CheckCircleOutlined
                          style={{ fontSize: "32px", color: "#52c41a" }}
                        />
                        <Title level={4}>Chúc mừng bạn đã hoàn thành!</Title>

                        {currentPlan.finalEvaluation ? (
                          <>
                            <Alert
                              message="Đánh giá cuối cùng của huấn luyện viên"
                              description={currentPlan.finalEvaluation}
                              type="success"
                              showIcon
                              style={{
                                textAlign: "left",
                                marginBottom: "16px",
                              }}
                            />
                          </>
                        ) : (
                          <Paragraph>
                            Đang chờ huấn luyện viên {currentPlan.coach_name}{" "}
                            đánh giá cuối cùng về kế hoạch cai thuốc của bạn.
                          </Paragraph>
                        )}
                      </>
                    ) : (
                      <>
                        <ExclamationCircleOutlined
                          style={{ fontSize: "32px", color: "#ff4d4f" }}
                        />
                        <Title level={4}>Không sao, hãy thử lại!</Title>
                        <Paragraph>
                          Cai thuốc là một hành trình khó khăn. Đừng nản lòng,
                          hãy rút kinh nghiệm và thử lại với kế hoạch mới.
                        </Paragraph>
                      </>
                    )}
                    <Divider />
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        Modal.confirm({
                          title: "Xác nhận yêu cầu kế hoạch cai thuốc mới",
                          content:
                            "Khi gửi yêu cầu, huấn luyện viên sẽ nhận thông báo và tạo kế hoạch cai thuốc cá nhân hóa mới cho bạn.",
                          okText: "Gửi yêu cầu",
                          cancelText: "Hủy",
                          onOk: async () => {
                            try {
                              const response = await requestQuitPlan();
                              if (response.success) {
                                message.success(
                                  response.message ||
                                    "Đã gửi yêu cầu kế hoạch mới thành công!"
                                );
                              } else {
                                message.error(
                                  response.message || "Không thể gửi yêu cầu"
                                );
                              }
                            } catch (error) {
                              message.error(
                                "Có lỗi xảy ra: " +
                                  (error.message || "Không thể gửi yêu cầu")
                              );
                            }
                          },
                        });
                      }}
                    >
                      Yêu cầu kế hoạch mới
                    </Button>
                  </div>
                </Card>
              )}
            </Col>
          </Row>
        )}
        <Modal
          title={
            <Space>
              {actionType === "accept" ? (
                <CheckCircleOutlined />
              ) : (
                <CloseCircleOutlined />
              )}
              {actionType === "accept"
                ? "Chấp nhận kế hoạch"
                : "Từ chối kế hoạch"}
            </Space>
          }
          open={actionModalVisible}
          onCancel={() => setActionModalVisible(false)}
          onOk={submitPlanAction}
          confirmLoading={submitting}
          okText={
            actionType === "accept" ? "Chấp nhận kế hoạch" : "Từ chối kế hoạch"
          }
          okButtonProps={{
            type: actionType === "accept" ? "primary" : "danger",
          }}
        >
          <Alert
            message={
              actionType === "accept"
                ? "Xác nhận chấp nhận kế hoạch"
                : "Xác nhận từ chối kế hoạch"
            }
            description={
              actionType === "accept"
                ? "Bằng cách chấp nhận kế hoạch này, bạn cam kết sẽ thực hiện các chiến lược và lịch trình do huấn luyện viên của bạn đặt ra. Bạn đã sẵn sàng bắt đầu hành trình cai thuốc?"
                : "Từ chối kế hoạch này sẽ thông báo cho huấn luyện viên của bạn tạo kế hoạch mới. Điều này có thể làm trì hoãn việc bắt đầu hành trình cai thuốc của bạn."
            }
            type={actionType === "accept" ? "success" : "warning"}
            showIcon
            style={{ marginBottom: "16px" }}
          />

          {actionType === "accept" && (
            <div>
              <Form.Item
                label="Ngày bắt đầu"
                help={
                  dateError || "Chọn ngày bạn muốn bắt đầu kế hoạch cai thuốc"
                }
                validateStatus={dateError ? "error" : ""}
                style={{ marginBottom: "0" }}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  value={selectedDateObj}
                  onChange={(date) => {
                    setSelectedDateObj(date);

                    // Validate the date
                    if (!date) {
                      setDateError("Vui lòng chọn ngày bắt đầu");
                      setStartDate(null);
                      return;
                    }

                    if (!date.isValid()) {
                      setDateError("Định dạng ngày không hợp lệ");
                      setStartDate(null);
                      return;
                    }

                    const today = moment().startOf("day");
                    if (date.isBefore(today)) {
                      setDateError(
                        "Ngày bắt đầu không thể là ngày trong quá khứ"
                      );
                      return;
                    }

                    const sixMonthsLater = moment().add(6, "months");
                    if (date.isAfter(sixMonthsLater)) {
                      setDateError(
                        "Ngày bắt đầu không thể xa hơn 6 tháng từ hôm nay"
                      );
                      return;
                    }

                    // Clear error and set date if valid
                    setDateError("");
                    setStartDate(date.format("YYYY-MM-DD"));
                  }}
                  disabledDate={(current) => {
                    // Can't select days before today or after 6 months
                    return (
                      current &&
                      (current < moment().startOf("day") ||
                        current > moment().add(6, "months"))
                    );
                  }}
                  placeholder="Chọn ngày bắt đầu"
                  inputReadOnly={true}
                />
              </Form.Item>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default MemberQuitPlanFlow;
