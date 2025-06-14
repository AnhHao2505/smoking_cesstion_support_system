import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Lazy load components
const HomePage = lazy(() => import('../pages/HomePage'));
const BlogListPage = lazy(() => import('../pages/blog/BlogListPage'));
const BlogDetailPage = lazy(() => import('../pages/blog/BlogDetailPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/blog" element={<BlogListPage />} />
        <Route path="/blog/featured" element={<BlogListPage featuredOnly={true} />} />
        <Route path="/blog/:id" element={<BlogDetailPage />} />
        <Route path="/blog/category/:categoryId" element={<BlogListPage />} />
        <Route path="/blog/author/:authorId" element={<BlogListPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;