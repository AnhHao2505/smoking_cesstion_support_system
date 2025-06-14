import React from 'react';
import { Card, Button } from 'antd';
import { Link } from 'react-router-dom';

const BlogCta = () => {
  return (
    <div className="blog-detail-cta">
      <Card
        className="cta-card"
        cover={
          <img
            alt="Ready to quit smoking?"
            src="/images/quit-smoking-cta.jpg"
            style={{ height: 200, objectFit: 'cover' }}
          />
        }
      >
        <Card.Meta
          title="Ready to Quit Smoking?"
          description="Join our program today and get support from experts and people like you on the journey to becoming smoke-free."
        />
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <Button type="primary" size="large">
            <Link to="/register">Join Now</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default BlogCta;