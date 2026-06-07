'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Upload, X, ArrowUp, ArrowDown, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/services/api';
import toast, { Toaster } from 'react-hot-toast';

interface HeroImage {
  _id?: string;
  imageUrl: string;
  order: number;
  isActive: boolean;
}

export default function HeroImagesPage() {
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingImage, setEditingImage] = useState<HeroImage | null>(null);
  const [formData, setFormData] = useState({
    imageUrl: '',
    order: 1,
    isActive: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    loadHeroImages();
  }, []);

  const loadHeroImages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const data = await api.get<HeroImage[]>('/hero-images/admin', {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Ensure we have 5 slots, fill missing ones with empty placeholders
      const images: HeroImage[] = [];
      for (let i = 1; i <= 5; i++) {
        const existing = Array.isArray(data) ? data.find((img) => img.order === i) : null;
        if (existing) {
          images.push(existing);
        } else {
          images.push({
            imageUrl: '',
            order: i,
            isActive: false,
          });
        }
      }
      setHeroImages(images);
    } catch (error: any) {
      console.error('Failed to load hero images:', error);
      toast.error(error?.message || 'Failed to load hero images');
      // Initialize with empty slots
      setHeroImages(
        Array.from({ length: 5 }, (_, i) => ({
          imageUrl: '',
          order: i + 1,
          isActive: false,
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post<{ imageUrl: string }>('/upload/image', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.imageUrl;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUploadingImage(true);
      const token = localStorage.getItem('token');

      // Upload image if a new file is selected
      let imageUrl = formData.imageUrl;
      if (imageFile) {
        try {
          imageUrl = await uploadImage(imageFile);
          setFormData({ ...formData, imageUrl });
        } catch (error: any) {
          toast.error(error?.message || 'Failed to upload image');
          setUploadingImage(false);
          return;
        }
      }

      if (!imageUrl) {
        toast.error('Please upload an image');
        setUploadingImage(false);
        return;
      }

      const submitData = {
        imageUrl,
        order: formData.order,
        isActive: formData.isActive,
      };

      await api.post('/hero-images/admin', submitData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success('Hero image saved successfully');
      setShowModal(false);
      resetForm();
      loadHeroImages();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save hero image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleEdit = (image: HeroImage) => {
    setEditingImage(image);
    setFormData({
      imageUrl: image.imageUrl,
      order: image.order,
      isActive: image.isActive,
    });
    setImagePreview(image.imageUrl);
    setImageFile(null);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this hero image?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await api.delete(`/hero-images/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Hero image deleted successfully');
      loadHeroImages();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete hero image');
    }
  };

  const resetForm = () => {
    setFormData({
      imageUrl: '',
      order: 1,
      isActive: true,
    });
    setImageFile(null);
    setImagePreview('');
    setEditingImage(null);
  };

  const handleOpenModal = (order: number) => {
    const existing = heroImages.find((img) => img.order === order);
    if (existing && existing._id) {
      handleEdit(existing);
    } else {
      setFormData({
        imageUrl: '',
        order,
        isActive: true,
      });
      setImagePreview('');
      setImageFile(null);
      setEditingImage(null);
      setShowModal(true);
    }
  };

  return (
    <div className="p-6" style={{ background: '#080808', minHeight: '100vh' }}>
      <Toaster position="top-right" />
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#f8f4ed' }}>Hero Images</h1>
          <p className="mt-1" style={{ color: '#a89070' }}>Manage 5 hero images for the homepage carousel</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div style={{ color: '#a89070' }}>Loading hero images...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {heroImages.map((image, index) => (
            <motion.div
              key={image.order}
              className="overflow-hidden"
              style={{
                background: '#141414',
                borderRadius: '16px',
                border: '1px solid rgba(200,151,42,0.13)',
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="relative h-48" style={{ background: '#1c1c1c' }}>
                {image.imageUrl ? (
                  <img
                    src={image.imageUrl.startsWith('http') ? image.imageUrl : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${image.imageUrl}`}
                    alt={`Hero Image ${image.order}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Upload className="w-12 h-12" style={{ color: '#6b5040' }} />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span
                    className="text-xs px-2 py-1 rounded"
                    style={{
                      background: 'linear-gradient(135deg,#8b5a00,#c8972a,#f0c060)',
                      color: '#080808',
                      fontWeight: 700,
                    }}
                  >
                    #{image.order}
                  </span>
                </div>
                {!image.isActive && image.imageUrl && (
                  <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <span
                      className="px-3 py-1 rounded text-sm"
                      style={{ background: 'rgba(239,68,68,0.2)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}
                    >
                      Inactive
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm" style={{ color: '#a89070' }}>Position: {image.order}</span>
                  <span
                    className="text-xs px-2 py-1 rounded"
                    style={
                      image.isActive
                        ? { background: 'rgba(34,197,94,0.1)', color: '#22c55e' }
                        : { background: 'rgba(239,68,68,0.1)', color: '#ef4444' }
                    }
                  >
                    {image.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(image.order)}
                    className="flex-1 px-4 py-2 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                    style={{
                      background: 'linear-gradient(135deg,#8b5a00,#c8972a,#f0c060)',
                      color: '#080808',
                      border: 'none',
                      borderRadius: '10px',
                      fontWeight: 700,
                    }}
                  >
                    {image.imageUrl ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {image.imageUrl ? 'Edit' : 'Add Image'}
                  </button>
                  {image._id && (
                    <button
                      onClick={() => handleDelete(image._id!)}
                      className="px-4 py-2 text-sm font-semibold transition-colors"
                      style={{
                        background: 'transparent',
                        border: '1px solid rgba(239,68,68,0.3)',
                        color: '#ef4444',
                        borderRadius: '10px',
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
            <motion.div
              className="max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              style={{
                background: '#141414',
                border: '1px solid rgba(200,151,42,0.2)',
                borderRadius: '18px',
                boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold" style={{ color: '#f8f4ed' }}>
                    {editingImage ? 'Edit Hero Image' : 'Add Hero Image'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    style={{ color: '#a89070', background: 'transparent', border: 'none', cursor: 'pointer' }}
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#a89070' }}>
                      Position (1-5)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={formData.order}
                      onChange={(e) =>
                        setFormData({ ...formData, order: parseInt(e.target.value) })
                      }
                      className="w-full"
                      style={{
                        background: '#1c1c1c',
                        border: '1px solid rgba(200,151,42,0.2)',
                        borderRadius: '10px',
                        padding: '10px 14px',
                        color: '#f8f4ed',
                        outline: 'none',
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = '#c8972a')}
                      onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(200,151,42,0.2)')}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#a89070' }}>
                      Image
                    </label>
                    {imagePreview && (
                      <div className="mb-4">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-64 object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <div className="relative">
                      <label
                        className="flex flex-col items-center justify-center w-full h-32 cursor-pointer transition-colors"
                        style={{
                          border: '2px dashed rgba(200,151,42,0.3)',
                          borderRadius: '10px',
                          background: '#1c1c1c',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#c8972a';
                          e.currentTarget.style.background = '#242424';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(200,151,42,0.3)';
                          e.currentTarget.style.background = '#1c1c1c';
                        }}
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-10 h-10 mb-3" style={{ color: '#a89070' }} />
                          <p className="mb-2 text-sm" style={{ color: '#a89070' }}>
                            <span className="font-semibold" style={{ color: '#c8972a' }}>Click to upload</span> or
                            drag and drop
                          </p>
                          <p className="text-xs" style={{ color: '#6b5040' }}>
                            All image formats (MAX. 20MB)
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                      {imageFile && (
                        <p className="text-xs mt-2" style={{ color: '#22c55e' }}>
                          Selected: {imageFile.name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                      className="w-4 h-4"
                      style={{ accentColor: '#c8972a' }}
                    />
                    <label htmlFor="isActive" style={{ color: '#a89070' }}>
                      Active (visible on homepage)
                    </label>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                      className="flex-1 px-6 py-3 font-semibold transition-colors"
                      style={{
                        background: 'transparent',
                        border: '1px solid rgba(200,151,42,0.3)',
                        color: '#c8972a',
                        borderRadius: '10px',
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={uploadingImage}
                      className="flex-1 px-6 py-3 font-semibold transition-colors flex items-center justify-center gap-2"
                      style={{
                        background: uploadingImage
                          ? 'rgba(200,151,42,0.4)'
                          : 'linear-gradient(135deg,#8b5a00,#c8972a,#f0c060)',
                        color: '#080808',
                        border: 'none',
                        borderRadius: '10px',
                        fontWeight: 700,
                        opacity: uploadingImage ? 0.5 : 1,
                        cursor: uploadingImage ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {uploadingImage ? (
                        <>Uploading...</>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          Save
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
