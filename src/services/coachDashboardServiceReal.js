import { getAssignedMembers, getCoachProfile } from './coachManagementService';
import { getNewestQuitPlan } from './quitPlanService';
import { getLatestMemberSmokingStatus } from './memberSmokingStatusService';
import { getUnansweredQna } from './askQuestionService';
import { getFeedbacksForCoach } from './feebackService';

/**
 * Real Coach Dashboard Service using actual API endpoints
 */

// Get enhanced coach profile with statistics
export const getEnhancedCoachProfile = async (coachId) => {
  try {
    const profileResponse = await getCoachProfile(coachId);
    if (profileResponse.success) {
      return {
        success: true,
        data: profileResponse.data
      };
    }
    return { success: false, message: 'Failed to fetch coach profile' };
  } catch (error) {
    console.error('Error fetching coach profile:', error);
    return { success: false, message: error.message };
  }
};

// Get assigned members with enhanced data (quit plans, status, progress)
export const getEnhancedAssignedMembers = async (coachId) => {
  try {
    const membersResponse = await getAssignedMembers(coachId);
    if (!membersResponse.success) {
      return { success: false, message: 'Failed to fetch assigned members' };
    }

    const members = membersResponse.data || [];
    
    // Enhance each member with quit plan and status data
    const enhancedMembers = await Promise.all(
      members.map(async (member) => {
        try {
          let quitPlan = null;
          let memberStatus = null;
          let progress = 0;
          let daysSmokeFree = 0;
          let currentPhase = 'No Plan';
          
          // Get member's newest quit plan
          if (member.planId) {
            const planResponse = await getNewestQuitPlan(member.memberId);
            if (planResponse.success) {
              quitPlan = planResponse.data;
              currentPhase = quitPlan.status || 'Active';
              
              // Calculate progress based on start date and current date
              const startDate = new Date(quitPlan.start_date);
              const endDate = new Date(quitPlan.end_date);
              const now = new Date();
              const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
              const elapsedDays = Math.ceil((now - startDate) / (1000 * 60 * 60 * 24));
              progress = Math.min(Math.max((elapsedDays / totalDays) * 100, 0), 100);
            }
          }

          // Get member's smoking status
          if (member.initialStatusId) {
            const statusResponse = await getLatestMemberSmokingStatus(member.memberId);
            if (statusResponse.success) {
              memberStatus = statusResponse.data;
              
              // Calculate days smoke free if quit plan is active
              if (quitPlan && quitPlan.status === 'ACTIVE') {
                const quitDate = new Date(quitPlan.start_date);
                const now = new Date();
                daysSmokeFree = Math.max(0, Math.ceil((now - quitDate) / (1000 * 60 * 60 * 24)));
              }
            }
          }

          return {
            user_id: member.memberId,
            full_name: member.name,
            email: member.email,
            photo_url: member.profilePicture,
            current_phase: currentPhase,
            progress: Math.round(progress),
            days_smoke_free: daysSmokeFree,
            last_checkin: quitPlan ? new Date(quitPlan.updated_at || quitPlan.created_at).toLocaleDateString() : 'N/A',
            status: quitPlan?.status === 'ACTIVE',
            quit_plan: quitPlan,
            smoking_status: memberStatus
          };
        } catch (error) {
          console.warn(`Failed to fetch data for member ${member.memberId}:`, error);
          return {
            user_id: member.memberId,
            full_name: member.name,
            email: member.email,
            photo_url: member.profilePicture,
            current_phase: 'No Plan',
            progress: 0,
            days_smoke_free: 0,
            last_checkin: 'N/A',
            status: false
          };
        }
      })
    );

    return {
      success: true,
      data: enhancedMembers
    };
  } catch (error) {
    console.error('Error fetching enhanced assigned members:', error);
    return { success: false, message: error.message };
  }
};

// Get performance metrics from member data
export const getCoachPerformanceMetrics = (members) => {
  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.status).length;
  const completedMembers = members.filter(m => m.current_phase === 'COMPLETED').length;
  
  return {
    total_members: totalMembers,
    active_members: activeMembers,
    completed_successfully: completedMembers,
    success_rate: totalMembers > 0 ? Math.round((completedMembers / totalMembers) * 100) : 0
  };
};

// Get unanswered questions for coach
export const getCoachUnansweredQuestions = async (pageNo = 0, pageSize = 10) => {
  try {
    const response = await getUnansweredQna(pageNo, pageSize);
    return response;
  } catch (error) {
    console.error('Error fetching unanswered questions:', error);
    return { success: false, message: error.message, data: { content: [] } };
  }
};

// Get coach feedback
export const getCoachRecentFeedback = async (coachId) => {
  try {
    const response = await getFeedbacksForCoach(coachId);
    return response;
  } catch (error) {
    console.error('Error fetching coach feedback:', error);
    return { success: false, message: error.message, data: [] };
  }
};

// Get complete coach dashboard data
export const getCoachDashboardData = async (coachId) => {
  try {
    const [
      profileResponse,
      membersResponse,
      questionsResponse,
      feedbackResponse
    ] = await Promise.all([
      getEnhancedCoachProfile(coachId),
      getEnhancedAssignedMembers(coachId),
      getCoachUnansweredQuestions(0, 10),
      getCoachRecentFeedback(coachId)
    ]);

    const members = membersResponse.success ? membersResponse.data : [];
    const performanceMetrics = getCoachPerformanceMetrics(members);

    return {
      success: true,
      data: {
        profile: profileResponse.success ? profileResponse.data : null,
        members: members,
        questions: questionsResponse.success ? questionsResponse.data.content || [] : [],
        feedback: feedbackResponse.success ? feedbackResponse.data || [] : [],
        metrics: performanceMetrics
      }
    };
  } catch (error) {
    console.error('Error fetching coach dashboard data:', error);
    return { success: false, message: error.message };
  }
};
