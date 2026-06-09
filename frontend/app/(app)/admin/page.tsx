'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { productApi, orderApi, authApi, bannerApi, uploadApi } from '@/lib/api-client';
import { DesktopTopBar } from '@/components/DesktopTopBar';
import { toast } from '@/lib/toast';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { Product, OrderItem } from '@/lib/types';
import { formatInr } from '@/lib/formatting/inr';
import Image from 'next/image';
import { isValidImageUrl } from '@/lib/image';

function getToken() {
  if (typeof document === 'undefined') return '';
  return document.cookie.split('; ').find((row) => row.startsWith('token='))?.split('=')[1] ?? '';
}

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'buyers' | 'banners'>('products');
  const [loading, setLoading] = useState(true);

  // States for lists
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [buyers, setBuyers] = useState<{ id: string; name: string; phone: string; orders: number }[]>([]);
  const [banners, setBanners] = useState<{ id: string; image_url: string; sort_order: number }[]>([]);

  // States for product form modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formProduct, setFormProduct] = useState<Partial<Product> & { id: string }>({
    id: '',
    name: '',
    subtitle: '',
    price: 0,
    originalPrice: null,
    imageUrl: '',
    imageUrls: [],
    badge: null,
    categoryKey: 'banarasi',
    isVisible: true,
  });
  const [isFeatured, setIsFeatured] = useState(false);

  // States for banner form modal
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [newBannerUrl, setNewBannerUrl] = useState('');
  const [newBannerOrder, setNewBannerOrder] = useState(0);

  const [uploadingProductImage, setUploadingProductImage] = useState(false);
  const [uploadingBannerImage, setUploadingBannerImage] = useState(false);

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
        // Load default tab data
        loadTabData('products');
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
      } else if (tab === 'orders') {
        const res = await orderApi.fetchAllAdmin(token);
        setOrders(res.orders);
      } else if (tab === 'buyers') {
        const res = await authApi.fetchBuyersAdmin(token);
        setBuyers(res.buyers);
      } else if (tab === 'banners') {
        const res = await bannerApi.fetchAllAdmin(token);
        setBanners(res.banners);
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

  function openEditProduct(p: Product) {
    setFormProduct({
      id: p.id,
      name: p.name,
      subtitle: p.subtitle,
      price: p.price,
      originalPrice: p.originalPrice,
      imageUrl: p.imageUrl,
      imageUrls: p.imageUrls,
      badge: p.badge,
      categoryKey: p.categoryKey || 'banarasi',
      isVisible: p.isVisible,
    });
    // Check if featured (for demo/seeding)
    setIsFeatured(false);
    setIsFormOpen(true);
  }

  function openAddProduct() {
    setFormProduct({
      id: '',
      name: '',
      subtitle: '',
      price: 0,
      originalPrice: null,
      imageUrl: '',
      imageUrls: [],
      badge: null,
      categoryKey: 'banarasi',
      isVisible: true,
    });
    setIsFeatured(false);
    setIsFormOpen(true);
  }

  async function handleProductImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingProductImage(true);
    const token = getToken();
    try {
      const { imageUrl } = await uploadApi.upload(token, file);
      setFormProduct((prev) => ({ ...prev, imageUrl }));
      toast.success('Image uploaded successfully');
    } catch (err) {
      toast.error(`Upload failed: ${err}`);
    } finally {
      setUploadingProductImage(false);
    }
  }

  async function handleBannerImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBannerImage(true);
    const token = getToken();
    try {
      const { imageUrl } = await uploadApi.upload(token, file);
      setNewBannerUrl(imageUrl);
      toast.success('Banner image uploaded successfully');
    } catch (err) {
      toast.error(`Upload failed: ${err}`);
    } finally {
      setUploadingBannerImage(false);
    }
  }

  async function saveProductForm(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (formProduct.imageUrl && !isValidImageUrl(formProduct.imageUrl)) {
      toast.error('Image URL must start with http://, https://, or /');
      return;
    }
    try {
      const payload = {
        ...formProduct,
        price: Number(formProduct.price),
        originalPrice: formProduct.originalPrice ? Number(formProduct.originalPrice) : null,
        imageUrls: formProduct.imageUrl ? [formProduct.imageUrl] : [],
      };
      await productApi.upsert(token, payload, isFeatured);
      setIsFormOpen(false);
      loadTabData('products');
      toast.success('Product saved successfully');
    } catch (err) {
      toast.error(`Failed to save product: ${err}`);
    }
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

  // --- Banners Tab CRUD Actions ---

  async function addBanner(e: React.FormEvent) {
    e.preventDefault();
    if (newBannerUrl.trim() && !isValidImageUrl(newBannerUrl.trim())) {
      toast.error('Banner Image URL must start with http://, https://, or /');
      return;
    }
    const token = getToken();
    try {
      await bannerApi.add(token, newBannerUrl.trim(), Number(newBannerOrder));
      setIsBannerModalOpen(false);
      setNewBannerUrl('');
      setNewBannerOrder(0);
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

  const tabs = [
    { id: 'products', label: 'Products' },
    { id: 'orders', label: 'Orders' },
    { id: 'buyers', label: 'Buyers' },
    { id: 'banners', label: 'Banners' },
  ] as const;

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

                <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0 xl:grid-cols-2">
                  {products.map((p) => (
                    <div
                      key={p.id}
                      className={`card flex items-center justify-between p-4 border border-divider shadow-sm transition lg:hover:shadow-md ${
                        !p.isVisible ? 'bg-gray-100 opacity-75' : ''
                      }`}
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-cream-deep shrink-0 border border-divider">
                          {isValidImageUrl(p.imageUrl) ? (
                            <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-text-secondary">
                              🖼️
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-sm truncate">{p.name}</h4>
                          <p className="text-xs text-text-secondary mt-0.5">
                            Code: {p.id} · Price: {formatInr(p.price)}
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
            {activeTab === 'orders' && (
              <div className="space-y-4">
                <h3 className="font-serif text-xl font-bold">Manage Orders</h3>

                <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-5 lg:space-y-0">
                  {orders.map((o) => (
                    <div
                      key={o.id}
                      className="card p-5 border border-divider shadow-sm space-y-4"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-sm">Order ID: {(o.id || '').slice(0, 8).toUpperCase()}</h4>
                          <p className="text-xs text-text-secondary mt-0.5">
                            {o.title} · {o.dateLabel}
                          </p>
                        </div>
                        <span className="text-sm font-bold text-maroon">{formatInr(o.total)}</span>
                      </div>

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
                <h3 className="font-serif text-xl font-bold">Registered Buyers</h3>

                <div className="space-y-3">
                  {buyers.map((b) => (
                    <div
                      key={b.id}
                      className="card flex items-center justify-between p-4 border border-divider shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-full bg-maroon text-white font-bold flex items-center justify-center text-sm font-serif">
                          {(b.name || 'B').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm">{b.name || 'Buyer'}</h4>
                          <p className="text-xs text-text-secondary mt-0.5">{b.phone}</p>
                        </div>
                      </div>
                      <span className="bg-gold/15 text-gold text-xs px-3 py-1.5 rounded-lg font-bold">
                        {b.orders} orders
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BANNERS TAB */}
            {activeTab === 'banners' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-serif text-xl font-bold">Promo Banners</h3>
                  <button onClick={() => setIsBannerModalOpen(true)} className="btn-primary py-2 px-5 text-xs">
                    + Add Banner
                  </button>
                </div>

                <div className="space-y-3">
                  {banners.map((b) => (
                    <div
                      key={b.id}
                      className="card flex items-center justify-between p-3 border border-divider shadow-sm"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="relative w-28 h-16 rounded-lg overflow-hidden bg-cream-deep shrink-0 border border-divider">
                          {isValidImageUrl(b.image_url) ? (
                            <Image src={b.image_url} alt="Banner" fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-text-secondary">
                              🖼️
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-text-secondary truncate flex-1 leading-relaxed">
                          {b.image_url}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteBanner(b.id)}
                        className="p-2 text-red-600 hover:text-red-800 transition text-lg ml-4"
                        title="Remove banner"
                      >
                        🗑️
                      </button>
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
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4 py-8 overflow-y-auto">
          <div className="bg-white rounded-card shadow-xl max-w-lg w-full max-h-[85vh] flex flex-col">
            <header className="px-6 py-4 border-b border-divider flex justify-between items-center shrink-0">
              <h3 className="font-serif text-xl font-bold">
                {formProduct.name ? 'Edit Product' : 'Add New Product'}
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
                    disabled={!!formProduct.name}
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
                    value={formProduct.categoryKey || 'banarasi'}
                    onChange={(e) => setFormProduct({ ...formProduct, categoryKey: e.target.value })}
                  >
                    <option value="banarasi">Banarasi</option>
                    <option value="kanjivaram">Kanjivaram</option>
                    <option value="chiffon">Chiffon</option>
                    <option value="georgette">Georgette</option>
                    <option value="cotton">Cotton</option>
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-secondary uppercase">Wholesale Price (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="Price"
                    className="input-field"
                    value={formProduct.price || ''}
                    onChange={(e) => setFormProduct({ ...formProduct, price: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-secondary uppercase">Original Price (Optional)</label>
                  <input
                    type="number"
                    placeholder="Original Price"
                    className="input-field"
                    value={formProduct.originalPrice || ''}
                    onChange={(e) => setFormProduct({ ...formProduct, originalPrice: e.target.value ? Number(e.target.value) : null })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary uppercase">Product Image</label>
                <div className="flex gap-4 items-center">
                  <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-cream-deep border border-divider shrink-0 flex items-center justify-center">
                    {isValidImageUrl(formProduct.imageUrl) ? (
                      <Image src={formProduct.imageUrl || ''} alt="Preview" fill className="object-cover" />
                    ) : (
                      <span className="text-2xl text-text-secondary">🧵</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <label className="btn-outline py-2 px-4 text-xs cursor-pointer inline-block">
                        {uploadingProductImage ? 'Uploading...' : 'Choose File'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleProductImageUpload}
                          disabled={uploadingProductImage}
                        />
                      </label>
                      {formProduct.imageUrl && (
                        <button
                          type="button"
                          onClick={() => setFormProduct((prev) => ({ ...prev, imageUrl: '' }))}
                          className="text-red-600 hover:text-red-800 text-xs font-semibold py-2 px-2 transition"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Or paste network image URL"
                      className="input-field py-2.5 text-xs"
                      value={formProduct.imageUrl || ''}
                      onChange={(e) => setFormProduct({ ...formProduct, imageUrl: e.target.value })}
                    />
                  </div>
                </div>
              </div>

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

      {/* --- ADD BANNER MODAL FORM --- */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-white rounded-card shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-lg font-bold">Add Banner Image</h3>
              <button onClick={() => setIsBannerModalOpen(false)} className="text-text-secondary hover:text-maroon text-lg p-1">
                ✕
              </button>
            </div>

            <form onSubmit={addBanner} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary uppercase">Banner Image</label>
                <div className="flex gap-4 items-center">
                  <div className="relative w-24 h-14 rounded-lg overflow-hidden bg-cream-deep border border-divider shrink-0 flex items-center justify-center">
                    {isValidImageUrl(newBannerUrl) ? (
                      <Image src={newBannerUrl} alt="Preview" fill className="object-cover" />
                    ) : (
                      <span className="text-2xl text-text-secondary">🖼️</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <label className="btn-outline py-2 px-4 text-xs cursor-pointer inline-block">
                        {uploadingBannerImage ? 'Uploading...' : 'Choose File'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleBannerImageUpload}
                          disabled={uploadingBannerImage}
                        />
                      </label>
                      {newBannerUrl && (
                        <button
                          type="button"
                          onClick={() => setNewBannerUrl('')}
                          className="text-red-600 hover:text-red-800 text-xs font-semibold py-2 px-2 transition"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Or paste network image URL"
                      className="input-field py-2.5 text-xs"
                      value={newBannerUrl}
                      onChange={(e) => setNewBannerUrl(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary uppercase">Sort Order</label>
                <input
                  type="number"
                  placeholder="Sort order (lower values first)"
                  className="input-field"
                  value={newBannerOrder || ''}
                  onChange={(e) => setNewBannerOrder(Number(e.target.value))}
                />
              </div>

              <button type="submit" className="btn-primary w-full h-12 mt-2">
                Add Banner
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
