'use client';

import { useState, useEffect } from 'react';
import { Star, CheckCircle, XCircle, Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/services/api';
import toast, { Toaster } from 'react-hot-toast';

interface Review {
  _id: string;
  customerName: string;
  customerEmail?: string;
  rating: number;
  comment?: string;
  menuItemId?: string;
  orderId?: string;
  verified: boolean;
  createdAt: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all');
  const [verifiedFilter, setVerifiedFilter] = useState<'all' | 'verified' | 'unverified'>('all');

  useEffect(() => {
    loadReviews();
  }, [ratingFilter, verifiedFilter]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const data = await api.get<Review[]>('/reviews', {
        params: {
          ...(ratingFilter !== 'all' && { rating: ratingFilter }),
          ...(verifiedFilter === 'verified' && { verified: 'true' }),
          ...(verifiedFilter === 'unverified' && { verified: 'false' }),
        },
      });
      setReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      // Reviews endpoint might not exist yet, show empty state
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleVerification = async (id: string, verified: boolean) => {
    try {
      const token = localStorage.getItem('token');
      await api.put(
        `/reviews/${id}`,
        { verified: !verified },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success(`Review ${!verified ? 'verified' : 'unverified'}`);
      loadReviews();
    } catch (error) {
      toast.error('Failed to update review');
    }
  };

  const deleteReview = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/reviews/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Review deleted');
      loadReviews();
    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch = review.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (review.comment && review.comment.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRating = ratingFilter === 'all' || review.rating === parseInt(ratingFilter);
    const matchesVerified = verifiedFilter === 'all' ||
      (verifiedFilter === 'verified' && review.verified) ||
      (verifiedFilter === 'unverified' && !review.verified);
    return matchesSearch && matchesRating && matchesVerified;
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'
        }`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Reviews</h1>
          <p className="text-slate-400 text-sm mt-1">
            Total Reviews: {reviews.length} | Average Rating: {
              reviews.length > 0
                ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                : '0'
            }
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-900 rounded-xl p-4 space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value as any)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
          <select
            value={verifiedFilter}
            onChange={(e) => setVerifiedFilter(e.target.value as any)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Reviews</option>
            <option value="verified">Verified Only</option>
            <option value="unverified">Unverified Only</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading...</div>
      ) : filteredReviews.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          {reviews.length === 0 ? 'No reviews yet' : 'No reviews match your filters'}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <motion.div
              key={review._id}
              className="bg-slate-900 rounded-xl p-6 border border-slate-800 hover:border-orange-600 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {review.customerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{review.customerName}</p>
                      {review.customerEmail && (
                        <p className="text-xs text-slate-400">{review.customerEmail}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    {renderStars(review.rating)}
                    <span className="text-slate-400 text-sm ml-2">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                    {review.verified && (
                      <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">
                        Verified
                      </span>
                    )}
                  </div>
                  {review.comment && (
                    <p className="text-slate-300 mt-2">{review.comment}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleVerification(review._id, review.verified)}
                    className={`p-2 rounded transition-colors ${
                      review.verified
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-slate-800 hover:bg-slate-700'
                    }`}
                    title={review.verified ? 'Unverify' : 'Verify'}
                  >
                    <CheckCircle className="w-5 h-5 text-white" />
                  </button>
                  <button
                    onClick={() => deleteReview(review._id)}
                    className="p-2 rounded bg-red-600 hover:bg-red-700 transition-colors"
                    title="Delete"
                  >
                    <XCircle className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
