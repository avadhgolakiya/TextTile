'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { productApi, orderApi, authApi, bannerApi, categoryApi } from '@/lib/api-client';
import { DesktopTopBar } from '@/components/DesktopTopBar';
import { toast } from '@/lib/toast';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { Product, OrderItem, Category } from '@/lib/types';
import { formatInr } from '@/lib/formatting/inr';
import Image from 'next/image';
import { getFullImageUrl, isVideoUrl, isValidImageUrl } from '@/lib/image';

function getToken() {
  if (typeof document === 'undefined') return '';
  return document.cookie.split('; ').find((row) => row.startsWith('token='))?.split('=')[1] ?? '';
}

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'orders' | 'buyers' | 'banners' | 'system-admins'>('products');
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // States for lists
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [orderFilter, setOrderFilter] = useState<'all' | 'user' | 'manual'>('all');
  const [buyers, setBuyers] = useState<{ id: string; name: string; email?: string; phone: string; orders: number; isBlocked: boolean }[]>([]);
  const [buyerSearchQuery, setBuyerSearchQuery] = useState('');
  const [banners, setBanners] = useState<{ id: string; image_url: string; redirect_url: string; sort_order: number }[]>([]);
  const [systemAdmins, setSystemAdmins] = useState<{ id: string; email: string; name: string }[]>([]);

  // States for IP Management
  const [isIpModalOpen, setIsIpModalOpen] = useState(false);
  const [selectedBuyerForIp, setSelectedBuyerForIp] = useState<{ id: string; name: string; email?: string; phone?: string; isBlocked: boolean } | null>(null);
  const [buyerIps, setBuyerIps] = useState<{ id: string; ipAddress: string; detectedAt: string; source: string }[]>([]);

  // States for product form modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [formCategory, setFormCategory] = useState<Partial<Category>>({});
  const [isUploadingCategoryIcon, setIsUploadingCategoryIcon] = useState(false);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [formProduct, setFormProduct] = useState<Partial<Product> & { id: string }>({
    id: '',
    name: '',
    subtitle: '',
    price: null,
    originalPrice: null,
    imageUrl: '',
    imageUrls: [],
    badge: null,
    categoryKey: '',
    isVisible: true,
    sareeSet: '',
    stock: 0,
  });
  const [isFeatured, setIsFeatured] = useState(false);
  const [isSetProduct, setIsSetProduct] = useState(false);

  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [newBannerUrl, setNewBannerUrl] = useState('');
  const [newRedirectUrl, setNewRedirectUrl] = useState('');
  const [draggedBannerId, setDraggedBannerId] = useState<string | null>(null);

  // States for file uploading
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadingCategoryIcon, setUploadingCategoryIcon] = useState(false);
  const [categoryUploadError, setCategoryUploadError] = useState<string | null>(null);

  // States for manual order form
  const [isManualOrderOpen, setIsManualOrderOpen] = useState(false);
  const [savingManualOrder, setSavingManualOrder] = useState(false);
  const [manualOrderForm, setManualOrderForm] = useState({
    buyerName: '',
    itemName: '',
    quantity: 1,
    price: '',
    imageUrl: '',
  });

  // States for system admins
  const [isCreateAdminOpen, setIsCreateAdminOpen] = useState(false);
  const [createAdminForm, setCreateAdminForm] = useState({ name: '', email: '', password: '' });
  const [selectedAdminActivity, setSelectedAdminActivity] = useState<{ adminName: string; logs: any[] } | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace('/login');
      return;
    }

    // Verify if user is admin
    authApi.me(token)
      .then(({ user }) => {
        if (!user.isAdmin) {
          toast.error('Access denied: Admin only');
          router.replace('/home');
          return;
        }
        setIsSuperAdmin(user.isSuperAdmin || false);
        // Load default tab data
        loadTabData('products');
        // Pre-fetch categories for the Add Product dropdown
        categoryApi.fetchCategories().then(res => setCategories(res.categories || [])).catch(console.error);
      })
      .catch((err) => {
        console.error(err);
        router.replace('/login');
      });
  }, []);

  async function loadTabData(tab: typeof activeTab) {
    setLoading(true);
    const token = getToken();
    try {
      if (tab === 'products') {
        const res = await productApi.fetchAllAdmin(token);
        setProducts(res.products);
      } else if (tab === 'categories') {
        const { categories: cats } = await categoryApi.fetchCategories();
        setCategories(cats || []);
      } else if (tab === 'orders') {
        const res = await orderApi.fetchAllAdmin(token);
        setOrders(res.orders);
      } else if (tab === 'buyers') {
        const res = await authApi.fetchBuyersAdmin(token);
        setBuyers(res.buyers);
      } else if (tab === 'banners') {
        const res = await bannerApi.fetchAllAdmin(token);
        setBanners(res.banners);
      } else if (tab === 'system-admins') {
        const res = await authApi.fetchAdmins(token);
        setSystemAdmins(res.admins);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleTabChange(tab: typeof activeTab) {
    setActiveTab(tab);
    loadTabData(tab);
  }

  // --- Products Tab CRUD Actions ---

  async function toggleProductVisibility(p: Product) {
    const token = getToken();
    const target = !p.isVisible;
    // Optimistic UI update
    setProducts(products.map((x) => (x.id === p.id ? { ...x, isVisible: target } : x)));

    try {
      await productApi.setVisibility(token, p.id, target);
    } catch (err) {
      console.error(err);
      // Revert on error
      setProducts(products.map((x) => (x.id === p.id ? { ...x, isVisible: p.isVisible } : x)));
    }
  }

  async function deleteProduct(p: Product) {
    const ok = await toast.confirm(
      `Are you sure you want to permanently delete "${p.name}"?`,
    );
    if (!ok) return;
    const token = getToken();
    try {
      await productApi.delete(token, p.id);
      setProducts(products.filter((x) => x.id !== p.id));
      toast.success(`"${p.name}" deleted`);
    } catch (err) {
      toast.error(`Delete failed: ${err}`);
    }
  }

  async function sendProductNotification(p: Product) {
    const ok = await toast.confirm(`Send a push notification for "${p.name}"?`);
    if (!ok) return;
    const token = getToken();
    try {
      await productApi.notify(token, p.id);
      toast.success(`Notification sent for "${p.name}"`);
    } catch (err) {
      toast.error(`Failed to send notification: ${err}`);
    }
  }

  function openEditProduct(p: Product) {
    setFormProduct({
      id: p.id,
      _oldId: p.id,
      name: p.name,
      subtitle: p.subtitle,
      price: p.price,
      originalPrice: p.originalPrice,
      imageUrl: p.imageUrl,
      badge: p.badge,
      categoryKey: p.categoryKey || '',
      imageUrls: Array.from(new Set([p.imageUrl, ...(p.imageUrls || [])])).filter(Boolean) as string[],
      isVisible: p.isVisible !== false,
      sareeSet: p.sareeSet,
      stock: p.stock ?? 0,
    } as any);
    setIsFeatured(p.isFeatured || false);
    setIsSetProduct(!!p.sareeSet);
    setIsEditingMode(true);
    setIsFormOpen(true);
  }

  function openAddProduct() {
    setFormProduct({
      id: '',
      name: '',
      subtitle: '',
      price: null,
      originalPrice: null,
      imageUrl: '',
      imageUrls: [],
      badge: null,
      categoryKey: '',
      isVisible: true,
      sareeSet: '',
      stock: 0,
    });
    setIsFeatured(false);
    setIsSetProduct(false);
    setIsEditingMode(false);
    setIsFormOpen(true);
  }

  async function handleImageFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter((f) => f.size <= 5 * 1024 * 1024);
    if (validFiles.length < files.length) {
      setUploadError('Some files were too large. Max limit is 5MB per file.');
      if (validFiles.length === 0) return;
    }

    setUploadingImage(true);
    setUploadError(null);

    const token = getToken();
    try {
      const uploadPromises = validFiles.map((f) => productApi.uploadImage(token, f));
      const results = await Promise.all(uploadPromises);

      setFormProduct((prev) => {
        const newUrls = [...(prev.imageUrls || [])];
        let primaryUrl = prev.imageUrl;

        results.forEach((res) => {
          if (!newUrls.includes(res.imageUrl)) {
            newUrls.push(res.imageUrl);
          }
          if (!primaryUrl) {
            primaryUrl = res.imageUrl;
          }
        });

        return {
          ...prev,
          imageUrls: newUrls,
          imageUrl: primaryUrl,
        };
      });
      toast.success(
        results.length > 1 ? `${results.length} images uploaded successfully` : 'Image uploaded successfully'
      );
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || 'Image upload failed. Please try again.');
      toast.error('Failed to upload image(s)');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  }

  async function saveProductForm(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    try {
      const payload = {
        ...formProduct,
        name: formProduct.name ? formProduct.name.charAt(0).toUpperCase() + formProduct.name.slice(1) : formProduct.name,
        price: formProduct.price ? Number(formProduct.price) : null,
        originalPrice: formProduct.originalPrice ? Number(formProduct.originalPrice) : null,
        imageUrls: formProduct.imageUrls?.length ? formProduct.imageUrls : (formProduct.imageUrl ? [formProduct.imageUrl] : []),
        sareeSet: formProduct.sareeSet?.trim() || null,
        stock: Number(formProduct.stock) || 0,
      };
      await productApi.upsert(token, payload, isFeatured, (formProduct as any)._oldId);
      setIsFormOpen(false);
      loadTabData('products');
      toast.success('Product saved successfully');
    } catch (err) {
      toast.error(`Failed to save product: ${err}`);
    }
  }

  // --- Categories CRUD ---
  async function saveCategoryForm(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    try {
      if (!formCategory.name) return;
      await categoryApi.upsertCategory(token, formCategory.name, formCategory.icon);
      setIsCategoryFormOpen(false);
      loadTabData('categories');
      toast.success('Category saved successfully');
    } catch (err) {
      toast.error(`Failed to save category: ${err}`);
    }
  }

  async function handleCategoryIconUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setCategoryUploadError('File is too large. Max limit is 5MB.');
      toast.error('File too large');
      return;
    }

    setUploadingCategoryIcon(true);
    setCategoryUploadError(null);

    const token = getToken();
    try {
      const res = await productApi.uploadImage(token, file);
      setFormCategory((prev) => ({
        ...prev,
        icon: res.imageUrl,
      }));
      toast.success('Category icon uploaded successfully');
    } catch (err: any) {
      console.error(err);
      setCategoryUploadError(err.message || 'Upload failed');
      toast.error('Failed to upload category icon');
    } finally {
      setUploadingCategoryIcon(false);
      e.target.value = '';
    }
  }

  async function handleDeleteCategory(key: string) {
    if (!confirm('Are you sure you want to delete this category?')) return;
    const token = getToken();
    try {
      await categoryApi.deleteCategory(token, key);
      loadTabData('categories');
      toast.success('Category deleted');
    } catch (err) {
      toast.error(`Failed to delete category: ${err}`);
    }
  }

  function openEditCategory(c: Category) {
    setFormCategory(c);
    setIsCategoryFormOpen(true);
  }

  // --- Orders Tab CRUD Actions ---

  async function updateOrderStatus(order: OrderItem, status: string) {
    const token = getToken();
    // Optimistic UI update
    setOrders(orders.map((x) => (x.id === order.id ? { ...x, status: status as any } : x)));
    try {
      await orderApi.updateStatus(token, order.id, status);
    } catch (err) {
      console.error(err);
      // Revert on error
      setOrders(orders.map((x) => (x.id === order.id ? { ...x, status: order.status } : x)));
    }
  }

  async function submitManualOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!manualOrderForm.buyerName || !manualOrderForm.itemName || !manualOrderForm.price) return;
    
    setSavingManualOrder(true);
    const token = getToken();
    try {
      await orderApi.createManual(token, {
        buyerName: manualOrderForm.buyerName,
        itemName: manualOrderForm.itemName,
        quantity: Number(manualOrderForm.quantity) || 1,
        price: Number(manualOrderForm.price),
        imageUrl: manualOrderForm.imageUrl,
      });
      setIsManualOrderOpen(false);
      setManualOrderForm({ buyerName: '', itemName: '', quantity: 1, price: '', imageUrl: '' });
      toast.success('Manual order created successfully');
      loadTabData('orders');
    } catch (err) {
      console.error(err);
      toast.error('Failed to create manual order');
    } finally {
      setSavingManualOrder(false);
    }
  }

  async function uploadManualOrderImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File is too large. Max limit is 5MB.');
      return;
    }
    setUploadingImage(true);
    const token = getToken();
    try {
      const res = await productApi.uploadImage(token, file);
      setManualOrderForm((prev) => ({ ...prev, imageUrl: res.imageUrl }));
      toast.success('Image uploaded successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  }

  const filteredOrders = orders.filter((o) => {
    if (orderFilter === 'manual') return o.isManual;
    if (orderFilter === 'user') return !o.isManual;
    return true;
  });

  // --- Buyers Tab Actions ---

  async function toggleBlockBuyer(buyerId: string, currentStatus: boolean) {
    const newStatus = !currentStatus;
    const actionName = newStatus ? 'Block' : 'Unblock';
    
    const ok = await toast.confirm(`Are you sure you want to ${actionName.toLowerCase()} this user?`);
    if (!ok) return;

    const token = getToken();
    // Optimistic UI update
    setBuyers(buyers.map((b) => (b.id === buyerId ? { ...b, isBlocked: newStatus } : b)));
    
    try {
      await authApi.toggleBlockBuyer(token, buyerId, newStatus);
      toast.success(`User successfully ${newStatus ? 'blocked' : 'unblocked'}`);
    } catch (err) {
      console.error(err);
      toast.error(`Failed to ${actionName.toLowerCase()} user`);
      // Revert on error
      setBuyers(buyers.map((b) => (b.id === buyerId ? { ...b, isBlocked: currentStatus } : b)));
    }
  }

  async function openIpModal(buyer: { id: string; name: string; email?: string; phone: string; isBlocked: boolean }) {
    setSelectedBuyerForIp(buyer);
    setIsIpModalOpen(true);
    setBuyerIps([]);
    try {
      const token = getToken();
      const res = await authApi.fetchBuyerIps(token, buyer.id);
      setBuyerIps(res.ips || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load IPs');
    }
  }

  // --- Banners Tab CRUD Actions ---

  async function addBanner(e: React.FormEvent) {
    e.preventDefault();
    if (!newBannerUrl.trim()) return;
    const token = getToken();
    try {
      await bannerApi.add(token, newBannerUrl.trim(), newRedirectUrl.trim(), banners.length);
      setIsBannerModalOpen(false);
      setNewBannerUrl('');
      setNewRedirectUrl('');
      loadTabData('banners');
      toast.success('Banner added');
    } catch (err) {
      toast.error(`Failed to add banner: ${err}`);
    }
  }

  async function deleteBanner(id: string) {
    const ok = await toast.confirm('Remove this banner?');
    if (!ok) return;
    const token = getToken();
    try {
      await bannerApi.delete(token, id);
      setBanners(banners.filter((b) => b.id !== id));
      toast.success('Banner removed');
    } catch (err) {
      toast.error(`Failed to delete banner: ${err}`);
    }
  }

  async function handleBannerDrop(targetId: string) {
    if (!draggedBannerId || draggedBannerId === targetId) return;
    
    const draggedIndex = banners.findIndex(b => b.id === draggedBannerId);
    const targetIndex = banners.findIndex(b => b.id === targetId);
    if (draggedIndex === -1 || targetIndex === -1) return;

    const newBanners = [...banners];
    const [draggedItem] = newBanners.splice(draggedIndex, 1);
    newBanners.splice(targetIndex, 0, draggedItem);
    
    // Optimistic update
    setBanners(newBanners);
    setDraggedBannerId(null);

    const token = getToken();
    try {
      await bannerApi.reorder(token, newBanners.map(b => b.id));
      toast.success('Slider order updated');
    } catch (err) {
      toast.error('Failed to save order');
      loadTabData('banners'); // revert
    }
  }

  async function uploadBannerImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const isVideo = file.type.startsWith('video/') || 
                    file.name.toLowerCase().endsWith('.mp4') || 
                    file.name.toLowerCase().endsWith('.webm') || 
                    file.name.toLowerCase().endsWith('.mov') || 
                    file.name.toLowerCase().endsWith('.ogg');
    
    const limit = isVideo ? 100 * 1024 * 1024 : 5 * 1024 * 1024;
    const limitMsg = isVideo ? '100MB' : '5MB';

    if (file.size > limit) {
      toast.error(`File is too large. Max limit for ${isVideo ? 'videos' : 'images'} is ${limitMsg}.`);
      return;
    }
    setUploadingImage(true);
    const token = getToken();
    try {
      const res = await productApi.uploadImage(token, file);
      setNewBannerUrl(res.imageUrl);
      toast.success('Image uploaded successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  }

  // --- System Admins Actions ---

  async function handleCreateAdmin(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    try {
      await authApi.createAdmin(token, createAdminForm);
      setIsCreateAdminOpen(false);
      setCreateAdminForm({ name: '', email: '', password: '' });
      toast.success('Admin created successfully');
      loadTabData('system-admins');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create admin');
    }
  }

  async function openAdminActivity(adminId: string, adminName: string) {
    const token = getToken();
    try {
      const res = await authApi.fetchAdminActivity(token, adminId);
      setSelectedAdminActivity({ adminName, logs: res.logs });
    } catch (err) {
      toast.error('Failed to load activity logs');
    }
  }

  async function handleDeleteAdmin(adminId: string, adminName: string) {
    if (!confirm(`Are you sure you want to delete the admin "${adminName}"?`)) return;
    const token = getToken();
    try {
      await authApi.deleteAdmin(token, adminId);
      toast.success('Admin deleted successfully');
      loadTabData('system-admins');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete admin');
    }
  }

  const tabs = [
    { id: 'products', label: 'Products', icon: '🛍️' },
    { id: 'categories', label: 'Categories', icon: '📁' },
    { id: 'orders', label: 'Orders', icon: '📦' },
    { id: 'buyers', label: 'Buyers' },
    { id: 'banners', label: 'Slider' },
    ...(isSuperAdmin ? [{ id: 'system-admins', label: 'System Admins' }] : []),
  ] as const;

  const uniqueSets = Array.from(
    new Set(
      products
        .filter((p) => !formProduct.categoryKey || p.categoryKey?.toLowerCase() === formProduct.categoryKey.toLowerCase())
        .map((p) => p.sareeSet)
        .filter((set): set is string => typeof set === 'string' && set.trim() !== '')
    )
  ).sort();

  const uniqueCategories = Array.from(
    new Set(
      products
        .map((p) => p.categoryKey)
        .filter((cat): cat is string => typeof cat === 'string' && cat.trim() !== '')
    )
  ).sort();

  return (
    <div className="min-h-screen bg-cream pb-24 font-sans text-text-primary lg:bg-transparent lg:pb-0">
      <DesktopTopBar title="Admin Panel" subtitle="Swastik Fashion management" />

      {/* Admin header — mobile only */}
      <div className="bg-gradient-to-br from-maroon-dark via-maroon to-[#8B1A2A] text-white px-6 pt-8 pb-4 shadow-md lg:hidden">
        <div className="flex items-center gap-3">
          <span className="text-xl">🛡️</span>
          <span className="text-xs uppercase tracking-[1.5px] font-semibold text-white/80">
            Admin Panel
          </span>
        </div>
        <h1 className="font-serif text-3xl font-bold mt-2">Swastik Fashion</h1>

        <div className="flex gap-4 overflow-x-auto mt-6 border-b border-white/20 scrollbar-none">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as any)}
                className={`pb-2.5 px-1 font-semibold text-sm transition shrink-0 ${
                  active ? 'text-gold border-b-2 border-gold font-bold' : 'text-white/60 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="desktop-split lg:max-w-none">
        {/* Desktop tab sidebar */}
        <aside className="hidden lg:block lg:sticky lg:top-8">
          <div className="card border border-divider p-3">
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id as any)}
                  className={`mb-1 w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                    active
                      ? 'bg-maroon text-white'
                      : 'text-text-secondary hover:bg-cream-deep hover:text-maroon'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </aside>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-6 py-6 lg:max-w-none lg:px-0 lg:py-0">
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner label={`Loading ${activeTab}…`} />
          </div>
        ) : (
          <div>
            {/* PRODUCTS TAB */}
            {activeTab === 'products' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-serif text-xl font-bold">Catalog List</h3>
                  <button onClick={openAddProduct} className="btn-primary py-2 px-5 text-xs">
                    + Add Product
                  </button>
                </div>
                
                <input
                  type="text"
                  placeholder="Search products by name or code..."
                  className="input-field max-w-md"
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                />

                <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0 xl:grid-cols-2">
                  {products
                    .filter(p => !productSearchQuery || p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) || p.id.toLowerCase().includes(productSearchQuery.toLowerCase()))
                    .map((p) => (
                    <div
                      key={p.id}
                      className={`card flex items-center justify-between p-4 border border-divider shadow-sm transition lg:hover:shadow-md ${
                        !p.isVisible ? 'bg-gray-100 opacity-75' : ''
                      }`}
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-cream-deep shrink-0 border border-divider">
                          {p.imageUrl ? (
                            <Image src={getFullImageUrl(p.imageUrl)} alt={p.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-text-secondary">
                              🖼️
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-sm truncate">{p.name}</h4>
                          <p className="text-xs text-text-secondary mt-0.5">
                            Code: {p.id} · Price: {p.price ? formatInr(p.price) : 'On Request'}
                          </p>
                          {!p.isVisible && (
                            <span className="inline-block bg-gray-300 text-gray-700 text-[10px] px-2 py-0.5 rounded mt-1 font-semibold">
                              Hidden
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => sendProductNotification(p)}
                          className="p-2 text-blue-600 hover:text-blue-800 transition text-lg"
                          title="Send notification"
                        >
                          🔔
                        </button>
                        <button
                          onClick={() => toggleProductVisibility(p)}
                          className="p-2 text-text-secondary hover:text-maroon transition text-lg"
                          title={p.isVisible ? 'Hide from public' : 'Show to public'}
                        >
                          {p.isVisible ? '👁️' : '🕶️'}
                        </button>
                        <button
                          onClick={() => openEditProduct(p)}
                          className="p-2 text-maroon hover:text-maroon-dark transition text-lg"
                          title="Edit product"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteProduct(p)}
                          className="p-2 text-red-600 hover:text-red-800 transition text-lg"
                          title="Delete product"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ORDERS TAB */}
            {activeTab === 'categories' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold font-serif">Categories</h3>
                  <button onClick={() => { setFormCategory({}); setIsCategoryFormOpen(true); }} className="btn-primary flex items-center gap-2 text-sm px-4 py-2">
                    <span className="text-lg">+</span> Add Category
                  </button>
                </div>
                
                <input
                  type="text"
                  placeholder="Search categories by name..."
                  className="input-field max-w-md"
                  value={categorySearchQuery}
                  onChange={(e) => setCategorySearchQuery(e.target.value)}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories
                    .filter((c) => !categorySearchQuery || c.name.toLowerCase().includes(categorySearchQuery.toLowerCase()))
                    .map((c) => (
                    <div key={c.key} className="bg-surface border border-divider rounded-lg p-4 flex justify-between items-center shadow-sm">
                      <div className="flex items-center gap-3">
                        {c.icon && isValidImageUrl(c.icon) ? (
                          <div className="w-10 h-10 rounded-full overflow-hidden border border-divider relative shrink-0">
                            <Image
                              src={getFullImageUrl(c.icon)}
                              alt={c.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <span className="text-2xl shrink-0">{c.icon || '📁'}</span>
                        )}
                        <span className="font-semibold">{c.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEditCategory(c)} className="p-2 text-maroon hover:text-maroon-dark transition text-lg" title="Edit">✏️</button>
                        <button onClick={() => handleDeleteCategory(c.key)} className="p-2 text-red-500 hover:text-red-700 transition text-lg" title="Delete">🗑️</button>
                      </div>
                    </div>
                  ))}
                  {categories.length === 0 && (
                    <div className="col-span-full py-8 text-center text-text-secondary border border-dashed border-divider rounded-lg">
                      No categories found. Add your first category!
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="font-serif text-xl font-bold">Manage Orders</h3>
                  <button onClick={() => setIsManualOrderOpen(true)} className="btn-primary py-2 px-5 text-xs self-start sm:self-auto">
                    + Add Manual Order
                  </button>
                </div>

                {/* Filters */}
                <div className="flex gap-2 p-1 bg-cream-deep rounded-xl border border-divider w-full sm:max-w-md">
                  {[
                    { id: 'all', label: 'All Orders' },
                    { id: 'user', label: 'User Orders' },
                    { id: 'manual', label: 'Manual Orders' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setOrderFilter(f.id as any)}
                      className={`flex-1 text-xs font-bold py-2 rounded-lg transition ${
                        orderFilter === f.id
                          ? 'bg-surface text-maroon shadow-sm border border-divider'
                          : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-5 lg:space-y-0">
                  {filteredOrders.map((o) => (
                    <div
                      key={o.id}
                      className="card p-5 border border-divider shadow-sm space-y-4"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-sm flex items-center gap-2">
                            Order ID: {o.id.slice(0, 8).toUpperCase()}
                            {o.isManual && (
                              <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide">
                                Manual
                              </span>
                            )}
                          </h4>
                          {o.buyerName && (
                            <p className="text-xs font-semibold text-text-primary mt-1">
                              Client: {o.buyerName}
                            </p>
                          )}
                          <p className="text-xs text-text-secondary mt-0.5">
                            {o.title} · {o.dateLabel}
                          </p>
                        </div>
                        <span className="text-sm font-bold text-maroon">{formatInr(o.total)}</span>
                      </div>

                      {/* Display Items */}
                      {o.items && o.items.length > 0 && (
                        <div className="bg-cream-deep p-3 rounded-lg border border-divider">
                          <h5 className="text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">Order Items</h5>
                          <div className="space-y-2">
                            {o.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setFormProduct({ ...item, _oldId: item.id } as any); setIsEditingMode(true); setIsFormOpen(true); }}>
                                  {item.imageUrl && (
                                    <div className="w-8 h-8 relative rounded overflow-hidden border border-divider shrink-0 bg-white">
                                      <Image src={getFullImageUrl(item.imageUrl)} alt={item.name} fill className="object-cover" />
                                    </div>
                                  )}
                                  <div>
                                    <p className="font-semibold">{item.name}</p>
                                    <p className="text-xs text-text-secondary">Code: {item.code}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold">{formatInr(item.price)}</p>
                                  <p className="text-xs text-text-secondary">Qty: {item.qty}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Status selectors */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {['pending', 'processing', 'delivered'].map((st) => {
                          const active = o.status === st;
                          return (
                            <button
                              key={st}
                              onClick={() => updateOrderStatus(o, st)}
                              className={`text-xs px-3 py-1.5 rounded-lg font-bold border transition ${
                                active
                                  ? 'bg-maroon text-white border-transparent'
                                  : 'bg-cream text-text-secondary border-divider hover:bg-cream-deep'
                              }`}
                            >
                              {st.charAt(0).toUpperCase() + st.slice(1)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BUYERS TAB */}
            {activeTab === 'buyers' && (
              <div className="space-y-4">
                <h3 className="font-serif text-xl font-bold">Registered Users</h3>

                <input
                  type="text"
                  placeholder="Search by email or name..."
                  className="input-field max-w-md"
                  value={buyerSearchQuery}
                  onChange={(e) => setBuyerSearchQuery(e.target.value)}
                />

                <div className="space-y-3">
                  {buyers
                    .filter(b => 
                      !buyerSearchQuery || 
                      b.email?.toLowerCase().includes(buyerSearchQuery.toLowerCase()) ||
                      b.name.toLowerCase().includes(buyerSearchQuery.toLowerCase())
                    )
                    .map((b) => (
                    <div
                      key={b.id}
                      className={`card flex items-center justify-between p-4 border shadow-sm transition ${
                        b.isBlocked ? 'bg-red-50/50 border-red-200' : 'border-divider'
                      }`}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className={`w-11 h-11 rounded-full text-white font-bold flex items-center justify-center text-sm font-serif shrink-0 ${
                          b.isBlocked ? 'bg-red-800' : 'bg-maroon'
                        }`}>
                          {b.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 pr-4">
                          <h4 className="font-semibold text-sm truncate flex items-center gap-2">
                            {b.name}
                            {b.isBlocked && (
                              <span className="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide">
                                Blocked
                              </span>
                            )}
                          </h4>
                          <p className="text-xs text-text-secondary mt-0.5 truncate">
                            {b.phone} {b.email ? `· ${b.email}` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="hidden sm:inline-block bg-gold/15 text-gold text-xs px-3 py-1.5 rounded-lg font-bold">
                          {b.orders} orders
                        </span>
                        <button
                          onClick={() => openIpModal(b)}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg transition border bg-surface text-text-secondary border-divider hover:bg-cream-deep"
                        >
                          Data & IPs
                        </button>
                        <button
                          onClick={() => toggleBlockBuyer(b.id, b.isBlocked)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg transition border ${
                            b.isBlocked 
                              ? 'bg-surface text-red-700 border-red-200 hover:bg-red-50' 
                              : 'bg-surface text-text-secondary border-divider hover:text-red-600 hover:border-red-200'
                          }`}
                        >
                          {b.isBlocked ? 'Unblock' : 'Block'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BANNERS TAB */}
            {activeTab === 'banners' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-serif text-xl font-bold">Slider Banners</h3>
                  <button onClick={() => { setNewBannerUrl(''); setNewRedirectUrl(''); setIsBannerModalOpen(true); }} className="btn-primary py-2 px-5 text-xs">
                    + Add Slide
                  </button>
                </div>

                <div className="space-y-3">
                  {banners.map((b) => (
                    <div
                      key={b.id}
                      draggable
                      onDragStart={() => setDraggedBannerId(b.id)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleBannerDrop(b.id)}
                      className={`card flex items-center justify-between p-3 border shadow-sm cursor-grab active:cursor-grabbing transition-colors ${
                        draggedBannerId === b.id ? 'opacity-50 border-maroon' : 'border-divider hover:border-maroon/30'
                      }`}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="text-text-secondary cursor-grab p-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" /></svg>
                        </div>
                        <div className="relative w-28 h-16 rounded-lg overflow-hidden bg-cream-deep shrink-0 border border-divider">
                          {isVideoUrl(b.image_url) ? (
                            <video src={getFullImageUrl(b.image_url)} muted className="w-full h-full object-cover" />
                          ) : (
                            <Image src={getFullImageUrl(b.image_url)} alt="Banner" fill className="object-cover" />
                          )}
                        </div>
                        <p className="text-xs text-text-secondary truncate flex-1 leading-relaxed">
                          {b.image_url}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteBanner(b.id)}
                        className="p-2 text-red-600 hover:text-red-800 transition text-lg ml-4"
                        title="Remove image"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                  {banners.length === 0 && (
                    <p className="text-sm text-text-secondary">No slider images uploaded yet.</p>
                  )}
                </div>
              </div>
            )}

            {/* SYSTEM ADMINS TAB */}
            {isSuperAdmin && activeTab === 'system-admins' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-serif text-xl font-bold">System Admins</h3>
                  <button onClick={() => setIsCreateAdminOpen(true)} className="btn-primary py-2 px-5 text-xs">
                    + Create Admin
                  </button>
                </div>

                <div className="space-y-3">
                  {systemAdmins.map((admin) => (
                    <div
                      key={admin.id}
                      className="card flex items-center justify-between p-4 border border-divider shadow-sm transition hover:border-maroon/30 cursor-pointer"
                      onClick={() => openAdminActivity(admin.id, admin.name)}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-11 h-11 rounded-full bg-maroon text-white font-bold flex items-center justify-center text-sm font-serif shrink-0">
                          {admin.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 pr-4">
                          <h4 className="font-semibold text-sm truncate flex items-center gap-2">
                            {admin.name}
                            {admin.email === 'admin@example.com' && (
                              <span className="bg-gold/20 text-gold text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide">
                                Super Admin
                              </span>
                            )}
                          </h4>
                          <p className="text-xs text-text-secondary mt-0.5 truncate">
                            {admin.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {admin.email !== 'admin@example.com' && admin.email !== 'admin@admin.com' && admin.email !== 'swastik@example.com' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAdmin(admin.id, admin.name);
                            }}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition"
                            title="Delete Admin"
                          >
                            🗑️
                          </button>
                        )}
                        <div className="flex items-center gap-2 text-text-secondary">
                          <span className="text-xs font-semibold">View Activity</span>
                          <span>➡️</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      </div>

      {/* --- ADD/EDIT PRODUCT MODAL FORM --- */}
      {/* Category Modal */}
      {isCategoryFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-cream w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <header className="p-4 border-b border-divider flex justify-between items-center bg-surface">
              <h3 className="font-bold font-serif text-lg text-text">
                {formCategory.key ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button
                onClick={() => setIsCategoryFormOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 transition"
              >
                ✕
              </button>
            </header>

            <form onSubmit={saveCategoryForm} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary uppercase">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarees"
                  className="input-field"
                  value={formCategory.name || ''}
                  onChange={(e) => setFormCategory({ ...formCategory, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase block">Category Icon</label>
                
                {/* Upload Image Box */}
                <div className="border-[1.4px] border-dashed border-divider rounded-2xl p-4 bg-cream/40 flex flex-col items-center justify-center min-h-[120px] relative overflow-hidden group hover:border-maroon transition">
                  {formCategory.icon && isValidImageUrl(formCategory.icon) ? (
                    <div className="relative w-20 h-20 rounded-full overflow-hidden border border-divider">
                      <img
                        src={getFullImageUrl(formCategory.icon)}
                        alt="Category Icon Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setFormCategory({ ...formCategory, icon: '' })}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition font-bold text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-text-secondary py-2">
                      {uploadingCategoryIcon ? (
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="h-8 w-8 animate-spin rounded-full border-2 border-divider border-t-maroon" />
                          <p className="text-xs">Uploading file...</p>
                        </div>
                      ) : (
                        <div className="text-center space-y-1">
                          <span className="text-3xl block mb-1">🖼️</span>
                          <p className="text-xs font-semibold text-text-primary">Click to upload image</p>
                          <p className="text-[10px] text-text-secondary">PNG, JPG, WEBP up to 5MB</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Hidden File Input */}
                  {!uploadingCategoryIcon && !(formCategory.icon && isValidImageUrl(formCategory.icon)) && (
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      onChange={handleCategoryIconUpload}
                    />
                  )}
                </div>

                {categoryUploadError && (
                  <p className="text-xs text-red-500 font-semibold">{categoryUploadError}</p>
                )}

                {/* Paste URL or Emoji option */}
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-text-secondary block">Or enter Emoji / SVG / Image URL:</span>
                  <input
                    type="text"
                    placeholder="e.g. 🥻 or SVG string or image URL"
                    className="input-field py-3 text-xs"
                    value={formCategory.icon || ''}
                    onChange={(e) => setFormCategory({ ...formCategory, icon: e.target.value })}
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-divider flex justify-end gap-3">
                <button type="button" onClick={() => setIsCategoryFormOpen(false)} className="px-5 py-2.5 rounded-lg font-bold text-text hover:bg-black/5 transition">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4 py-8 overflow-y-auto">
          <div className="bg-surface rounded-card shadow-xl max-w-lg w-full max-h-[85vh] flex flex-col">
            <header className="px-6 py-4 border-b border-divider flex justify-between items-center shrink-0">
              <h3 className="font-serif text-xl font-bold">
                {isEditingMode ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="text-text-secondary text-lg hover:text-maroon p-1">
                ✕
              </button>
            </header>

            <form onSubmit={saveProductForm} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-secondary uppercase">Product SKU Code</label>
                  <input
                    type="text"
                    required
                    disabled={false}
                    placeholder="e.g. banarasi-1"
                    className="input-field"
                    value={formProduct.id}
                    onChange={(e) => setFormProduct({ ...formProduct, id: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-secondary uppercase">Category</label>
                  <select
                    className="input-field py-3.5"
                    required
                    value={formProduct.categoryKey || ''}
                    onChange={(e) => setFormProduct({ ...formProduct, categoryKey: e.target.value })}
                  >
                    <option value="" disabled>Select a Category</option>
                    {categories.map((c) => (
                      <option key={c.key} value={c.key}>{c.icon} {c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary uppercase">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pure Georgette Zari Saree"
                  className="input-field"
                  value={formProduct.name}
                  onChange={(e) => setFormProduct({ ...formProduct, name: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary uppercase">Subtitle/Description</label>
                <input
                  type="text"
                  placeholder="e.g. Detailed gold border embroidery, light weight"
                  className="input-field"
                  value={formProduct.subtitle || ''}
                  onChange={(e) => setFormProduct({ ...formProduct, subtitle: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-secondary uppercase">Wholesale Price (₹)</label>
                  <input
                    type="number"
                    placeholder="Optional"
                    className="input-field"
                    value={formProduct.price || ''}
                    onChange={(e) => setFormProduct({ ...formProduct, price: e.target.value ? Number(e.target.value) : null })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-secondary uppercase">Original Price</label>
                  <input
                    type="number"
                    placeholder="Optional"
                    className="input-field"
                    value={formProduct.originalPrice || ''}
                    onChange={(e) => setFormProduct({ ...formProduct, originalPrice: e.target.value ? Number(e.target.value) : null })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-secondary uppercase">Stock Qty</label>
                  <input
                    type="number"
                    placeholder="0"
                    className="input-field"
                    value={formProduct.stock || ''}
                    onChange={(e) => setFormProduct({ ...formProduct, stock: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase block">Product Images</label>
                
                {/* Visual Live Image Previews */}
                <div className="flex flex-wrap gap-4 mb-2">
                  {(formProduct.imageUrls || []).map((url, idx) => (
                    <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-divider group">
                      <img src={getFullImageUrl(url)} alt="preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          const newUrls = [...(formProduct.imageUrls || [])];
                          newUrls.splice(idx, 1);
                          setFormProduct({ ...formProduct, imageUrls: newUrls, imageUrl: newUrls.length > 0 ? newUrls[0] : '' });
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                      >✕</button>
                    </div>
                  ))}
                </div>

                <div className="border-[1.4px] border-dashed border-divider rounded-2xl p-4 bg-cream/40 flex flex-col items-center justify-center min-h-[120px] relative overflow-hidden group hover:border-maroon transition">
                  <div className="flex flex-col items-center justify-center text-text-secondary py-4">
                    {uploadingImage ? (
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-divider border-t-maroon" />
                        <p className="text-xs">Uploading file...</p>
                      </div>
                    ) : (
                      <div className="text-center space-y-1">
                        <span className="text-3xl block mb-1">🖼️</span>
                        <p className="text-xs font-semibold">Drag & drop or click to upload</p>
                        <p className="text-[10px] text-text-secondary">PNG, JPG, WEBP up to 5MB</p>
                      </div>
                    )}
                  </div>

                  {/* Hidden File Input */}
                  {!uploadingImage && (
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      onChange={handleImageFileUpload}
                    />
                  )}
                </div>

                {/* Paste URL option */}
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-text-secondary block">Or paste web image URL:</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/..."
                      className="input-field py-3 text-xs flex-1"
                      id="manual-url-input"
                    />
                    <button
                      type="button"
                      className="btn-primary px-4 py-2 text-xs"
                      onClick={() => {
                        const input = document.getElementById('manual-url-input') as HTMLInputElement;
                        if (input && input.value) {
                          const newUrls = [...(formProduct.imageUrls || []), input.value];
                          setFormProduct({ ...formProduct, imageUrls: newUrls, imageUrl: formProduct.imageUrl || input.value });
                          input.value = '';
                        }
                      }}
                    >Add</button>
                  </div>
                </div>
                {uploadError && (
                  <p className="text-xs text-red-600 font-medium mt-1">❌ {uploadError}</p>
                )}
              </div>

              {/* Product Type Selection */}
              <div className="space-y-2 border border-divider rounded-xl p-3 bg-surface">
                <label className="text-xs font-bold text-text-secondary uppercase">Product Type</label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 text-sm text-text-primary font-medium cursor-pointer">
                    <input
                      type="radio"
                      name="productType"
                      checked={!isSetProduct}
                      onChange={() => {
                        setIsSetProduct(false);
                        setFormProduct({ ...formProduct, sareeSet: '' });
                      }}
                      className="accent-maroon w-4 h-4"
                    />
                    Single Product
                  </label>
                  <label className="flex items-center gap-2 text-sm text-text-primary font-medium cursor-pointer">
                    <input
                      type="radio"
                      name="productType"
                      checked={isSetProduct}
                      onChange={() => setIsSetProduct(true)}
                      className="accent-maroon w-4 h-4"
                    />
                    Part of a Set
                  </label>
                </div>
              </div>

              {isSetProduct && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-secondary uppercase">Saree Set (Design Group)</label>
                  <input
                    list="saree-sets"
                    placeholder="e.g. Design 101, Floral-Zari-Set"
                    className="input-field"
                    value={formProduct.sareeSet || ''}
                    onChange={(e) => setFormProduct({ ...formProduct, sareeSet: e.target.value })}
                  />
                  <datalist id="saree-sets">
                    {uniqueSets.map((set) => (
                      <option key={set} value={set} />
                    ))}
                  </datalist>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary uppercase">Badge Text (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Best Seller, New, Premium"
                  className="input-field"
                  value={formProduct.badge || ''}
                  onChange={(e) => setFormProduct({ ...formProduct, badge: e.target.value })}
                />
              </div>

              <div className="flex gap-6 items-center pt-2">
                <label className="flex items-center gap-2 text-sm text-text-secondary font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-maroon accent-maroon"
                  />
                  Featured Product
                </label>

                <label className="flex items-center gap-2 text-sm text-text-secondary font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formProduct.isVisible}
                    onChange={(e) => setFormProduct({ ...formProduct, isVisible: e.target.checked })}
                    className="w-4 h-4 rounded text-maroon accent-maroon"
                  />
                  Visible to Public
                </label>
              </div>

              <button type="submit" className="btn-primary w-full h-12 mt-4">
                Save Product
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD MANUAL ORDER MODAL FORM --- */}
      {isManualOrderOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4 py-8 overflow-y-auto">
          <div className="bg-surface rounded-card shadow-xl max-w-lg w-full max-h-[85vh] flex flex-col">
            <header className="px-6 py-4 border-b border-divider flex justify-between items-center shrink-0">
              <h3 className="font-serif text-xl font-bold">Add Manual Order</h3>
              <button onClick={() => setIsManualOrderOpen(false)} className="text-text-secondary text-lg hover:text-maroon p-1">
                ✕
              </button>
            </header>

            <form onSubmit={submitManualOrder} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary uppercase">Client Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  className="input-field"
                  value={manualOrderForm.buyerName}
                  onChange={(e) => setManualOrderForm({ ...manualOrderForm, buyerName: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary uppercase">Product/Set Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Red Banarasi Saree Set"
                  className="input-field"
                  value={manualOrderForm.itemName}
                  onChange={(e) => setManualOrderForm({ ...manualOrderForm, itemName: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-secondary uppercase">Qty / Sets</label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="input-field"
                    value={manualOrderForm.quantity}
                    onChange={(e) => setManualOrderForm({ ...manualOrderForm, quantity: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-secondary uppercase">Price per item (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="Price"
                    className="input-field"
                    value={manualOrderForm.price}
                    onChange={(e) => setManualOrderForm({ ...manualOrderForm, price: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase block">Sari Photo (Optional)</label>
                
                <div className="border-[1.4px] border-dashed border-divider rounded-2xl p-4 bg-cream/40 flex flex-col items-center justify-center min-h-[160px] relative overflow-hidden group">
                  {manualOrderForm.imageUrl ? (
                    <div className="relative w-full h-[150px] flex flex-col items-center justify-center">
                      <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-divider">
                        <img
                          src={getFullImageUrl(manualOrderForm.imageUrl)}
                          alt="Product preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setManualOrderForm({ ...manualOrderForm, imageUrl: '' })}
                        className="mt-2 text-xs font-semibold text-red-600 hover:text-red-800 bg-surface shadow-sm border border-red-200 px-3 py-1 rounded-full hover:bg-red-50 transition"
                      >
                        Remove Image
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-text-secondary py-4">
                      {uploadingImage ? (
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="h-8 w-8 animate-spin rounded-full border-2 border-divider border-t-maroon" />
                          <p className="text-xs">Uploading file...</p>
                        </div>
                      ) : (
                        <div className="text-center space-y-1">
                          <span className="text-3xl block mb-1">🖼️</span>
                          <p className="text-xs font-semibold">Drag & drop or click to upload</p>
                        </div>
                      )}
                    </div>
                  )}

                  {!manualOrderForm.imageUrl && !uploadingImage && (
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      onChange={uploadManualOrderImage}
                    />
                  )}
                </div>
              </div>

              <button type="submit" disabled={savingManualOrder} className="btn-primary w-full h-12 mt-4">
                {savingManualOrder ? 'Saving...' : 'Save Manual Order'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD BANNER MODAL FORM --- */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-surface rounded-card shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-lg font-bold">Add Slider Slide</h3>
              <button onClick={() => setIsBannerModalOpen(false)} className="text-text-secondary hover:text-maroon text-lg p-1">
                ✕
              </button>
            </div>

            <form onSubmit={addBanner} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase block">File Upload (Image/Video)</label>
                
                <div className="border-[1.4px] border-dashed border-divider rounded-2xl p-4 bg-cream/40 flex flex-col items-center justify-center min-h-[160px] relative overflow-hidden group">
                  {newBannerUrl ? (
                    <div className="relative w-full h-[150px] flex flex-col items-center justify-center">
                      <div className="relative w-full h-full rounded-lg overflow-hidden border border-divider">
                        {isVideoUrl(newBannerUrl) ? (
                          <video
                            src={getFullImageUrl(newBannerUrl)}
                            controls
                            muted
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src={getFullImageUrl(newBannerUrl)}
                            alt="Slider preview"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setNewBannerUrl('')}
                        className="absolute bottom-2 text-xs font-semibold text-red-600 hover:text-red-800 bg-surface shadow-sm border border-red-200 px-3 py-1 rounded-full hover:bg-red-50 transition z-10"
                      >
                        Remove File
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-text-secondary py-4">
                      {uploadingImage ? (
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="h-8 w-8 animate-spin rounded-full border-2 border-divider border-t-maroon" />
                          <p className="text-xs">Uploading file...</p>
                        </div>
                      ) : (
                        <div className="text-center space-y-1">
                          <span className="text-3xl block mb-1">🖼️</span>
                          <p className="text-xs font-semibold">Drag & drop or click to upload (Image/Video)</p>
                        </div>
                      )}
                    </div>
                  )}

                  {!newBannerUrl && !uploadingImage && (
                    <input
                      type="file"
                      accept="image/*,video/*"
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                      onChange={uploadBannerImage}
                    />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase block">Redirect URL (Optional)</label>
                <input
                  type="text"
                  placeholder="https://example.com/collection"
                  className="input-field py-3 text-xs"
                  value={newRedirectUrl}
                  onChange={(e) => setNewRedirectUrl(e.target.value)}
                />
              </div>

              <button type="submit" disabled={!newBannerUrl || uploadingImage} className="btn-primary w-full h-12 mt-2">
                Save Image
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- CREATE ADMIN MODAL FORM --- */}
      {isCreateAdminOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-surface rounded-card shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-lg font-bold">Create New Admin</h3>
              <button onClick={() => setIsCreateAdminOpen(false)} className="text-text-secondary text-lg hover:text-maroon p-1">
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary uppercase">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Admin"
                  className="input-field"
                  value={createAdminForm.name}
                  onChange={(e) => setCreateAdminForm({ ...createAdminForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary uppercase">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="admin@swastik.com"
                  className="input-field"
                  value={createAdminForm.email}
                  onChange={(e) => setCreateAdminForm({ ...createAdminForm, email: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary uppercase">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="input-field"
                  value={createAdminForm.password}
                  onChange={(e) => setCreateAdminForm({ ...createAdminForm, password: e.target.value })}
                />
              </div>
              <button type="submit" className="btn-primary w-full h-11 mt-2">
                Create Admin Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- ADMIN ACTIVITY MODAL --- */}
      {selectedAdminActivity && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4 py-8 overflow-y-auto">
          <div className="bg-surface rounded-card shadow-xl max-w-lg w-full max-h-[85vh] flex flex-col">
            <header className="px-6 py-4 border-b border-divider flex justify-between items-center shrink-0 bg-cream">
              <div>
                <h3 className="font-serif text-xl font-bold">Activity Log</h3>
                <p className="text-xs text-text-secondary mt-0.5">{selectedAdminActivity.adminName}</p>
              </div>
              <button onClick={() => setSelectedAdminActivity(null)} className="text-text-secondary text-lg hover:text-maroon p-1">
                ✕
              </button>
            </header>

            <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-cream/30">
              {selectedAdminActivity.logs.length === 0 ? (
                <div className="text-center py-10 text-text-secondary">
                  <span className="text-3xl block mb-2">📭</span>
                  <p className="text-sm">No recent activity found.</p>
                </div>
              ) : (
                <div className="space-y-3 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                  {selectedAdminActivity.logs.map((log) => (
                    <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      {/* Icon */}
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-cream-deep text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                        {log.action.includes('delete') ? '🗑️' : log.action.includes('create') || log.action.includes('add') ? '✨' : '📝'}
                      </div>
                      
                      {/* Card */}
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] card p-4 border border-divider shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-sm text-text-primary uppercase tracking-wide">
                            {log.action.replace(/_/g, ' ')}
                          </h4>
                          <span className="text-[10px] text-text-secondary font-semibold">
                            {new Date(log.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-xs text-text-secondary break-all bg-cream rounded p-2 border border-divider/50 mt-2">
                          <pre className="font-mono text-[10px] whitespace-pre-wrap">{JSON.stringify(log.details, null, 2)}</pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* IP Management Modal */}
      {isIpModalOpen && selectedBuyerForIp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-surface rounded-[24px] border border-divider shadow-xl overflow-hidden p-6 flex flex-col max-h-[80vh] animate-scaleIn">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-text-primary">
                  User Data: {selectedBuyerForIp.name}
                </h3>
                <div className="text-xs text-text-secondary mt-2 space-y-1">
                  <p><strong>Email:</strong> {selectedBuyerForIp.email || 'N/A'}</p>
                  <p><strong>Phone:</strong> {selectedBuyerForIp.phone || 'N/A'}</p>
                  <p><strong>Status:</strong> {selectedBuyerForIp.isBlocked ? 'Blocked' : 'Active'}</p>
                </div>
              </div>
              <button
                onClick={() => setIsIpModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-cream-deep hover:bg-divider transition text-text-secondary font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <button
                onClick={async () => {
                  await toggleBlockBuyer(selectedBuyerForIp.id, selectedBuyerForIp.isBlocked);
                  setSelectedBuyerForIp(prev => prev ? { ...prev, isBlocked: !prev.isBlocked } : null);
                }}
                className={`w-full py-2 rounded-lg font-bold text-sm transition border ${
                  selectedBuyerForIp.isBlocked
                    ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                    : 'bg-red-600 text-white border-transparent hover:bg-red-700'
                }`}
              >
                {selectedBuyerForIp.isBlocked ? 'Unblock User' : 'Block User'}
              </button>
            </div>

            <h4 className="font-bold text-sm text-text-primary mb-2">Tracked IP Addresses</h4>
            <div className="flex-1 overflow-y-auto min-h-[200px] border border-divider rounded-xl bg-cream-deep/50 p-4">
              {buyerIps.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-text-secondary">
                  <span className="text-2xl mb-2 opacity-50">🌐</span>
                  <p className="text-sm">No IPs tracked yet.</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {buyerIps.map((ip) => (
                    <li key={ip.id} className="bg-surface border border-divider rounded-lg p-3 flex justify-between items-center shadow-sm">
                      <div>
                        <p className="font-mono text-sm font-bold text-text-primary">{ip.ipAddress}</p>
                        <p className="text-xs text-text-secondary mt-0.5">
                          Source: <span className="uppercase">{ip.source}</span>
                        </p>
                      </div>
                      <span className="text-[10px] text-text-secondary font-medium">
                        {new Date(ip.detectedAt).toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
