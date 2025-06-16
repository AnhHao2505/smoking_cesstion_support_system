import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Typography, 
  Breadcrumb, 
  Row, 
  Col, 
  Tag, 
  Space, 
  Divider, 
  Button, 
  Card, 
  Avatar, 
  Spin,
  Meta
} from 'antd';
import { 
  UserOutlined, 
  CalendarOutlined, 
  ClockCircleOutlined, 
  LikeOutlined, 
  MessageOutlined,
  ShareAltOutlined,
  FacebookOutlined,
  TwitterOutlined,
  LinkedinOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { getBlogPostById, getRelatedBlogPosts } from '../../services/blogService';
import '../../styles/BlogDetail.css';

const { Title, Paragraph, Text } = Typography;

const BlogDetail = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const blogPost = getBlogPostById(postId);
      setPost(blogPost);
      
      if (blogPost) {
        const related = getRelatedBlogPosts(postId);
        setRelatedPosts(related);
      }
      
      setLoading(false);
    }, 500);
  }, [postId]);
  
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

  if (loading) {
    return (
      <div className="blog-detail-loading">
        <Spin size="large" />
        <Paragraph>Đang tải bài viết...</Paragraph>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="blog-detail-not-found">
        <Title level={2}>Không tìm thấy bài viết</Title>
        <Paragraph>Bài viết bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</Paragraph>
        <Link to="/blog">
          <Button type="primary" icon={<ArrowLeftOutlined />}>
            Quay lại danh sách bài viết
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="blog-detail-container">
      {/* Breadcrumb Navigation */}
      <Breadcrumb className="blog-breadcrumb">
        <Breadcrumb.Item>
          <Link to="/">Trang chủ</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to="/blog">Blog</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{post.title}</Breadcrumb.Item>
      </Breadcrumb>
      
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <div className="blog-detail-main">
            {/* Blog Categories */}
            <div className="blog-detail-categories">
              {post.categories.map((category, index) => (
                <Tag color="blue" key={index}>{category.name}</Tag>
              ))}
            </div>
            
            {/* Blog Title */}
            <Title level={1} className="blog-detail-title">
              {post.title}
            </Title>
            
            {/* Blog Meta Information */}
            <div className="blog-detail-meta">
              <Space size="large">
                <Space>
                  <Avatar icon={<UserOutlined />} src={post.author_image} />
                  <Text strong>{post.author_name}</Text>
                </Space>
                <Space>
                  <CalendarOutlined />
                  <Text>{formatDate(post.created_date)}</Text>
                </Space>
                <Space>
                  <ClockCircleOutlined />
                  <Text>{post.read_time} phút đọc</Text>
                </Space>
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
            
            {/* Featured Image */}
            <div className="blog-detail-image-container">
              <img 
                src={`${process.env.PUBLIC_URL}/images/blog/${post.attached_image}`}
                alt={post.title}
                className="blog-detail-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `${process.env.PUBLIC_URL}/images/blog/default-blog.jpg`;
                }}
              />
            </div>
            
            {/* Blog Content */}
            <div 
              className="blog-detail-content"
              dangerouslySetInnerHTML={{ __html: post.post_content }}
            />
            
            {/* Social Sharing */}
            <div className="blog-detail-sharing">
              <Divider orientation="left">Chia sẻ bài viết</Divider>
              <Space size="middle">
                <Button type="primary" icon={<FacebookOutlined />} shape="circle" />
                <Button type="primary" icon={<TwitterOutlined />} shape="circle" style={{ backgroundColor: '#1DA1F2' }} />
                <Button type="primary" icon={<LinkedinOutlined />} shape="circle" style={{ backgroundColor: '#0077B5' }} />
                <Button icon={<ShareAltOutlined />}>Chia sẻ</Button>
              </Space>
            </div>
            
            {/* Author Information */}
            <div className="blog-detail-author">
              <Divider orientation="left">Về tác giả</Divider>
              <Card>
                <Meta
                  avatar={<Avatar size={64} icon={<UserOutlined />} src={post.author_image} />}
                  title={post.author_name}
                  description={
                    <>
                      <Text type="secondary">{post.author_role === 'coach' ? 'Chuyên gia cai thuốc lá' : 'Thành viên'}</Text>
                      <Paragraph style={{ marginTop: 10 }}>
                        {post.author_role === 'coach' 
                          ? 'Chuyên gia với nhiều năm kinh nghiệm trong lĩnh vực hỗ trợ cai thuốc lá và tư vấn sức khỏe.'
                          : 'Thành viên tích cực của cộng đồng cai thuốc lá, chia sẻ kinh nghiệm và hỗ trợ những người khác trên hành trình cai thuốc.'}
                      </Paragraph>
                    </>
                  }
                />
              </Card>
            </div>
          </div>
        </Col>
        
        <Col xs={24} lg={8}>
          <div className="blog-detail-sidebar">
            {/* Related Posts */}
            <div className="blog-detail-related">
              <Title level={3}>Bài viết liên quan</Title>
              <div className="related-posts-list">
                {relatedPosts.length > 0 ? (
                  relatedPosts.map(relatedPost => (
                    <Link to={`/blog/${relatedPost.post_id}`} key={relatedPost.post_id}>
                      <Card hoverable className="related-post-card">
                        <div className="related-post-content">
                          <div className="related-post-image-container">
                            <img 
                              src={`${process.env.PUBLIC_URL}/images/blog/${relatedPost.attached_image}`}
                              alt={relatedPost.title}
                              className="related-post-image"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `${process.env.PUBLIC_URL}/images/blog/default-blog.jpg`;
                              }}
                            />
                          </div>
                          <div className="related-post-text">
                            <Title level={5}>{relatedPost.title}</Title>
                            <Text type="secondary">{formatDate(relatedPost.created_date)}</Text>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))
                ) : (
                  <Paragraph>Không có bài viết liên quan.</Paragraph>
                )}
              </div>
            </div>
            
            {/* Categories List */}
            <div className="blog-detail-categories-list">
              <Title level={3}>Danh mục</Title>
              <div className="categories-tags">
                {post.categories.map((category, index) => (
                  <Link to={`/blog?category=${category.id}`} key={index}>
                    <Tag color="blue" className="category-tag">{category.name}</Tag>
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Call to Action */}
            <div className="blog-detail-cta">
              <Card className="cta-card">
                <Title level={4}>Bắt đầu hành trình cai thuốc lá của bạn ngay hôm nay</Title>
                <Paragraph>
                  Tham gia cộng đồng hỗ trợ cai thuốc lá của chúng tôi và nhận sự hỗ trợ từ chuyên gia và những người đồng hành.
                </Paragraph>
                <Link to="/register">
                  <Button type="primary" size="large" block>
                    Đăng ký ngay
                  </Button>
                </Link>
              </Card>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default BlogDetail;