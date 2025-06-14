import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Skeleton } from 'antd';
import { getPopularBlogPosts } from '../../services/blogService';

const SidebarPopularPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPopularPosts = async () => {
      try {
        const data = await getPopularBlogPosts(5); // Get top 5 popular posts
        setPosts(data);
      } catch (error) {
        console.error('Error fetching popular posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularPosts();
  }, []);

  if (loading) {
    return (
      <div className="blog-detail-related">
        <h3>Popular Posts</h3>
        <Skeleton active paragraph={{ rows: 5 }} />
      </div>
    );
  }

  if (!posts.length) {
    return null;
  }

  return (
    <div className="blog-detail-related">
      <h3>Popular Posts</h3>
      <div className="related-posts-list">
        {posts.map(post => (
          <Link to={`/blog/${post.post_id}`} key={post.post_id}>
            <Card className="related-post-card" bordered={false}>
              <div className="related-post-content">
                {post.attached_image && (
                  <div className="related-post-image-container">
                    <img 
                      src={post.attached_image} 
                      alt={post.title} 
                      className="related-post-image" 
                    />
                  </div>
                )}
                <div className="related-post-text">
                  <h4>{post.title}</h4>
                  <p>{new Date(post.created_date).toLocaleDateString()}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SidebarPopularPosts;