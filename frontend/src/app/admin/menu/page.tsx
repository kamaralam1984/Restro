'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Filter, X, Upload, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/services/api';
import toast, { Toaster } from 'react-hot-toast';

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isVeg: boolean;
  available: boolean;
  image?: string;
  addOns?: { name: string; price: number; available: boolean }[];
}

interface MenuCategory {
  name: string;
  count: number;
}

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterVeg, setFilterVeg] = useState<'all' | 'veg' | 'nonveg'>('all');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: 'main',
    isVeg: true,
    available: true,
    image: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    await Promise.all([loadMenuItems(), loadCategories()]);
  };

  const loadCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const data = await api.get<MenuCategory[]>('/menu/categories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load categories:', error);
      // Fallback to default categories if API fails
      setCategories([
        { name: 'appetizer', count: 0 },
        { name: 'main', count: 0 },
        { name: 'dessert', count: 0 },
        { name: 'beverage', count: 0 },
        { name: 'salad', count: 0 },
        { name: 'soup', count: 0 },
      ]);
    }
  };

  const loadMenuItems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Fetch all items without pagination for admin panel
      // Admin panel should show all items (available and unavailable)
      const response = await api.get<any>('/menu', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          limit: '1000', // Get all items
          available: 'all', // Show all items (available and unavailable) in admin panel
        },
      });

      // Backend returns { items: [...], pagination: {...} }
      if (response && response.items && Array.isArray(response.items)) {
        setMenuItems(response.items);
      } else if (Array.isArray(response)) {
        // Fallback if response is direct array
        setMenuItems(response);
      } else {
        console.warn('Unexpected response format:', response);
        setMenuItems([]);
      }
    } catch (error: any) {
      console.error('Failed to load menu items:', error);
      toast.error(error?.message || 'Failed to load menu items');
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUploadingImage(true);
      const token = localStorage.getItem('token');

      // Upload image if a new file is selected
      let imageUrl = formData.image;
      if (imageFile) {
        try {
          imageUrl = await uploadImage(imageFile);
          setFormData({ ...formData, image: imageUrl });
        } catch (error: any) {
          toast.error(error?.message || 'Failed to upload image');
          setUploadingImage(false);
          return;
        }
      }

      const submitData = { ...formData, image: imageUrl };

      if (editingItem) {
        await api.put(`/menu/${editingItem._id}`, submitData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Menu item updated successfully');
      } else {
        await api.post('/menu', submitData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Menu item created successfully');
      }
      setShowModal(false);
      resetForm();
      loadMenuItems();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save menu item');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/menu/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Menu item deleted successfully');
      loadMenuItems();
    } catch (error) {
      toast.error('Failed to delete menu item');
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      isVeg: item.isVeg,
      available: item.available,
      image: item.image || '',
    });
    setImagePreview(item.image || '');
    setImageFile(null);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: 'main',
      isVeg: true,
      available: true,
      image: '',
    });
    setImageFile(null);
    setImagePreview('');
    setEditingItem(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (20MB max)
      if (file.size > 20 * 1024 * 1024) {
        toast.error('Image size should be less than 20MB');
        return;
      }

      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('image', file);

    try {
      // Use fetch for file uploads to properly handle FormData
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

      const response = await fetch(`${API_BASE_URL}/upload/image`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type - let browser set it with boundary for FormData
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload image');
      }

      const data = await response.json();
      // Construct full URL for the uploaded image
      const baseURL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
      return `${baseURL}${data.imageUrl}`;
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to upload image');
    }
  };

  const handleQuickImageUpdate = async (item: MenuItem) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (20MB max)
      if (file.size > 20 * 1024 * 1024) {
        toast.error('Image size should be less than 20MB');
        return;
      }

      try {
        setUploadingImage(true);
        const imageUrl = await uploadImage(file);

        const token = localStorage.getItem('token');
        await api.put(
          `/menu/${item._id}`,
          { ...item, image: imageUrl },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        toast.success('Image updated successfully');
        loadMenuItems();
      } catch (error: any) {
        toast.error(error?.message || 'Failed to update image');
      } finally {
        setUploadingImage(false);
      }
    };
    input.click();
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesVeg = filterVeg === 'all' ||
      (filterVeg === 'veg' && item.isVeg) ||
      (filterVeg === 'nonveg' && !item.isVeg);
    return matchesSearch && matchesCategory && matchesVeg;
  });

  // Format category name for display
  const formatCategoryName = (category: string) => {
    return category
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const inputStyle: React.CSSProperties = {
    background: '#1c1c1c',
    border: '1px solid rgba(200,151,42,0.2)',
    borderRadius: '10px',
    padding: '10px 14px',
    color: '#f8f4ed',
    outline: 'none',
    width: '100%',
  };

  const inputFocusHandler = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = '#c8972a';
  };
  const inputBlurHandler = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = 'rgba(200,151,42,0.2)';
  };

  return (
    <div className="space-y-6" style={{ background: '#080808', minHeight: '100%' }}>
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold" style={{ color: '#f8f4ed' }}>Menu Management</h1>
        <div className="flex gap-3">
          <button
            onClick={() => {
              resetForm();
              setFormData({
                name: '',
                description: '',
                price: 0,
                category: 'main',
                isVeg: false,
                available: true,
                image: '',
              });
              setShowModal(true);
            }}
            style={{
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#ef4444',
              background: 'transparent',
              borderRadius: '10px',
              padding: '8px 16px',
            }}
            className="flex items-center gap-2 transition-colors"
            title="Add Non-Veg Item"
          >
            <Plus className="w-5 h-5" />
            Add Non-Veg Item
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            style={{
              background: 'linear-gradient(135deg,#8b5a00,#c8972a,#f0c060)',
              color: '#080808',
              border: 'none',
              borderRadius: '10px',
              padding: '8px 16px',
              fontWeight: 700,
            }}
            className="flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Menu Item
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl p-4 space-y-4" style={{ background: '#141414', border: '1px solid rgba(200,151,42,0.13)' }}>
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#a89070' }} />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={inputFocusHandler}
                onBlur={inputBlurHandler}
                style={{
                  ...inputStyle,
                  paddingLeft: '40px',
                }}
              />
            </div>
          </div>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            onFocus={inputFocusHandler}
            onBlur={inputBlurHandler}
            style={{
              background: '#1c1c1c',
              border: '1px solid rgba(200,151,42,0.2)',
              borderRadius: '10px',
              padding: '10px 14px',
              color: '#f8f4ed',
              outline: 'none',
            }}
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.name} value={cat.name}>
                {formatCategoryName(cat.name)} ({cat.count})
              </option>
            ))}
          </select>

          {/* Veg Filter */}
          <select
            value={filterVeg}
            onChange={(e) => setFilterVeg(e.target.value as 'all' | 'veg' | 'nonveg')}
            onFocus={inputFocusHandler}
            onBlur={inputBlurHandler}
            style={{
              background: '#1c1c1c',
              border: '1px solid rgba(200,151,42,0.2)',
              borderRadius: '10px',
              padding: '10px 14px',
              color: '#f8f4ed',
              outline: 'none',
            }}
          >
            <option value="all">All Types</option>
            <option value="veg">Veg Only</option>
            <option value="nonveg">Non-Veg Only</option>
          </select>
        </div>
      </div>

      {/* Menu Items Grid */}
      {loading ? (
        <div className="text-center py-12" style={{ color: '#a89070' }}>Loading...</div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12" style={{ color: '#a89070' }}>No menu items found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <motion.div
              key={item._id}
              style={{
                background: '#141414',
                border: '1px solid rgba(200,151,42,0.13)',
                borderRadius: '16px',
                padding: '16px',
              }}
              className="transition-colors hover:border-[rgba(200,151,42,0.35)]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold" style={{ color: '#f8f4ed' }}>{item.name}</h3>
                    <span
                      style={item.isVeg
                        ? { background: 'rgba(34,197,94,0.1)', color: '#22c55e', padding: '2px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 700 }
                        : { background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '2px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 700 }
                      }
                    >
                      {item.isVeg ? '🟢 Veg' : '🔴 Non-Veg'}
                    </span>
                    {!item.available && (
                      <span style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '2px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 700 }}>
                        Unavailable
                      </span>
                    )}
                  </div>
                  <p className="text-sm mb-2" style={{ color: '#a89070' }}>{item.description}</p>
                  <p className="text-xl font-bold" style={{ color: '#f0c060' }}>
                    ₹{item.price.toFixed(2)}
                  </p>
                  <p className="text-xs mt-1 capitalize" style={{ color: '#6b5040' }}>{item.category}</p>
                  <div className="mt-2 relative">
                    {item.image ? (
                      <div className="w-full h-32 rounded-lg overflow-hidden group relative" style={{ background: '#1c1c1c' }}>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
                          <button
                            onClick={() => handleQuickImageUpdate(item)}
                            disabled={uploadingImage}
                            style={{
                              background: 'linear-gradient(135deg,#8b5a00,#c8972a,#f0c060)',
                              color: '#080808',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '4px 12px',
                              fontSize: '13px',
                              fontWeight: 600,
                            }}
                            className="disabled:opacity-50 flex items-center gap-2 transition-colors"
                            title="Update Image"
                          >
                            <Upload className="w-4 h-4" />
                            {uploadingImage ? 'Uploading...' : 'Change Image'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="w-full h-32 rounded-lg flex items-center justify-center group transition-colors"
                        style={{ background: '#1c1c1c', border: '2px dashed rgba(200,151,42,0.2)' }}
                      >
                        <button
                          onClick={() => handleQuickImageUpdate(item)}
                          disabled={uploadingImage}
                          className="transition-colors flex flex-col items-center gap-2 disabled:opacity-50"
                          style={{ color: '#6b5040', background: 'none', border: 'none', cursor: 'pointer' }}
                          title="Add Image"
                        >
                          <Upload className="w-6 h-6" />
                          <span className="text-xs">Click to add image</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleEdit(item)}
                  className="flex-1 flex items-center justify-center gap-2 rounded transition-colors"
                  style={{
                    background: 'rgba(96,165,250,0.1)',
                    color: '#60a5fa',
                    border: '1px solid rgba(96,165,250,0.2)',
                    padding: '8px 12px',
                    borderRadius: '8px',
                  }}
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="flex-1 flex items-center justify-center gap-2 rounded transition-colors"
                  style={{
                    background: 'rgba(239,68,68,0.1)',
                    color: '#ef4444',
                    border: '1px solid rgba(239,68,68,0.2)',
                    padding: '8px 12px',
                    borderRadius: '8px',
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
            <motion.div
              style={{
                background: '#141414',
                border: '1px solid rgba(200,151,42,0.2)',
                borderRadius: '18px',
                boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
                padding: '24px',
                width: '100%',
                maxWidth: '672px',
                maxHeight: '90vh',
                overflowY: 'auto',
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#f8f4ed' }}>
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#a89070' }}>
                      Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      onFocus={inputFocusHandler}
                      onBlur={inputBlurHandler}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#a89070' }}>
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      onFocus={inputFocusHandler}
                      onBlur={inputBlurHandler}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#a89070' }}>
                    Description *
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    onFocus={inputFocusHandler}
                    onBlur={inputBlurHandler}
                    rows={3}
                    style={{
                      ...inputStyle,
                      resize: 'vertical',
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#a89070' }}>
                      Category *
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      onFocus={inputFocusHandler}
                      onBlur={inputBlurHandler}
                      style={inputStyle}
                    >
                      {categories.length > 0 ? (
                        categories.map((cat) => (
                          <option key={cat.name} value={cat.name}>
                            {formatCategoryName(cat.name)}
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="appetizer">Appetizer</option>
                          <option value="main">Main Course</option>
                          <option value="dessert">Dessert</option>
                          <option value="beverage">Beverage</option>
                          <option value="salad">Salad</option>
                          <option value="soup">Soup</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#a89070' }}>
                      <ImageIcon className="w-4 h-4 inline mr-2" />
                      Image
                    </label>
                    <div className="space-y-3">
                      {/* Image Preview */}
                      {imagePreview && (
                        <div className="relative w-full h-48 rounded-lg overflow-hidden group" style={{ background: '#1c1c1c', border: '1px solid rgba(200,151,42,0.2)' }}>
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview('');
                              setImageFile(null);
                              setFormData({ ...formData, image: '' });
                            }}
                            className="absolute top-2 right-2 p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                            style={{ background: 'rgba(239,68,68,0.8)', color: '#fff', border: 'none' }}
                            title="Remove Image"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <div className="absolute bottom-2 left-2 text-xs px-2 py-1 rounded" style={{ background: 'rgba(0,0,0,0.7)', color: '#f8f4ed' }}>
                            Preview
                          </div>
                        </div>
                      )}

                      {/* File Input */}
                      <div className="relative">
                        <label
                          className="flex flex-col items-center justify-center w-full h-32 rounded-lg cursor-pointer transition-colors"
                          style={{ border: '2px dashed rgba(200,151,42,0.25)', background: '#1c1c1c' }}
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            {imagePreview ? (
                              <ImageIcon className="w-10 h-10 mb-3" style={{ color: '#c8972a' }} />
                            ) : (
                              <Upload className="w-10 h-10 mb-3" style={{ color: '#6b5040' }} />
                            )}
                            <p className="mb-2 text-sm" style={{ color: '#a89070' }}>
                              <span className="font-semibold" style={{ color: '#c8972a' }}>Click to upload</span> or drag and drop
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
                          <div className="mt-2 flex items-center gap-2 text-xs">
                            <span style={{ color: '#22c55e' }}>✓ Selected:</span>
                            <span style={{ color: '#a89070' }}>{imageFile.name}</span>
                            <span style={{ color: '#6b5040' }}>
                              ({(imageFile.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                        )}
                        {formData.image && !imageFile && (
                          <div className="mt-2 text-xs" style={{ color: '#a89070' }}>
                            Current image will be kept if no new file is selected
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 flex-wrap">
                  <label
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors cursor-pointer"
                    style={formData.isVeg
                      ? { background: 'rgba(34,197,94,0.1)', border: '2px solid #22c55e', color: '#22c55e' }
                      : { background: '#1c1c1c', border: '2px solid rgba(200,151,42,0.2)', color: '#a89070' }
                    }
                  >
                    <input
                      type="checkbox"
                      checked={formData.isVeg}
                      onChange={(e) => setFormData({ ...formData, isVeg: e.target.checked })}
                      className="w-4 h-4 rounded"
                    />
                    <span className="font-semibold">🟢 Vegetarian</span>
                  </label>
                  <label
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors cursor-pointer"
                    style={!formData.isVeg
                      ? { background: 'rgba(239,68,68,0.1)', border: '2px solid #ef4444', color: '#ef4444' }
                      : { background: '#1c1c1c', border: '2px solid rgba(200,151,42,0.2)', color: '#a89070' }
                    }
                  >
                    <input
                      type="checkbox"
                      checked={!formData.isVeg}
                      onChange={(e) => setFormData({ ...formData, isVeg: !e.target.checked })}
                      className="w-4 h-4 rounded"
                    />
                    <span className="font-semibold">🔴 Non-Vegetarian</span>
                  </label>
                  <label
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border-2"
                    style={{ background: '#1c1c1c', border: '2px solid rgba(200,151,42,0.2)', color: '#a89070' }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.available}
                      onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                      className="w-4 h-4 rounded"
                    />
                    <span>Available</span>
                  </label>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={uploadingImage}
                    className="flex-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{
                      background: 'linear-gradient(135deg,#8b5a00,#c8972a,#f0c060)',
                      color: '#080808',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '10px 16px',
                      fontWeight: 700,
                    }}
                  >
                    {uploadingImage ? (
                      <>
                        <div
                          className="w-4 h-4 rounded-full animate-spin"
                          style={{ border: '3px solid rgba(200,151,42,0.2)', borderTopColor: '#c8972a' }}
                        />
                        Uploading...
                      </>
                    ) : (
                      editingItem ? 'Update' : 'Create'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 transition-colors"
                    style={{
                      border: '1px solid rgba(200,151,42,0.3)',
                      color: '#c8972a',
                      background: 'transparent',
                      borderRadius: '10px',
                      padding: '10px 16px',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
