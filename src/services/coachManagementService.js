// Create a new service file for coach management
export const getAllCoaches = (params = {}) => {
  // In a real app, this would call an API with the filters
  const mockCoaches = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      specialty: 'Behavioral Psychology',
      qualification: 'Ph.D in Clinical Psychology',
      rating: 4.8,
      active_members: 18,
      success_rate: 92,
      status: 'Active',
      joined: '2025-01-15',
      photo_url: 'https://randomuser.me/api/portraits/women/45.jpg',
      email: 'sarah.johnson@example.com',
      phone: '0901234567'
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      specialty: 'Addiction Medicine',
      qualification: 'MD, Certified in Addiction Medicine',
      rating: 4.6,
      active_members: 15,
      success_rate: 86,
      status: 'Active',
      joined: '2025-02-20',
      photo_url: 'https://randomuser.me/api/portraits/men/42.jpg',
      email: 'michael.chen@example.com',
      phone: '0901234568'
    },
    {
      id: 3,
      name: 'Dr. James Wilson',
      specialty: 'Clinical Psychology',
      qualification: 'Ph.D in Psychology',
      rating: 4.7,
      active_members: 12,
      success_rate: 89,
      status: 'Active',
      joined: '2025-03-10',
      photo_url: 'https://randomuser.me/api/portraits/men/32.jpg',
      email: 'james.wilson@example.com',
      phone: '0901234569'
    },
    {
      id: 4,
      name: 'Nguyễn Thị Hương',
      specialty: 'Health Psychology',
      qualification: 'M.Sc in Health Psychology',
      rating: 4.7,
      active_members: 10,
      success_rate: 85,
      status: 'Active',
      joined: '2025-04-05',
      photo_url: 'https://randomuser.me/api/portraits/women/32.jpg',
      email: 'huong.nguyen@example.com',
      phone: '0901234570'
    },
    {
      id: 5,
      name: 'Dr. Robert Chen',
      specialty: 'Behavioral Therapy',
      qualification: 'Ph.D in Behavioral Science',
      rating: 4.8,
      active_members: 14,
      success_rate: 91,
      status: 'Inactive',
      joined: '2025-02-15',
      photo_url: 'https://randomuser.me/api/portraits/men/22.jpg',
      email: 'robert.chen@example.com',
      phone: '0901234571'
    }
  ];
  
  let filteredCoaches = [...mockCoaches];
  
  // Apply search filter
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filteredCoaches = filteredCoaches.filter(coach => 
      coach.name.toLowerCase().includes(searchLower) || 
      coach.specialty.toLowerCase().includes(searchLower) ||
      coach.email.toLowerCase().includes(searchLower)
    );
  }
  
  // Apply status filter
  if (params.status && params.status !== 'All') {
    filteredCoaches = filteredCoaches.filter(coach => coach.status === params.status);
  }
  
  // Apply specialty filter
  if (params.specialty && params.specialty !== 'All') {
    filteredCoaches = filteredCoaches.filter(coach => coach.specialty === params.specialty);
  }
  
  return {
    total: filteredCoaches.length,
    data: filteredCoaches
  };
};

export const getCoachSpecialties = () => {
  return [
    'Behavioral Psychology',
    'Addiction Medicine',
    'Clinical Psychology',
    'Health Psychology',
    'Behavioral Therapy'
  ];
};

export const createCoach = (coachData) => {
  console.log('Creating coach with data:', coachData);
  // In a real app, this would make an API call
  return {
    success: true,
    message: 'Coach created successfully',
    coach: {
      id: Math.floor(Math.random() * 1000) + 11,
      ...coachData,
      rating: 0,
      active_members: 0,
      success_rate: 0,
      joined: new Date().toISOString().split('T')[0],
      photo_url: 'https://randomuser.me/api/portraits/lego/1.jpg'
    }
  };
};

export const updateCoach = (coachId, coachData) => {
  console.log(`Updating coach ${coachId} with data:`, coachData);
  // In a real app, this would make an API call
  return {
    success: true,
    message: 'Coach updated successfully',
    coach: {
      id: coachId,
      ...coachData
    }
  };
};

export const deleteCoach = (coachId) => {
  console.log(`Deleting coach ${coachId}`);
  // In a real app, this would make an API call
  return {
    success: true,
    message: 'Coach deleted successfully'
  };
};