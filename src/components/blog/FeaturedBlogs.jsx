import React, { useState, useEffect } from 'react';
import { Typography, Card, Row, Col, Tag, Space, Button } from 'antd';
import { Link } from 'react-router-dom';
import { ClockCircleOutlined, LikeOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { getFeaturedBlogPosts } from '../../services/blogService';
import '../../styles/FeaturedBlogs.css';

const { Title, Paragraph, Text } = Typography;

const FeaturedBlogs = () => {
  const [featuredPosts, setFeaturedPosts] = useState([]);
  
  useEffect(() => {
    const posts = getFeaturedBlogPosts();
    setFeaturedPosts(posts);
  }, []);
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  // Truncate content for preview
  const truncateContent = (content, maxLength = 150) => {
    // Remove HTML tags for preview
    const textContent = content.replace(/<[^>]+>/g, '');
    
    if (textContent.length <= maxLength) return textContent;
    return textContent.substring(0, maxLength) + '...';
  };

  return (
    <div className="featured-blogs-container">
      <div className="featured-blogs-header">
        <Title level={2}>Bài viết nổi bật</Title>
        <Link to="/blog" className="view-all-link">
          Xem tất cả <ArrowRightOutlined />
        </Link>
      </div>
      
      {featuredPosts.length > 0 ? (
        <Row gutter={[24, 24]}>
          <Col xs={24} md={16}>
            <div className="featured-main-post">
              <Link to={`/blog/${featuredPosts[0].post_id}`}>
                <Card 
                  hoverable 
                  className="featured-main-card"
                  cover={
                    <div className="featured-image-container">
                      <img 
                        alt={featuredPosts[0].title} 
                        src={`${process.env.PUBLIC_URL}/images/blog/${featuredPosts[0].attached_image}`} 
                        className="featured-main-image"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `${process.env.PUBLIC_URL}/images/blog/default-blog.jpg`;
                        }}
                      />
                      <div className="featured-content-overlay">
                        <div className="featured-content">
                          <div className="featured-categories">
                            {featuredPosts[0].categories.slice(0, 2).map((category, index) => (
                              <Tag color="blue" key={index}>{category.name}</Tag>
                            ))}
                          </div>
                          <Title level={3} className="featured-title">{featuredPosts[0].title}</Title>
                          <Paragraph className="featured-excerpt">
                            {truncateContent(featuredPosts[0].post_content, 200)}
                          </Paragraph>
                          <div className="featured-meta">
                            <Space size="large">
                              <Text className="featured-date">{formatDate(featuredPosts[0].created_date)}</Text>
                              <Text><ClockCircleOutlined /> {featuredPosts[0].read_time} phút</Text>
                              <Text><LikeOutlined /> {featuredPosts[0].likes}</Text>
                            </Space>
                          </div>
                        </div>
                      </div>
                    </div>
                  }
                >
                </Card>
              </Link>
            </div>
          </Col>
          
          <Col xs={24} md={8}>
            <div className="featured-side-posts">
              {featuredPosts.slice(1, 3).map(post => (
                <Link to={`/blog/${post.post_id}`} key={post.post_id}>
                  <Card hoverable className="featured-side-card">
                    <div className="side-card-content">
                      <div className="side-card-image-container">
                        <img 
                          alt={post.title} 
                          src={`${process.env.PUBLIC_URL}/images/blog/${post.attached_image}`} 
                          className="side-card-image"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `${process.env.PUBLIC_URL}/images/blog/default-blog.jpg`;
                          }}
                        />
                      </div>
                      <div className="side-card-text">
                        <div className="side-card-categories">
                          {post.categories.slice(0, 1).map((category, index) => (
                            <Tag color="blue" key={index}>{category.name}</Tag>
                          ))}
                        </div>
                        <Title level={4} className="side-card-title">{post.title}</Title>
                        <div className="side-card-meta">
                          <Text className="side-card-date">{formatDate(post.created_date)}</Text>
                          <Text><ClockCircleOutlined /> {post.read_time} phút</Text>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </Col>
        </Row>
      ) : (
        <div className="no-featured-posts">
          <Paragraph>Không có bài viết nổi bật.</Paragraph>
        </div>
      )}
    </div>
  );
};

export default FeaturedBlogs;