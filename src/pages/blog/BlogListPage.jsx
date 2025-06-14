import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Row, Col, Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import BlogList from '../../components/blog/BlogList';
import FeaturedBlogs from '../../components/blog/FeaturedBlogs';
import SidebarCategories from '../../components/blog/SidebarCategories';
import SidebarPopularPosts from '../../components/blog/SidebarPopularPosts';

const BlogListPage = ({ featuredOnly = false }) => {
  const { categoryId, authorId } = useParams();
  const location = useLocation();
  
  // Get search params from URL
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search') || '';
  
  // Page title changes based on filters
  let pageTitle = 'Blog Posts';
  if (featuredOnly) pageTitle = 'Featured Blog Posts';
  else if (categoryId) pageTitle = 'Category: [Category Name]'; // Would need to fetch category name
  else if (authorId) pageTitle = 'Posts by [Author Name]'; // Would need to fetch author name
  else if (searchQuery) pageTitle = `Search Results: "${searchQuery}"`;

  return (
    <div className="blog-list-container">
      <Breadcrumb className="blog-breadcrumb">
        <Breadcrumb.Item href="/">
          <HomeOutlined /> Home
        </Breadcrumb.Item>
        <Breadcrumb.Item>Blog</Breadcrumb.Item>
        {(categoryId || authorId || featuredOnly || searchQuery) && (
          <Breadcrumb.Item>{pageTitle}</Breadcrumb.Item>
        )}
      </Breadcrumb>

      <div className="blog-header">
        <h1>{pageTitle}</h1>
        <p className="blog-description">
          Discover helpful articles, tips, and resources to support your journey to quit smoking.
        </p>
      </div>

      {!featuredOnly && !categoryId && !authorId && !searchQuery && (
        <FeaturedBlogs limit={3} />
      )}

      <Row gutter={[24, 24]} className="blog-content">
        <Col xs={24} lg={16}>
          <BlogList 
            categoryId={categoryId}
            authorId={authorId}
            searchQuery={searchQuery}
            featuredOnly={featuredOnly}
          />
        </Col>
        <Col xs={24} lg={8}>
          <div className="blog-sidebar">
            <SidebarCategories />
            <SidebarPopularPosts />
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default BlogListPage;