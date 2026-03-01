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
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
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

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
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

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Menu Management</h1>
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
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
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
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Menu Item
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-900 rounded-xl p-4 space-y-4">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
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
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Types</option>
            <option value="veg">Veg Only</option>
            <option value="nonveg">Non-Veg Only</option>
          </select>
        </div>
      </div>

      {/* Menu Items Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading...</div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 text-slate-400">No menu items found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <motion.div
              key={item._id}
              className="bg-slate-900 rounded-xl p-4 border border-slate-800 hover:border-orange-600 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        item.isVeg ? 'bg-green-600' : 'bg-red-600'
                      } text-white`}
                    >
                      {item.isVeg ? '🟢 Veg' : '🔴 Non-Veg'}
                    </span>
                    {!item.available && (
                      <span className="px-2 py-1 rounded text-xs bg-red-600 text-white">
                        Unavailable
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 mb-2">{item.description}</p>
                  <p className="text-xl font-bold text-orange-600">
                    ₹{item.price.toFixed(2)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 capitalize">{item.category}</p>
                  <div className="mt-2 relative">
                    {item.image ? (
                      <div className="w-full h-32 bg-slate-800 rounded-lg overflow-hidden group relative">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            onClick={() => handleQuickImageUpdate(item)}
                            disabled={uploadingImage}
                            className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
                            title="Update Image"
                          >
                            <Upload className="w-4 h-4" />
                            {uploadingImage ? 'Uploading...' : 'Change Image'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-32 bg-slate-800 rounded-lg border-2 border-dashed border-slate-700 flex items-center justify-center group hover:border-orange-600 transition-colors">
                        <button
                          onClick={() => handleQuickImageUpdate(item)}
                          disabled={uploadingImage}
                          className="text-slate-400 group-hover:text-orange-600 transition-colors flex flex-col items-center gap-2 disabled:opacity-50"
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
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded transition-colors"
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
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              className="bg-slate-900 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <h2 className="text-2xl font-bold text-white mb-4">
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Category *
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      <ImageIcon className="w-4 h-4 inline mr-2" />
                      Image
                    </label>
                    <div className="space-y-3">
                      {/* Image Preview */}
                      {imagePreview && (
                        <div className="relative w-full h-48 bg-slate-800 rounded-lg overflow-hidden border border-slate-700 group">
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
                            className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                            title="Remove Image"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            Preview
                          </div>
                        </div>
                      )}
                      
                      {/* File Input */}
                      <div className="relative">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-700 border-dashed rounded-lg cursor-pointer bg-slate-800 hover:bg-slate-750 hover:border-orange-600 transition-colors">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            {imagePreview ? (
                              <ImageIcon className="w-10 h-10 mb-3 text-orange-600" />
                            ) : (
                              <Upload className="w-10 h-10 mb-3 text-slate-400" />
                            )}
                            <p className="mb-2 text-sm text-slate-400">
                              <span className="font-semibold text-orange-600">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-slate-500">
                              JPEG, PNG, GIF, WebP (MAX. 5MB)
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
                            <span className="text-green-400">✓ Selected:</span>
                            <span className="text-slate-400">{imageFile.name}</span>
                            <span className="text-slate-500">
                              ({(imageFile.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                        )}
                        {formData.image && !imageFile && (
                          <div className="mt-2 text-xs text-slate-400">
                            Current image will be kept if no new file is selected
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 flex-wrap">
                  <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors cursor-pointer ${
                    formData.isVeg 
                      ? 'bg-green-600/20 border-green-600 text-green-400' 
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-green-600'
                  }`}>
                    <input
                      type="checkbox"
                      checked={formData.isVeg}
                      onChange={(e) => setFormData({ ...formData, isVeg: e.target.checked })}
                      className="w-4 h-4 rounded"
                    />
                    <span className="font-semibold">🟢 Vegetarian</span>
                  </label>
                  <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors cursor-pointer ${
                    !formData.isVeg 
                      ? 'bg-red-600/20 border-red-600 text-red-400' 
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-red-600'
                  }`}>
                    <input
                      type="checkbox"
                      checked={!formData.isVeg}
                      onChange={(e) => setFormData({ ...formData, isVeg: !e.target.checked })}
                      className="w-4 h-4 rounded"
                    />
                    <span className="font-semibold">🔴 Non-Vegetarian</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-300 px-4 py-2 rounded-lg border-2 border-slate-700 bg-slate-800">
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
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {uploadingImage ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors"
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
