# Quit Plan API Integration Guide

## Overview
This document outlines the proper integration of quit plan APIs according to the updated flow and role-based responsibilities.

## API Flow Summary

### **Member Flow:**
1. **Initial Setup**
   - Complete initial smoking status: `POST /api/member-smoking-status`
   - Choose a coach: `POST /coach/choose`

2. **Plan Management**
   - View newest plan: `GET /api/quit-plans/newest?memberId={memberId}`
   - Accept plan: `PATCH /api/quit-plans/accept?planId={planId}`
   - Deny plan: `PATCH /api/quit-plans/deny?planId={planId}`
   - View plan history: `GET /api/quit-plans/olds?memberId={memberId}`

3. **Daily Tracking**
   - Create daily log: `POST /api/daily-logs`
   - View phase progress: `GET /api/quit-phases/from-plan?quitPlanId={planId}`
   - View logs by phase: `GET /api/daily-logs/byPhase?phaseId={phaseId}`

### **Coach Flow:**
1. **Member Management**
   - View assigned members: `GET /coach/assigned-members?coachId={coachId}`
   - Get member's smoking status: `GET /api/member-smoking-status/latest?memberId={memberId}`

2. **Plan Creation**
   - Get default phases: `GET /api/quit-phases/default?addictionLevel={level}`
   - Create plan: `POST /api/quit-plans/create?memberId={memberId}`
   - Create phase goals: `POST /api/quit-phases/default/create-goals?quitPlanId={planId}`

3. **Plan Management**
   - Update plan: `PUT /api/quit-plans/update?planId={planId}`
   - Finish plan: `PATCH /api/quit-plans/finish?planId={planId}`
   - Disable plan: `PATCH /api/quit-plans/disable?planId={planId}`

## Component Updates

### **New Components Created:**

1. **`MemberQuitPlanFlow.jsx`**
   - Replaces member-initiated plan creation
   - Shows current plan status and allows accept/deny
   - Displays plan history and progress
   - **Route:** `/member/quit-plan-flow`

2. **`QuitPlanApprovalNewFlow.jsx`**
   - Coach view of assigned members
   - Create plans for members who don't have one
   - Manage existing plans (accept, deny, update, finish)
   - **Route:** `/coach/member-management`

### **Updated Components:**

1. **`QuitPlanCreation.jsx`**
   - Now shows preference collection message
   - No longer directly creates plans (coach responsibility)
   - Informs user that coach will create the plan

2. **`quitPlanService.js`**
   - Added proper API endpoint mappings
   - Added missing functions for plan management
   - Added backward compatibility aliases

## Key Changes from Original Flow

### **What Changed:**
- **Members cannot directly create quit plans** - Only coaches can create plans
- **Plan approval flow** - Members accept/deny plans created by coaches
- **Phase management** - Coaches create goals for default phases
- **Member initial status** - Required before plan creation

### **Benefits:**
- **Better clinical oversight** - Coaches review member status before creating plans
- **Personalized plans** - Based on addiction level and member preferences
- **Proper approval workflow** - Members can accept/deny and request changes
- **Phase-based tracking** - Structured progress through quit phases

## Implementation Notes

### **Missing API Endpoints:**
- No direct "get plan by ID" endpoint
- No "get plans created by coach" endpoint
- Using `getNewestQuitPlan` and `getOldPlansOfMember` as alternatives

### **Workarounds Implemented:**
- Mock data for plan details when direct ID lookup isn't available
- Coach plan management through assigned members list
- Preference collection for member-initiated requests

### **Recommended Backend Updates:**
1. Add `GET /api/quit-plans/{planId}` for direct plan lookup
2. Add `GET /api/quit-plans/coach/{coachId}` for coach's created plans
3. Add member preference storage for plan creation requests
4. Add notification system for coach-member communication

## Usage Examples

### **Member accepting a plan:**
```javascript
import { acceptQuitPlan } from '../../services/quitPlanService';

const handleAcceptPlan = async (planId) => {
  try {
    const response = await acceptQuitPlan(planId);
    if (response.success) {
      message.success('Plan accepted! Your quit journey begins now.');
    }
  } catch (error) {
    message.error('Failed to accept plan');
  }
};
```

### **Coach creating a plan:**
```javascript
import { createQuitPlan, getDefaultPhases, createGoalsOfPhases } from '../../services/quitPlanService';

const handleCreatePlan = async (memberId, planData) => {
  try {
    // Get default phases
    const phasesResponse = await getDefaultPhases(memberStatus.addictionLevel);
    
    // Create plan
    const planResponse = await createQuitPlan(memberId, planData);
    
    // Create phase goals
    await createGoalsOfPhases(planResponse.data.planId, phasesWithGoals);
    
    message.success('Plan created successfully!');
  } catch (error) {
    message.error('Failed to create plan');
  }
};
```

This integration ensures proper role separation and follows the clinical workflow where coaches have oversight of the quit plan creation and management process.
