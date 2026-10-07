import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Search, User, Lock, Mail, LogOut, Plus, Trash2, 
  CheckCircle, ShieldCheck, Sparkles, Package, ArrowRight, X, Menu
} from 'lucide-react';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('isAdmin') === '1');
  const [userName, setUserName] = useState(localStorage.getItem('userName') || '');
  const [activeTab, setActiveTab] = useState('shop'); // shop, cart, orders, admin
  
  // Catalog & Filter
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Cart
  const [cart, setCart] = useState([]);
  
  // Orders
  const [orders, setOrders] = useState([]);
  
  // Registered Users (Admin only)
  const [users, setUsers] = useState([]);

  // Auth Modal
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');

  // Admin New Product
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newImage, setNewImage] = useState('');
  const [newStock, setNewStock] = useState('10');
  const [newCatId, setNewCatId] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    if (token) {
      fetchCart();
      fetchOrders();
      if (isAdmin) {
        fetchUsers();
      }
    }
  }, [token, isAdmin]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
      if (data.length > 0 && !newCatId) setNewCatId(data[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async (catId = null, search = '') => {
    try {
      let url = '/api/products?';
      if (catId) url += `category_id=${catId}&`;
      if (search) url += `search=${encodeURIComponent(search)}&`;
      const res = await fetch(url);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCart = async () => {
    try {
      const res = await fetch('/api/cart', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCart(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/auth/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (isLoginMode) {
        const formData = new URLSearchParams();
        formData.append('username', authEmail);
        formData.append('password', authPassword);
        
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Login failed');

        localStorage.setItem('token', data.access_token);
        localStorage.setItem('isAdmin', data.is_admin);
        localStorage.setItem('userName', data.full_name || authEmail);
        setToken(data.access_token);
        setIsAdmin(data.is_admin === 1);
        setUserName(data.full_name || authEmail);
        setShowAuthModal(false);
      } else {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: authEmail, password: authPassword, full_name: authName })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Registration failed');
        
        // Auto login after register
        setIsLoginMode(true);
        handleAuth(e);
      }
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const logout = () => {
    localStorage.clear();
    setToken('');
    setIsAdmin(false);
    setUserName('');
    setCart([]);
    setOrders([]);
    setActiveTab('shop');
  };

  const addToCart = async (productId) => {
    if (!token) {
      setShowAuthModal(true);
      return;
    }
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ product_id: productId, quantity: 1 })
      });
      if (res.ok) {
        fetchCart();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateQuantity = async (cartItemId, newQty) => {
    try {
      const res = await fetch(`/api/cart/${cartItemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity: newQty })
      });
      if (res.ok) {
        fetchCart();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const checkout = async () => {
    try {
      // Optimistic UI update
      setActiveTab('orders');
      
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchCart();
        fetchOrders();
      } else {
        // Fallback if failed
        setActiveTab('cart');
        alert('Order failed');
      }
    } catch (err) {
      console.error(err);
      setActiveTab('cart');
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          price: parseFloat(newPrice),
          image_url: newImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
          stock: parseInt(newStock),
          category_id: parseInt(newCatId)
        })
      });
      if (res.ok) {
        setNewTitle('');
        setNewDesc('');
        setNewPrice('');
        setNewImage('');
        fetchProducts();
        alert('Product created successfully!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen text-slate-100 flex flex-col relative overflow-x-hidden">
      
      {/* Background Decorative Gradient Orbs */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 left-1/3 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Glass Navigation Bar */}
      <header className="sticky top-0 z-50 glass-nav px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('shop')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-xl tracking-wide bg-gradient-to-r from-white via-slate-200 to-blue-400 bg-clip-text text-transparent">C COMMERCE</span>
            <span className="text-xs block text-blue-400 font-medium tracking-widest uppercase">Premium Shop</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setActiveTab('shop')} 
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'shop' ? 'bg-blue-600/30 text-white border border-blue-400/30 shadow-lg' : 'text-slate-300 hover:text-white'}`}
          >
            Catalog
          </button>
          
          <button 
            onClick={() => {
              if (!token) setShowAuthModal(true);
              else setActiveTab('cart');
            }} 
            className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center space-x-2 ${activeTab === 'cart' ? 'bg-blue-600/30 text-white border border-blue-400/30 shadow-lg' : 'text-slate-300 hover:text-white'}`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-md">
                {cartCount}
              </span>
            )}
          </button>

          {token && (
            <button 
              onClick={() => setActiveTab('orders')} 
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center space-x-2 ${activeTab === 'orders' ? 'bg-blue-600/30 text-white border border-blue-400/30 shadow-lg' : 'text-slate-300 hover:text-white'}`}
            >
              <Package className="w-4 h-4" />
              <span>Orders</span>
            </button>
          )}

          {isAdmin && (
            <button 
              onClick={() => setActiveTab('admin')} 
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center space-x-2 ${activeTab === 'admin' ? 'bg-indigo-600/40 text-indigo-200 border border-indigo-400/30 shadow-lg' : 'text-indigo-300 hover:text-white'}`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin</span>
            </button>
          )}

          {token ? (
            <div className="flex items-center space-x-3 pl-4 border-l border-white/10">
              <span className="text-sm font-medium text-slate-300 hidden md:inline">Hi, {userName.split('@')[0]}</span>
              <button 
                onClick={logout} 
                className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowAuthModal(true)}
              className="glass-button px-5 py-2 rounded-xl text-sm font-semibold text-white flex items-center space-x-2"
            >
              <User className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 z-10">
        
        {/* SHOP TAB */}
        {activeTab === 'shop' && (
          <div className="space-y-8">
            {/* Hero Banner */}
            <div className="glass-card rounded-3xl p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-transparent to-cyan-500/10 pointer-events-none"></div>
              <div className="space-y-4 max-w-xl z-10">
                <span className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-400 text-xs font-semibold tracking-wider uppercase">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Next-Gen Glassmorphic Living</span>
                </span>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                  Elegance Defined by <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">Transparency</span>
                </h1>
                <p className="text-slate-300 text-base">
                  Explore our curated collection of pristine hardware, immersive audio, and lifestyle gear engineered for modern minimalists.
                </p>
              </div>
              <div className="mt-8 md:mt-0 z-10">
                <div className="glass-card px-6 py-4 rounded-2xl flex items-center space-x-4 border-blue-500/20">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xl">✨</div>
                  <div>
                    <h3 className="font-bold text-white">Free Global Shipping</h3>
                    <p className="text-xs text-slate-400">On all orders above $100</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Category Filter */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                <button
                  onClick={() => { setSelectedCategory(null); fetchProducts(null, searchQuery); }}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === null ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'glass-card text-slate-300 hover:text-white'}`}
                >
                  All Products
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { setSelectedCategory(cat.id); fetchProducts(cat.id, searchQuery); }}
                    className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === cat.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'glass-card text-slate-300 hover:text-white'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              <div className="relative w-full md:w-80">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    fetchProducts(selectedCategory, e.target.value);
                  }}
                  className="glass-input w-full pl-10 pr-4 py-2 rounded-xl text-sm placeholder-slate-400"
                />
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="glass-card glass-card-hover rounded-3xl p-5 flex flex-col justify-between group">
                  <div>
                    <div className="relative h-56 rounded-2xl overflow-hidden mb-4 bg-slate-800/50">
                      <img 
                        src={product.image_url} 
                        alt={product.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-slate-900/60 backdrop-blur-md text-xs font-semibold text-blue-300 border border-white/10">
                        ${product.price.toFixed(2)}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-white mb-1">{product.title}</h3>
                    <p className="text-slate-400 text-xs line-clamp-2 mb-4">{product.description}</p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <span className="text-xs text-slate-400 font-medium">{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</span>
                    <button
                      onClick={() => addToCart(product.id)}
                      className="glass-button px-4 py-2 rounded-xl text-xs font-semibold text-white flex items-center space-x-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CART TAB */}
        {activeTab === 'cart' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-extrabold tracking-tight">Shopping Cart</h1>
            {cart.length === 0 ? (
              <div className="glass-card rounded-3xl p-12 text-center space-y-4">
                <ShoppingBag className="w-16 h-16 mx-auto text-slate-500" />
                <h3 className="text-xl font-bold text-white">Your cart is empty</h3>
                <p className="text-slate-400 text-sm">Discover our catalog and add items to your cart.</p>
                <button 
                  onClick={() => setActiveTab('shop')}
                  className="glass-button px-6 py-2.5 rounded-xl text-sm font-semibold text-white inline-block mt-2"
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="glass-card rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img src={item.product.image_url} alt={item.product.title} className="w-16 h-16 rounded-xl object-cover" />
                      <div>
                        <h4 className="font-bold text-white">{item.product.title}</h4>
                        <p className="text-sm text-blue-400">${item.product.price.toFixed(2)} each</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2 glass-input px-3 py-1 rounded-xl">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="text-slate-400 hover:text-white font-bold"
                        >-</button>
                        <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="text-slate-400 hover:text-white font-bold"
                        >+</button>
                      </div>
                      <button 
                        onClick={() => updateQuantity(item.id, 0)}
                        className="p-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="glass-card rounded-2xl p-6 flex items-center justify-between mt-6">
                  <div>
                    <span className="text-slate-400 text-sm">Total Amount</span>
                    <h2 className="text-3xl font-extrabold text-white">${cartTotal.toFixed(2)}</h2>
                  </div>
                  <button 
                    onClick={checkout}
                    className="glass-button px-8 py-3 rounded-xl text-sm font-bold text-white flex items-center space-x-2"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-extrabold tracking-tight">Order History</h1>
            {orders.length === 0 ? (
              <div className="glass-card rounded-3xl p-12 text-center space-y-4">
                <Package className="w-16 h-16 mx-auto text-slate-500" />
                <h3 className="text-xl font-bold text-white">No orders placed yet</h3>
                <p className="text-slate-400 text-sm">Your completed orders will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="glass-card rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between pb-4 border-b border-white/10">
                      <div>
                        <span className="text-xs text-slate-400">Order #{order.id}</span>
                        <h4 className="font-bold text-white text-lg">${order.total_amount.toFixed(2)}</h4>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                          {order.status}
                        </span>
                        <span className="text-xs text-slate-400">{new Date(order.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <span className="text-slate-300">{item.product ? item.product.title : `Product #${item.product_id}`} × {item.quantity}</span>
                          <span className="text-slate-400">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ADMIN TAB */}
        {activeTab === 'admin' && isAdmin && (
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="space-y-6">
              <h1 className="text-3xl font-extrabold tracking-tight">Admin Dashboard - Registered Users</h1>
              <div className="glass-card rounded-3xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-emerald-400" />
                    <span>Registered Accounts ({users.length})</span>
                  </h3>
                  <button
                    onClick={fetchUsers}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                  >
                    Refresh List
                  </button>
                </div>
                {users.length === 0 ? (
                  <p className="text-slate-400 text-sm">No registered users found or loading...</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                      <thead className="text-xs uppercase bg-white/5 text-slate-400 border-b border-white/10">
                        <tr>
                          <th className="px-4 py-3">ID</th>
                          <th className="px-4 py-3">Full Name</th>
                          <th className="px-4 py-3">Email</th>
                          <th className="px-4 py-3">Role</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {users.map((u) => (
                          <tr key={u.id} className="hover:bg-white/5">
                            <td className="px-4 py-3 font-mono text-xs">{u.id}</td>
                            <td className="px-4 py-3 font-medium text-white">{u.full_name || '—'}</td>
                            <td className="px-4 py-3">{u.email}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${u.is_admin ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'}`}>
                                {u.is_admin ? 'Admin' : 'Customer'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold tracking-tight">Add New Product</h2>
              <form onSubmit={handleCreateProduct} className="glass-card rounded-3xl p-8 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Product Title</label>
                <input 
                  type="text" 
                  value={newTitle} 
                  onChange={(e) => setNewTitle(e.target.value)} 
                  required
                  className="glass-input w-full px-4 py-2.5 rounded-xl text-sm"
                  placeholder="e.g. Quantum Glass Speaker"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Description</label>
                <textarea 
                  value={newDesc} 
                  onChange={(e) => setNewDesc(e.target.value)} 
                  rows="3"
                  className="glass-input w-full px-4 py-2.5 rounded-xl text-sm"
                  placeholder="Product description..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Price ($)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={newPrice} 
                    onChange={(e) => setNewPrice(e.target.value)} 
                    required
                    className="glass-input w-full px-4 py-2.5 rounded-xl text-sm"
                    placeholder="199.99"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Stock</label>
                  <input 
                    type="number" 
                    value={newStock} 
                    onChange={(e) => setNewStock(e.target.value)} 
                    required
                    className="glass-input w-full px-4 py-2.5 rounded-xl text-sm"
                    placeholder="10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Image URL</label>
                <input 
                  type="text" 
                  value={newImage} 
                  onChange={(e) => setNewImage(e.target.value)} 
                  className="glass-input w-full px-4 py-2.5 rounded-xl text-sm"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Category</label>
                <select 
                  value={newCatId} 
                  onChange={(e) => setNewCatId(e.target.value)}
                  className="glass-input w-full px-4 py-2.5 rounded-xl text-sm bg-slate-900"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <button 
                type="submit"
                className="glass-button w-full py-3 rounded-xl font-bold text-white shadow-lg"
              >
                Create Product
              </button>
            </form>
            </div>
          </div>
        )}

      </main>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="glass-card w-full max-w-md rounded-3xl p-8 relative space-y-6 border border-white/20">
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-400/30 flex items-center justify-center mx-auto text-blue-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-white">{isLoginMode ? 'Welcome Back' : 'Create Account'}</h2>
              <p className="text-xs text-slate-400">Access your glass store experience</p>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center font-medium">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
              {!isLoginMode && (
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      value={authName} 
                      onChange={(e) => setAuthName(e.target.value)} 
                      required 
                      className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input 
                    type="email" 
                    value={authEmail} 
                    onChange={(e) => setAuthEmail(e.target.value)} 
                    required 
                    className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
                    placeholder="admin@glasshop.com"
                  />
                </div>
                {isLoginMode && (
                  <p className="text-[11px] text-blue-400 mt-1">Tip: Default Admin login is admin@glasshop.com / admin123</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input 
                    type="password" 
                    value={authPassword} 
                    onChange={(e) => setAuthPassword(e.target.value)} 
                    required 
                    className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="glass-button w-full py-3 rounded-xl font-bold text-white shadow-lg"
              >
                {isLoginMode ? 'Sign In' : 'Register'}
              </button>
            </form>

            <div className="text-center">
              <button 
                type="button"
                onClick={() => setIsLoginMode(!isLoginMode)}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                {isLoginMode ? "Don't have an account? Register" : "Already have an account? Sign In"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="glass-nav py-6 px-6 text-center text-xs text-slate-400 mt-12 border-t border-white/10">
        <p>© 2026 Lumina Glass E-Commerce. All rights reserved. Built with React & FastAPI.</p>
      </footer>
    </div>
  );
}
