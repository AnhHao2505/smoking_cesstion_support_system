import React, { useState, useEffect } from 'react';
import { Typography, Card, Row, Col, Divider, Tag, Space, Input, Select, Button, Empty } from 'antd';
import { Link } from 'react-router-dom';
import { SearchOutlined, ClockCircleOutlined, LikeOutlined, MessageOutlined, UserOutlined } from '@ant-design/icons';
import { getAllBlogPosts } from '../../services/blogService';  // Change this line
import '../../styles/BlogList.css';

const { Title, Paragraph, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const BlogList = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  
  useEffect(() => {
    // Get blog posts
    const fetchPosts = async () => {
      const response = await getAllBlogPosts();
      setPosts(response.posts);
      setFilteredPosts(response.posts);
      
      // Extract unique categories from all posts
      const uniqueCategories = [...new Set(response.posts.flatMap(post => post.categories.map(c => c.name)))];
      setCategories(uniqueCategories);
    };
    
    fetchPosts();
  }, []);
  
  // Handle search functionality
  const handleSearch = (value) => {
    const searchValue = value.toLowerCase();
    filterPosts(searchValue, selectedCategory);
  };
  
  // Handle category filter
  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    filterPosts(searchTerm, value);
  };
  
  // Combined filter function
  const filterPosts = (search, category) => {
    let filtered = posts;
    
    // Filter by search term
    if (search) {
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(search) || 
        post.post_content.toLowerCase().includes(search)
      );
    }
    
    // Filter by category
    if (category && category !== 'all') {
      filtered = filtered.filter(post => 
        post.categories.includes(category)
      );
    }
    
    setFilteredPosts(filtered);
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Truncate post content for preview
  const truncateContent = (content, maxLength = 200) => {
    // Remove HTML tags for preview
    const textContent = content.replace(/<[^>]+>/g, '');
    
    if (textContent.length <= maxLength) return textContent;
    return textContent.substring(0, maxLength) + '...';
  };

  return (
    <div className="blog-list-container">
      <div className="blog-header">
        <Title level={1}>Blog về cai thuốc lá</Title>
        <Paragraph className="blog-description">
          Khám phá các bài viết, mẹo và chiến lược để hỗ trợ hành trình cai thuốc lá của bạn
        </Paragraph>
      </div>
      
      <div className="blog-filters">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={12}>
            <Search
              placeholder="Tìm kiếm bài viết..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={handleSearch}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Col>
          <Col xs={24} md={12}>
            <Select
              placeholder="Lọc theo danh mục"
              style={{ width: '100%' }}
              size="large"
              defaultValue="all"
              onChange={handleCategoryChange}
            >
              <Option value="all">Tất cả danh mục</Option>
              {categories.map(category => (
                <Option value={category.id} key={category.id}>{category.name}</Option>
              ))}
            </Select>
          </Col>
        </Row>
      </div>
      
      <Divider />
      
      <div className="blog-results">
        {filteredPosts.length === 0 ? (
          <div className="no-results">
            <Empty
              description={
                <div>
                  <Title level={4}>Không tìm thấy bài viết phù hợp</Title>
                  <Paragraph>Vui lòng thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác</Paragraph>
                </div>
              }
            />
          </div>
        ) : (
          <Row gutter={[24, 32]}>
            {filteredPosts.map(post => (
              <Col xs={24} md={12} lg={8} key={post.post_id}>
                <Link to={`/blog/${post.post_id}`}>
                  <Card 
                    hoverable 
                    className="blog-card"
                    cover={
                      <div className="blog-card-image-container">
                        <img 
                          alt={post.title} 
                          src={`${process.env.PUBLIC_URL}/images/blog/${post.attached_image}`} 
                          className="blog-card-image"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `${process.env.PUBLIC_URL}/images/blog/default-blog.jpg`;
                          }}
                        />
                      </div>
                    }
                  >
                    <div className="blog-card-categories">
                      {post.categories.slice(0, 2).map((category, index) => (
                        <Tag color="blue" key={index}>{category.name}</Tag>
                      ))}
                    </div>
                    <Title level={4} className="blog-card-title">{post.title}</Title>
                    <Paragraph className="blog-card-excerpt">
                      {truncateContent(post.post_content)}
                    </Paragraph>
                    <div className="blog-card-meta">
                      <Space size="middle">
                        <Space>
                          <UserOutlined />
                          <Text>{post.author_name}</Text>
                        </Space>
                        <Text>{formatDate(post.created_date)}</Text>
                        <Space>
                          <ClockCircleOutlined />
                          <Text>{post.read_time} phút</Text>
                        </Space>
                      </Space>
                      <Space size="middle" className="blog-card-stats">
                        <Space>
                          <LikeOutlined />
                          <Text>{post.likes}</Text>
                        </Space>
                        <Space>
                          <MessageOutlined />
                          <Text>{post.comments}</Text>
                        </Space>
                      </Space>
                    </div>
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
};

export default BlogList;