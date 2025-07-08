import axiosInstance from '../utils/axiosConfig';
import { API_ENDPOINTS, handleApiResponse, handleApiError } from '../utils/apiEndpoints';

// Get all blog posts with pagination and filters
export const getAllBlogPosts = async (page = 0, size = 10, category = '', search = '') => {
  throw new Error('Blog endpoints are not available in the current API specification');
};

// Get a single blog post by ID
export const getBlogPostById = async (id) => {
  throw new Error('Blog endpoints are not available in the current API specification');
};

// Get featured blog posts
export const getFeaturedBlogPosts = async (limit = 3) => {
  throw new Error('Blog endpoints are not available in the current API specification');
};

// Get popular blog posts
export const getPopularBlogPosts = async (limit = 5) => {
  throw new Error('Blog endpoints are not available in the current API specification');
};

// Get related blog posts
export const getRelatedBlogPosts = async (postId, limit = 3) => {
  throw new Error('Blog endpoints are not available in the current API specification');
};

// Get blog categories
export const getBlogCategories = async () => {
  throw new Error('Blog endpoints are not available in the current API specification');
};

// Search blog posts
export const searchBlogPosts = async (query, page = 0, size = 10) => {
  throw new Error('Blog endpoints are not available in the current API specification');
};

// Get blog posts by category
export const getBlogPostsByCategory = async (categoryId, page = 0, size = 10) => {
  throw new Error('Blog endpoints are not available in the current API specification');
};

// Alias functions for backward compatibility
export const getAllCategories = getBlogCategories;
