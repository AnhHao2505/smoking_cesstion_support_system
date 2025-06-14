import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Skeleton } from 'antd';
import { getAllCategories } from '../../services/blogService';

const SidebarCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getAllCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="blog-detail-categories-list">
        <h3>Categories</h3>
        <Skeleton active paragraph={{ rows: 3 }} />
      </div>
    );
  }

  if (!categories.length) {
    return null;
  }

  return (
    <div className="blog-detail-categories-list">
      <h3>Categories</h3>
      <div className="categories-tags">
        {categories.map(category => (
          <Link to={`/blog/category/${category.id}`} key={category.id}>
            <Tag className="category-tag" color="blue">
              {category.name}
            </Tag>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SidebarCategories;