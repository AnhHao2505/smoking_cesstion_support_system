import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Row, Col, Breadcrumb, Skeleton, Empty, Tag, Avatar, Card, Button, Divider } from 'antd';
import { HomeOutlined, CalendarOutlined, UserOutlined, ShareAltOutlined } from '@ant-design/icons';
import { getBlogPostById } from '../../services/blogService';
import SidebarRelatedPosts from '../../components/blog/SidebarRelatedPosts';
import SidebarCategories from '../../components/blog/SidebarCategories';
import BlogCta from '../../components/blog/BlogCta';
import '../../styles/BlogDetail.css';

const BlogDetailPage = () => {
  const { id } = useParams();
  const [blogPost, setBlogPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlogPost = async () => {
      try {
        setLoading(true);
        const data = await getBlogPostById(id);
        setBlogPost(data);
        // Set page title
        document.title = `${data.title} | Smoking Cessation Support`;
      } catch (err) {
        console.error('Error fetching blog post:', err);
        setError('Failed to load the blog post. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBlogPost();
    }

    // Reset title when component unmounts
    return () => {
      document.title = 'Smoking Cessation Support';
    };
  }, [id]);

  if (loading) {
    return (
      <div className="blog-detail-container">
        <Breadcrumb className="blog-breadcrumb">
          <Breadcrumb.Item href="/">
            <HomeOutlined /> Home
          </Breadcrumb.Item>
          <Breadcrumb.Item href="/blog">Blog</Breadcrumb.Item>
          <Breadcrumb.Item>Loading...</Breadcrumb.Item>
        </Breadcrumb>
        <div className="blog-detail-loading">
          <Skeleton active paragraph={{ rows: 20 }} />
        </div>
      </div>
    );
  }

  if (error || !blogPost) {
    return (
      <div className="blog-detail-container">
        <Breadcrumb className="blog-breadcrumb">
          <Breadcrumb.Item href="/">
            <HomeOutlined /> Home
          </Breadcrumb.Item>
          <Breadcrumb.Item href="/blog">Blog</Breadcrumb.Item>
          <Breadcrumb.Item>Not Found</Breadcrumb.Item>
        </Breadcrumb>
        <div className="blog-detail-not-found">
          <Empty description={error || "Blog post not found"} />
          <Button type="primary" style={{ marginTop: 16 }}>
            <Link to="/blog">Return to Blog</Link>
          </Button>
        </div>
      </div>
    );
  }

  const { title, post_content, created_date, author, categories = [], attached_image } = blogPost;

  // Format date for display
  const formattedDate = new Date(created_date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="blog-detail-container">
      <Breadcrumb className="blog-breadcrumb">
        <Breadcrumb.Item href="/">
          <HomeOutlined /> Home
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to="/blog">Blog</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{title}</Breadcrumb.Item>
      </Breadcrumb>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <div className="blog-detail-main">
            <div className="blog-detail-categories">
              {categories.map(category => (
                <Tag key={category.id} color="blue">
                  <Link to={`/blog/category/${category.id}`}>{category.name}</Link>
                </Tag>
              ))}
            </div>
            
            <h1 className="blog-detail-title">{title}</h1>
            
            <div className="blog-detail-meta">
              <span>
                <UserOutlined /> By {author ? author.full_name : 'Unknown Author'}
              </span>
              <span style={{ margin: '0 16px' }}>|</span>
              <span>
                <CalendarOutlined /> {formattedDate}
              </span>
            </div>
            
            {attached_image && (
              <div className="blog-detail-image-container">
                <img 
                  src={attached_image} 
                  alt={title} 
                  className="blog-detail-image" 
                />
              </div>
            )}
            
            <div 
              className="blog-detail-content"
              dangerouslySetInnerHTML={{ __html: post_content }}
            />
            
            <div className="blog-detail-sharing">
              <Divider orientation="left">Share this article</Divider>
              <Button type="primary" icon={<ShareAltOutlined />}>
                Share
              </Button>
            </div>
            
            <div className="blog-detail-author">
              <Divider orientation="left">About the Author</Divider>
              <Card bordered={false}>
                <Card.Meta
                  avatar={<Avatar size={64} icon={<UserOutlined />} />}
                  title={author ? author.full_name : 'Unknown Author'}
                  description={author ? author.bio || 'Smoking cessation expert' : 'Smoking cessation expert'}
                />
              </Card>
            </div>
          </div>
        </Col>
        
        <Col xs={24} lg={8}>
          <div className="blog-detail-sidebar">
            <SidebarRelatedPosts 
              currentPostId={id} 
              categories={categories.map(c => c.id)} 
            />
            <SidebarCategories />
            <BlogCta />
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default BlogDetailPage;