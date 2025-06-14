// Mock data for blog posts
const mockBlogPosts = [
  {
    post_id: 1,
    title: "The Benefits of Quitting Smoking: What to Expect in the First Year",
    post_content: `<p>When you quit smoking, your body begins a series of transformations that can improve your health dramatically. Here's what you can expect during your first year of being smoke-free:</p>
    <h2>Within 20 minutes</h2>
    <p>Your heart rate and blood pressure drop to normal levels. The temperature of your hands and feet increases to normal.</p>
    <h2>After 8 hours</h2>
    <p>Carbon monoxide levels in your blood drop to normal, and oxygen levels increase to normal.</p>
    <h2>After 24 hours</h2>
    <p>Your chance of a heart attack decreases.</p>
    <h2>After 48 hours</h2>
    <p>Nerve endings start to regrow, and your ability to smell and taste improves.</p>
    <h2>After 2 weeks to 3 months</h2>
    <p>Your circulation improves, walking becomes easier, and your lung function increases up to 30%.</p>
    <h2>After 1 to 9 months</h2>
    <p>Coughing, sinus congestion, fatigue, and shortness of breath decrease. Cilia regrow in your lungs, increasing the ability to handle mucus, clean the lungs, and reduce infection.</p>
    <h2>After 1 year</h2>
    <p>Your risk of coronary heart disease is half that of a smoker's.</p>`,
    attached_image: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1452&q=80",
    created_date: "2023-05-10T09:00:00Z",
    author_id: 1,
    author: {
      user_id: 1,
      full_name: "Dr. Sarah Johnson",
      bio: "Pulmonologist with 15 years of experience helping patients quit smoking"
    },
    categories: [
      { id: 1, name: "Health Benefits" },
      { id: 2, name: "Motivation" }
    ],
    is_featured: true,
    views: 1250
  },
  {
    post_id: 2,
    title: "Managing Nicotine Withdrawal Symptoms: Practical Tips",
    post_content: `<p>Nicotine withdrawal can be challenging, but with the right strategies, you can manage the symptoms effectively.</p>
    <h2>Understanding Nicotine Withdrawal</h2>
    <p>When you quit smoking, your body must adjust to the absence of nicotine. This adjustment period can lead to various withdrawal symptoms, including irritability, anxiety, difficulty concentrating, increased appetite, and intense cravings.</p>
    <h2>Tips for Managing Withdrawal</h2>
    <ul>
      <li><strong>Stay hydrated:</strong> Drinking plenty of water helps flush toxins from your body and can reduce the intensity of cravings.</li>
      <li><strong>Exercise regularly:</strong> Physical activity releases endorphins, which can improve your mood and reduce stress.</li>
      <li><strong>Get enough sleep:</strong> Fatigue can worsen withdrawal symptoms, so aim for 7-9 hours of sleep each night.</li>
      <li><strong>Practice deep breathing:</strong> When cravings hit, take slow, deep breaths to calm your mind and body.</li>
      <li><strong>Consider nicotine replacement therapy:</strong> Nicotine patches, gum, or lozenges can help reduce withdrawal symptoms.</li>
    </ul>
    <h2>When to Seek Help</h2>
    <p>If withdrawal symptoms become overwhelming or if you experience severe anxiety or depression, consult a healthcare professional. They can provide additional support and resources.</p>`,
    attached_image: "https://images.unsplash.com/photo-1493836512294-502baa1986e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    created_date: "2023-05-20T14:30:00Z",
    author_id: 2,
    author: {
      user_id: 2,
      full_name: "Michael Chen, PhD",
      bio: "Clinical psychologist specializing in addiction treatment"
    },
    categories: [
      { id: 3, name: "Withdrawal Management" },
      { id: 4, name: "Tips & Strategies" }
    ],
    is_featured: true,
    views: 980
  },
  {
    post_id: 3,
    title: "The Psychology of Smoking: Understanding Your Triggers",
    post_content: `<p>Understanding the psychological aspects of smoking addiction is crucial for successful cessation.</p>
    <h2>Common Smoking Triggers</h2>
    <p>Smoking triggers are situations, emotions, or activities that make you want to smoke. Common triggers include:</p>
    <ul>
      <li><strong>Stress:</strong> Many people smoke to cope with stress or anxiety.</li>
      <li><strong>Social situations:</strong> Being around other smokers or in social settings where you used to smoke.</li>
      <li><strong>After meals:</strong> The habit of having a cigarette after eating.</li>
      <li><strong>Alcohol consumption:</strong> Drinking often triggers smoking urges.</li>
      <li><strong>Boredom:</strong> Some people smoke simply to have something to do.</li>
    </ul>
    <h2>Identifying Your Personal Triggers</h2>
    <p>Keep a smoking journal for a week before quitting. Note when you smoke, what you're doing, who you're with, and how you feel. This will help you identify your specific triggers.</p>
    <h2>Developing Coping Strategies</h2>
    <p>Once you know your triggers, you can develop strategies to manage them:</p>
    <ul>
      <li><strong>For stress:</strong> Practice deep breathing, meditation, or progressive muscle relaxation.</li>
      <li><strong>For social situations:</strong> Plan responses to offers of cigarettes and consider temporarily avoiding triggering social settings.</li>
      <li><strong>For after-meal cravings:</strong> Immediately brush your teeth, go for a walk, or call a friend.</li>
      <li><strong>For alcohol:</strong> Consider limiting alcohol while you're quitting smoking.</li>
      <li><strong>For boredom:</strong> Have a list of activities ready to distract yourself.</li>
    </ul>`,
    attached_image: "https://images.unsplash.com/photo-1499728603263-13726abce5fd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    created_date: "2023-06-05T11:15:00Z",
    author_id: 2,
    author: {
      user_id: 2,
      full_name: "Michael Chen, PhD",
      bio: "Clinical psychologist specializing in addiction treatment"
    },
    categories: [
      { id: 5, name: "Psychology" },
      { id: 6, name: "Behavior Change" }
    ],
    is_featured: false,
    views: 820
  },
  {
    post_id: 4,
    title: "Nutrition Tips for Ex-Smokers: Boosting Recovery and Preventing Weight Gain",
    post_content: `<p>Proper nutrition can help your body recover from smoking damage and prevent the weight gain that sometimes accompanies smoking cessation.</p>
    <h2>Foods That Support Lung Recovery</h2>
    <p>Certain foods can help your lungs heal and regenerate:</p>
    <ul>
      <li><strong>Fruits and vegetables:</strong> Rich in antioxidants that help repair damaged cells. Focus on colorful options like berries, citrus fruits, carrots, and leafy greens.</li>
      <li><strong>Omega-3 fatty acids:</strong> Found in fatty fish, walnuts, and flaxseeds, these can help reduce inflammation in the lungs.</li>
      <li><strong>Whole grains:</strong> Provide B vitamins that help your body produce energy and support cellular repair.</li>
      <li><strong>Garlic and onions:</strong> Contain compounds that may help protect the lungs from infection.</li>
    </ul>
    <h2>Managing Weight During Cessation</h2>
    <p>Many people gain weight when quitting smoking due to increased appetite and metabolism changes. Here's how to manage it:</p>
    <ul>
      <li><strong>Plan healthy snacks:</strong> Keep cut vegetables, fruits, and nuts handy for when cravings strike.</li>
      <li><strong>Stay hydrated:</strong> Sometimes thirst is mistaken for hunger. Drink water before reaching for a snack.</li>
      <li><strong>Control portions:</strong> Use smaller plates and be mindful of serving sizes.</li>
      <li><strong>Include protein:</strong> Protein helps you feel fuller longer. Include lean sources like chicken, fish, beans, or tofu at each meal.</li>
      <li><strong>Be mindful of substitute habits:</strong> Avoid replacing cigarettes with high-calorie foods or excessive snacking.</li>
    </ul>
    <h2>Vitamin Supplementation</h2>
    <p>Consider talking to your healthcare provider about these supplements:</p>
    <ul>
      <li><strong>Vitamin C:</strong> Smokers typically have lower levels of vitamin C, which is important for immune function and tissue repair.</li>
      <li><strong>Vitamin D:</strong> Supports immune function and may help protect lung tissue.</li>
      <li><strong>B vitamins:</strong> Help your body deal with stress and support energy production.</li>
    </ul>`,
    attached_image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    created_date: "2023-06-20T08:45:00Z",
    author_id: 3,
    author: {
      user_id: 3,
      full_name: "Emma Rodriguez, RD",
      bio: "Registered dietitian focusing on nutrition for smoking cessation and recovery"
    },
    categories: [
      { id: 7, name: "Nutrition" },
      { id: 8, name: "Recovery" }
    ],
    is_featured: true,
    views: 1050
  },
  {
    post_id: 5,
    title: "How to Build a Strong Support System for Quitting Smoking",
    post_content: `<p>Having a reliable support system significantly increases your chances of successfully quitting smoking.</p>
    <h2>The Importance of Support</h2>
    <p>Research shows that smokers who have strong social support are more likely to quit successfully and less likely to relapse. A good support system can provide encouragement, accountability, and practical help during difficult moments.</p>
    <h2>Types of Support to Consider</h2>
    <h3>1. Personal Support Network</h3>
    <ul>
      <li><strong>Family and friends:</strong> Let your close circle know about your quit plan and how they can help.</li>
      <li><strong>Quit buddy:</strong> Find someone who is also trying to quit or has successfully quit smoking.</li>
      <li><strong>Online communities:</strong> Join forums or social media groups focused on smoking cessation.</li>
    </ul>
    <h3>2. Professional Support</h3>
    <ul>
      <li><strong>Healthcare providers:</strong> Your doctor can provide medication, advice, and referrals.</li>
      <li><strong>Counseling:</strong> Individual or group therapy can address psychological aspects of addiction.</li>
      <li><strong>Quitlines:</strong> Many countries offer free telephone counseling for smokers.</li>
    </ul>
    <h3>3. Support Programs</h3>
    <ul>
      <li><strong>Smoking cessation programs:</strong> Structured programs offered by hospitals, community centers, or online.</li>
      <li><strong>Support groups:</strong> Meeting regularly with others who are quitting can provide motivation and tips.</li>
      <li><strong>Mobile apps:</strong> Apps can track progress, provide encouragement, and connect you with others.</li>
    </ul>
    <h2>How to Ask for the Right Support</h2>
    <p>Be specific about what you need from each person in your support network:</p>
    <ul>
      <li>"Please don't smoke around me for the first month."</li>
      <li>"Can you check in with me daily for the first week?"</li>
      <li>"I'd appreciate if you could suggest activities that don't involve smoking when we hang out."</li>
      <li>"Would you be willing to be my emergency contact when I have strong cravings?"</li>
    </ul>`,
    attached_image: "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    created_date: "2023-07-10T13:20:00Z",
    author_id: 4,
    author: {
      user_id: 4,
      full_name: "James Wilson",
      bio: "Former smoker and cessation counselor with 10 years of experience"
    },
    categories: [
      { id: 9, name: "Support Systems" },
      { id: 4, name: "Tips & Strategies" }
    ],
    is_featured: false,
    views: 765
  }
];

// Mock categories data
const mockCategories = [
  { id: 1, name: "Health Benefits", post_count: 8 },
  { id: 2, name: "Motivation", post_count: 12 },
  { id: 3, name: "Withdrawal Management", post_count: 6 },
  { id: 4, name: "Tips & Strategies", post_count: 15 },
  { id: 5, name: "Psychology", post_count: 7 },
  { id: 6, name: "Behavior Change", post_count: 9 },
  { id: 7, name: "Nutrition", post_count: 4 },
  { id: 8, name: "Recovery", post_count: 5 },
  { id: 9, name: "Support Systems", post_count: 6 }
];

// Get all blog posts with optional filtering
export const getAllBlogPosts = async (params = {}) => {
  const { 
    search = '', 
    categoryId = null, 
    authorId = null, 
    featured = false,
    page = 1,
    limit = 10,
    sortBy = 'created_date',
    sortOrder = 'desc'
  } = params;

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // Filter posts based on params
  let filteredPosts = [...mockBlogPosts];

  // Filter by search query
  if (search) {
    const searchLower = search.toLowerCase();
    filteredPosts = filteredPosts.filter(post => 
      post.title.toLowerCase().includes(searchLower) || 
      post.post_content.toLowerCase().includes(searchLower)
    );
  }

  // Filter by category
  if (categoryId) {
    filteredPosts = filteredPosts.filter(post => 
      post.categories.some(cat => cat.id === parseInt(categoryId))
    );
  }

  // Filter by author
  if (authorId) {
    filteredPosts = filteredPosts.filter(post => 
      post.author_id === parseInt(authorId)
    );
  }

  // Filter by featured status
  if (featured) {
    filteredPosts = filteredPosts.filter(post => post.is_featured);
  }

  // Sort posts
  filteredPosts.sort((a, b) => {
    if (sortOrder === 'asc') {
      return a[sortBy] > b[sortBy] ? 1 : -1;
    } else {
      return a[sortBy] < b[sortBy] ? 1 : -1;
    }
  });

  // Paginate results
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

  return {
    posts: paginatedPosts,
    total: filteredPosts.length,
    page,
    limit,
    totalPages: Math.ceil(filteredPosts.length / limit)
  };
};

// Get a single blog post by ID
export const getBlogPostById = async (id) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 600));

  const post = mockBlogPosts.find(post => post.post_id === parseInt(id));
  
  if (!post) {
    throw new Error('Blog post not found');
  }
  
  return post;
};

// Get featured blog posts
export const getFeaturedBlogPosts = async (limit = 3) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const featuredPosts = mockBlogPosts
    .filter(post => post.is_featured)
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
    
  return featuredPosts;
};

// Get popular blog posts
export const getPopularBlogPosts = async (limit = 5) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const popularPosts = [...mockBlogPosts]
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
    
  return popularPosts;
};

// Get related blog posts
export const getRelatedBlogPosts = async (currentPostId, categories = [], limit = 3) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 700));

  // Filter out the current post
  const otherPosts = mockBlogPosts.filter(post => post.post_id !== parseInt(currentPostId));
  
  // Score posts by relevance (number of matching categories)
  const scoredPosts = otherPosts.map(post => {
    const matchingCategories = post.categories.filter(cat => 
      categories.includes(cat.id)
    ).length;
    
    return {
      ...post,
      relevanceScore: matchingCategories
    };
  });
  
  // Sort by relevance score (descending) and then by views (descending)
  scoredPosts.sort((a, b) => {
    if (b.relevanceScore !== a.relevanceScore) {
      return b.relevanceScore - a.relevanceScore;
    }
    return b.views - a.views;
  });
  
  // Return the top 'limit' posts
  return scoredPosts.slice(0, limit);
};

// Get all categories
export const getAllCategories = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  return mockCategories;
};