import React from 'react';
import { Plus, Trash2, Edit2, Link as LucideLink, Play, Save, X, PlusCircle, Bot } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Movie, Category, DownloadLink, Banner } from '../types';
import { db } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';

export default function AdminPanel({ categories, onLogout, user, theme }: { categories: string[], onLogout?: () => void, user?: any, theme?: string }) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'content' | 'banners' | 'categories' | 'upcoming'>('content');
  const [isAdding, setIsAdding] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newMovie, setNewMovie] = useState<Partial<Movie>>({
    category: categories.find(c => c !== 'All') || 'Movie',
    isPremium: false,
    isUpcoming: false,
    views: '3K videos',
    uploadTime: '1 day ago',
    channelName: 'KOCHI VISION',
    channelLogo: '',
    adLink: '',
    adLinks: [''],
    timer: 10,
    downloadLinks: [{ label: 'Download Server 1', url: '' }]
  });
  const [newBanner, setNewBanner] = useState<Partial<Banner>>({
    title: '',
    imageUrl: '',
    link: ''
  });

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "movies"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const moviesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Movie[];
      setMovies(moviesData);
    } catch (e) {
      console.error("Error fetching movies:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchBanners = async () => {
    try {
      const q = query(collection(db, "banners"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const bannersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Banner[];
      setBanners(bannersData);
    } catch (e) {
      console.error("Error fetching banners:", e);
    }
  };

  useEffect(() => {
    fetchMovies();
    fetchBanners();
  }, []);

  const handleAddBanner = async () => {
    if (!newBanner.title || !newBanner.imageUrl || !newBanner.link) {
      alert("Please fill in all banner fields");
      return;
    }
    try {
      await addDoc(collection(db, "banners"), {
        ...newBanner,
        createdAt: serverTimestamp()
      });
      setNewBanner({ title: '', imageUrl: '', link: '' });
      fetchBanners();
    } catch (e) {
      console.error("Error adding banner:", e);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!window.confirm("Delete this banner?")) return;
    try {
      await deleteDoc(doc(db, "banners", id));
      fetchBanners();
    } catch (e) {
      console.error("Error deleting banner:", e);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    if (categories.includes(newCategory.trim())) {
      alert("Category already exists");
      return;
    }

    try {
      const newList = [...categories, newCategory.trim()];
      await updateDoc(doc(db, "settings", "categories"), {
        list: newList
      }).catch(async (err) => {
        // If doc doesn't exist, set it
        if (err.code === 'not-found') {
          const { setDoc } = await import('firebase/firestore');
          await setDoc(doc(db, "settings", "categories"), { list: newList });
        }
      });
      setNewCategory('');
    } catch (e) {
      console.error("Error adding category:", e);
    }
  };

  const handleDeleteCategory = async (cat: string) => {
    if (cat === 'All') return;
    if (!window.confirm(`Delete category "${cat}"? Movies in this category won't be deleted but will be uncategorized.`)) return;

    try {
      const newList = categories.filter(c => c !== cat);
      await updateDoc(doc(db, "settings", "categories"), {
        list: newList
      });
    } catch (e) {
      console.error("Error deleting category:", e);
    }
  };

  const handleAdd = async () => {
    // Sync single adLink with first rotating link for compatibility
    const mainAdLink = newMovie.adLinks?.[0] || newMovie.adLink;
    if (!newMovie.title || !newMovie.thumbnail || !mainAdLink) {
      alert("Please fill in all required fields (Title, Thumbnail, Ad Link)");
      return;
    }
    
    const movieData = {
      ...newMovie,
      adLink: mainAdLink,
    };
    
    try {
      if (editingId) {
          await updateDoc(doc(db, "movies", editingId), {
            ...movieData,
            updatedAt: serverTimestamp()
          });
        } else {
          await addDoc(collection(db, "movies"), {
            ...movieData,
            createdAt: serverTimestamp()
          });
        }
        setIsAdding(false);
        setEditingId(null);
        setNewMovie({ 
          category: 'Movie', 
          isPremium: false, 
          isUpcoming: false,
          adLink: '', 
          adLinks: [''],
          timer: 10,
          downloadLinks: [{ label: 'Download Server 1', url: '' }] 
        });
        fetchMovies();
      } catch (e) {
        console.error("Error saving movie:", e);
      }
  };

  const handleEdit = (movie: Movie) => {
    setNewMovie({
      title: movie.title,
      thumbnail: movie.thumbnail,
      description: movie.description,
      category: movie.category,
      adLink: movie.adLink,
      adLinks: movie.adLinks || [movie.adLink],
      timer: movie.timer || 10,
      isPremium: movie.isPremium,
      isUpcoming: movie.isUpcoming || false,
      views: movie.views || '3K videos',
      uploadTime: movie.uploadTime || '1 day ago',
      channelName: movie.channelName || 'KOCHI VISION',
      channelLogo: movie.channelLogo || '',
      downloadLinks: movie.downloadLinks || [{ label: 'Download Server 1', url: '' }]
    });
    setEditingId(movie.id);
    setIsAdding(true);
  };

  const updateAdLink = (index: number, value: string) => {
    const links = [...(newMovie.adLinks || [''])];
    links[index] = value;
    setNewMovie({ ...newMovie, adLinks: links });
  };

  const addAdLink = () => {
    if ((newMovie.adLinks?.length || 0) >= 10) {
      alert("Maximum 10 ad links allowed");
      return;
    }
    setNewMovie({ ...newMovie, adLinks: [...(newMovie.adLinks || ['']), ''] });
  };

  const removeAdLink = (index: number) => {
    if ((newMovie.adLinks?.length || 0) <= 1) return;
    const links = [...(newMovie.adLinks || [])];
    links.splice(index, 1);
    setNewMovie({ ...newMovie, adLinks: links });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      try {
        await deleteDoc(doc(db, "movies", id));
        fetchMovies();
      } catch (e) {
        console.error("Error deleting movie:", e);
      }
    }
  };

  const addDownloadLink = () => {
    setNewMovie({
      ...newMovie,
      downloadLinks: [...(newMovie.downloadLinks || []), { label: `Download Server ${(newMovie.downloadLinks?.length || 0) + 1}`, url: '' }]
    });
  };

  const updateDownloadLink = (index: number, field: keyof DownloadLink, value: string) => {
    const links = [...(newMovie.downloadLinks || [])];
    links[index] = { ...links[index], [field]: value };
    setNewMovie({ ...newMovie, downloadLinks: links });
  };

  const removeDownloadLink = (index: number) => {
    const links = [...(newMovie.downloadLinks || [])];
    links.splice(index, 1);
    setNewMovie({ ...newMovie, downloadLinks: links });
  };

  return (
    <div className="p-6 pb-32 min-h-screen bg-zinc-950 text-white">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-black uppercase tracking-tighter italic">ADMIN <span className="text-red-500">CONTROL</span></h1>
        {onLogout && (
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 rounded-xl bg-zinc-900 border border-white/10 px-4 py-2 text-[10px] font-black uppercase hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        )}
      </div>

      <div className="flex items-center justify-between mb-10 overflow-x-auto no-scrollbar scroll-smooth gap-4">
        <div className="flex gap-2 p-1 bg-zinc-900/50 rounded-2xl border border-white/5 shrink-0">
          <button 
            onClick={() => { setActiveTab('content'); setIsAdding(false); }}
            className={`rounded-xl px-5 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'content' ? 'bg-red-600 text-white shadow-lg shadow-red-900/40' : 'text-zinc-500 hover:text-white'}`}
          >
            CONTENT
          </button>
          <button 
            onClick={() => { setActiveTab('upcoming'); setIsAdding(false); }}
            className={`rounded-xl px-5 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'upcoming' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-900/40' : 'text-zinc-500 hover:text-white'}`}
          >
            UPCOMING
          </button>
          <button 
            onClick={() => { setActiveTab('banners'); setIsAdding(false); }}
            className={`rounded-xl px-5 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'banners' ? 'bg-red-600 text-white shadow-lg shadow-red-900/40' : 'text-zinc-500 hover:text-white'}`}
          >
            BANNERS
          </button>
          <button 
            onClick={() => { setActiveTab('categories'); setIsAdding(false); }}
            className={`rounded-xl px-5 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'categories' ? 'bg-red-600 text-white shadow-lg shadow-red-900/40' : 'text-zinc-500 hover:text-white'}`}
          >
            CAT
          </button>
        </div>
        
        {activeTab === 'content' && (
          <button 
            onClick={() => {
              if (isAdding) {
                setEditingId(null);
                setNewMovie({ 
                  category: categories.find(c => c !== 'All') || 'Movie', 
                  isPremium: false, 
                  adLink: '', 
                  downloadLinks: [{ label: 'Download Server 1', url: '' }] 
                });
              }
              setIsAdding(!isAdding);
            }}
            className="flex items-center gap-2 rounded-2xl bg-red-600 px-6 py-3 text-sm font-black shadow-xl shadow-red-900/40 active:scale-95 transition-all"
          >
            {isAdding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {isAdding ? 'CANCEL' : 'ADD NEW'}
          </button>
        )}
      </div>

      {activeTab === 'banners' && (
        <div className="mb-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="space-y-6 rounded-[32px] bg-zinc-900/50 p-8 border border-white/5 shadow-2xl backdrop-blur-xl">
             <h3 className="text-sm font-black text-red-600 uppercase tracking-widest">Home Slider Banners</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <input type="text" placeholder="Banner Title..." className="rounded-xl bg-zinc-800 px-4 py-3 text-xs text-white focus:outline-none" value={newBanner.title} onChange={e => setNewBanner({...newBanner, title: e.target.value})} />
               <input type="text" placeholder="Image URL..." className="rounded-xl bg-zinc-800 px-4 py-3 text-xs text-white focus:outline-none" value={newBanner.imageUrl} onChange={e => setNewBanner({...newBanner, imageUrl: e.target.value})} />
               <input type="text" placeholder="Link..." className="rounded-xl bg-zinc-800 px-4 py-3 text-xs text-white focus:outline-none" value={newBanner.link} onChange={e => setNewBanner({...newBanner, link: e.target.value})} />
               <button onClick={handleAddBanner} className="md:col-span-3 rounded-xl bg-red-600 px-6 py-3 text-xs font-black uppercase">Add Banner</button>
             </div>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
             {banners.map(banner => (
               <div key={banner.id} className="relative group rounded-2xl overflow-hidden aspect-[16/9] border border-white/5 bg-zinc-900">
                 <img src={banner.imageUrl} alt="" className="h-full w-full object-cover opacity-80" referrerPolicy="no-referrer" />
                 <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
                    <p className="text-[10px] font-black uppercase text-white mb-2 line-clamp-1">{banner.title}</p>
                    <button onClick={() => handleDeleteBanner(banner.id)} className="rounded-xl bg-red-600 px-3 py-1.5 text-[10px] font-black text-white hover:bg-red-500 transition-all flex items-center gap-2">
                      <Trash2 className="h-3 w-3" /> DELETE
                    </button>
                 </div>
               </div>
             ))}
           </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="mb-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="space-y-6 rounded-[32px] bg-zinc-900/50 p-8 border border-white/5 shadow-2xl backdrop-blur-xl">
             <h3 className="text-sm font-black text-red-600 uppercase tracking-widest">Navigation Categories</h3>
             <div className="flex gap-2">
               <input type="text" placeholder="New Category Name..." className="flex-1 rounded-xl bg-zinc-800 px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-600" value={newCategory} onChange={e => setNewCategory(e.target.value)} />
               <button onClick={handleAddCategory} className="rounded-xl bg-red-600 px-6 py-3 text-xs font-black uppercase">Add</button>
             </div>
             <div className="flex flex-wrap gap-2 mt-4">
               {categories.map(cat => (
                 <div key={cat} className="flex items-center gap-2 rounded-full bg-zinc-800 px-4 py-2 border border-white/5 group">
                   <span className="text-[10px] font-black uppercase text-zinc-400">{cat}</span>
                   {cat !== 'All' && (
                     <button onClick={() => handleDeleteCategory(cat)} className="text-zinc-600 hover:text-red-500 transition-colors"><X className="h-3 w-3" /></button>
                   )}
                 </div>
               ))}
             </div>
           </div>
        </div>
      )}

      {isAdding && activeTab === 'content' && (
        <div className="mb-8 space-y-6 rounded-[32px] bg-zinc-900/50 p-8 border border-white/5 shadow-2xl backdrop-blur-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-zinc-500 uppercase mb-2 ml-1">Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Karuppu (2026) Movie"
                  className="w-full rounded-2xl bg-zinc-800 px-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-600 border border-white/5"
                  value={newMovie.title || ''}
                  onChange={e => setNewMovie({...newMovie, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-zinc-500 uppercase mb-2 ml-1">Thumbnail Image URL</label>
                <input 
                  type="text" 
                  placeholder="https://..."
                  className="w-full rounded-2xl bg-zinc-800 px-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-600 border border-white/5"
                  value={newMovie.thumbnail || ''}
                  onChange={e => setNewMovie({...newMovie, thumbnail: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-zinc-500 uppercase mb-2 ml-1">Short Description</label>
                <textarea 
                  placeholder="Write a brief intro..."
                  className="w-full rounded-2xl bg-zinc-800 px-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-600 border border-white/5 min-h-[100px]"
                  value={newMovie.description || ''}
                  onChange={e => setNewMovie({...newMovie, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase mb-2 ml-1">Views (e.g. 10K views)</label>
                  <input 
                    type="text" 
                    placeholder="10K views"
                    className="w-full rounded-2xl bg-zinc-800 px-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-600 border border-white/5"
                    value={newMovie.views || ''}
                    onChange={e => setNewMovie({...newMovie, views: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase mb-2 ml-1">Upload Time (e.g. 2 hours ago)</label>
                  <input 
                    type="text" 
                    placeholder="2 hours ago"
                    className="w-full rounded-2xl bg-zinc-800 px-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-600 border border-white/5"
                    value={newMovie.uploadTime || ''}
                    onChange={e => setNewMovie({...newMovie, uploadTime: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-zinc-500 uppercase mb-2 ml-1">Channel Name (Optional)</label>
                <input 
                  type="text" 
                  placeholder="KOCHI VISION"
                  className="w-full rounded-2xl bg-zinc-800 px-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-600 border border-white/5"
                  value={newMovie.channelName || ''}
                  onChange={e => setNewMovie({...newMovie, channelName: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-zinc-500 uppercase mb-2 ml-1">Channel Logo URL (Optional)</label>
                <input 
                  type="text" 
                  placeholder="https://..."
                  className="w-full rounded-2xl bg-zinc-800 px-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-600 border border-white/5"
                  value={newMovie.channelLogo || ''}
                  onChange={e => setNewMovie({...newMovie, channelLogo: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-zinc-500 uppercase mb-2 ml-1">Category</label>
                <select 
                  className="w-full rounded-2xl bg-zinc-800 px-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-600 border border-white/5"
                  value={newMovie.category}
                  onChange={e => setNewMovie({...newMovie, category: e.target.value})}
                >
                  {categories.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2 px-1">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Rotating Ad Links (3-Hour Slots)</label>
                  <button 
                    onClick={addAdLink}
                    className="text-[10px] font-black text-red-500 hover:text-red-400"
                  >
                    + ADD NEW SLOT
                  </button>
                </div>
                <div className="space-y-3">
                  {(newMovie.adLinks || ['']).map((link, i) => (
                    <div key={i} className="flex gap-2">
                      <div className="flex-1 relative animate-in fade-in zoom-in-95 duration-300">
                        <LucideLink className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                        <input 
                          type="text" 
                          placeholder={`https://... (Slot ${i + 1})`}
                          className="w-full rounded-2xl bg-zinc-800 py-4 pr-5 pl-12 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-600 border border-white/5"
                          value={link || ''}
                          onChange={e => updateAdLink(i, e.target.value)}
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[8px] font-black text-zinc-600 uppercase">
                          Slot {i + 1}
                        </div>
                      </div>
                      {(newMovie.adLinks?.length || 0) > 1 && (
                        <button 
                          onClick={() => removeAdLink(i)}
                          className="rounded-2xl bg-red-600/10 px-4 text-red-500 hover:bg-red-600 hover:text-white transition-all shadow-xl"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-zinc-500 uppercase mb-2 ml-1 tracking-widest">Unlock Wait Time (Seconds)</label>
                <div className="relative">
                  <Play className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input 
                    type="number" 
                    placeholder="Enter seconds (e.g. 15)"
                    className="w-full rounded-2xl bg-zinc-800 py-4 pr-5 pl-12 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-600 border border-white/5"
                    value={newMovie.timer}
                    onChange={e => setNewMovie({...newMovie, timer: parseInt(e.target.value) || 0})}
                  />
                  {newMovie.timer && (
                    <button 
                      onClick={() => setNewMovie({...newMovie, timer: 0})}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[8px] font-black text-red-500 uppercase hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-zinc-800/50 border border-white/5">
                <input 
                  type="checkbox" 
                  id="isPremium"
                  checked={newMovie.isPremium}
                  onChange={e => setNewMovie({...newMovie, isPremium: e.target.checked})}
                  className="h-5 w-5 rounded-lg accent-red-600"
                />
                <label htmlFor="isPremium" className="text-xs font-bold text-white uppercase tracking-tight">VIP Content Only</label>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-2xl bg-zinc-800/50 border border-white/5">
                <input 
                  type="checkbox" 
                  id="isUpcoming"
                  checked={newMovie.isUpcoming}
                  onChange={e => setNewMovie({...newMovie, isUpcoming: e.target.checked})}
                  className="h-5 w-5 rounded-lg accent-red-600"
                />
                <label htmlFor="isUpcoming" className="text-xs font-bold text-white uppercase tracking-tight">Upcoming (কচি)</label>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-[10px] font-black text-zinc-500 uppercase ml-1">Target Download Link (Use This for Button After 10s Timer)</label>
              <button 
                onClick={addDownloadLink}
                className="text-[10px] font-black text-red-500 flex items-center gap-1 hover:text-red-400"
              >
                <PlusCircle className="h-3 w-3" /> ADD ANOTHER LINK
              </button>
            </div>
            {newMovie.downloadLinks?.map((link, index) => (
              <div key={index} className="flex gap-3 items-start bg-black/20 p-4 rounded-2xl border border-white/5">
                <div className="flex-1 space-y-2">
                   <input 
                    type="text" 
                    placeholder="Link Label (e.g. Download 720p)"
                    className="w-full rounded-xl bg-zinc-800 px-4 py-2 text-xs text-white focus:outline-none"
                    value={link.label}
                    onChange={e => updateDownloadLink(index, 'label', e.target.value)}
                  />
                  <input 
                    type="text" 
                    placeholder="Target URL (e.g. Mega Link)"
                    className="w-full rounded-xl bg-zinc-800 px-4 py-2 text-xs text-white focus:outline-none"
                    value={link.url}
                    onChange={e => updateDownloadLink(index, 'url', e.target.value)}
                  />
                </div>
                {index > 0 && (
                  <button 
                    onClick={() => removeDownloadLink(index)}
                    className="p-2 text-zinc-500 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button 
            onClick={handleAdd}
            className="w-full rounded-2xl bg-red-600 py-4 text-sm font-black shadow-2xl shadow-red-900/40 hover:bg-red-500 transition-all active:scale-[0.98] text-white"
          >
            {editingId ? 'UPDATE CONTENT' : 'SAVE & PUBLISH'}
          </button>
        </div>
      )}

      {activeTab === 'upcoming' && !isAdding && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="flex items-center justify-between px-1 mb-6">
             <h3 className="text-xs font-black text-yellow-500 uppercase tracking-[0.2em]">Upcoming List (Kochi)</h3>
             <button 
               onClick={() => { setActiveTab('content'); setIsAdding(true); setNewMovie({ ...newMovie, isUpcoming: true }); }}
               className="text-[10px] font-black text-white bg-yellow-500/20 px-4 py-2 rounded-xl border border-yellow-500/30"
             >
               + ADD UPCOMING
             </button>
           </div>
           
           <div className="grid grid-cols-1 gap-4">
             {movies.filter(m => m.isUpcoming).map(movie => (
               <div key={movie.id} className="group flex items-center gap-4 rounded-3xl bg-zinc-900/50 p-3 border border-white/5">
                 <div className="relative h-20 w-20 shrink-0">
                    <img src={movie.thumbnail} alt="" className="h-full w-full rounded-2xl object-cover" referrerPolicy="no-referrer" />
                 </div>
                 <div className="flex-1 overflow-hidden">
                    <h3 className="line-clamp-1 font-bold text-white text-sm">{movie.title}</h3>
                    <span className="text-[10px] text-yellow-400 font-black uppercase px-2 py-0.5 rounded-lg bg-yellow-400/10 border border-yellow-400/20 mt-1 inline-block">UPCOMING</span>
                 </div>
                 <div className="flex gap-2">
                    <button onClick={() => handleEdit(movie)} className="p-3 bg-zinc-800 rounded-xl text-white"><Edit2 className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(movie.id)} className="p-3 bg-red-600 rounded-xl text-white"><Trash2 className="h-4 w-4" /></button>
                 </div>
               </div>
             ))}
             {movies.filter(m => m.isUpcoming).length === 0 && (
               <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[32px]">
                 <p className="text-zinc-600 text-xs font-black uppercase tracking-widest">No Upcoming Posts</p>
               </div>
             )}
           </div>
        </div>
      )}

      {!isAdding && activeTab === 'content' && (
        <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] mb-2 px-1">Recent Posts ({movies.length})</h3>
          {movies.map(movie => (
            <div key={movie.id} className="group flex items-center gap-4 rounded-3xl bg-zinc-900/50 p-3 border border-white/5 hover:bg-zinc-900 transition-all">
              <div className="relative h-20 w-20 shrink-0">
                <img src={movie.thumbnail} alt="" className="h-full w-full rounded-2xl object-cover" />
                {movie.isPremium && <div className="absolute top-1 left-1 bg-yellow-500 text-[8px] font-black text-black px-1.5 rounded-md">VIP</div>}
              </div>
              <div className="flex-1 overflow-hidden">
                <h3 className="line-clamp-1 font-bold text-white text-sm">{movie.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  {movie.isUpcoming && <span className="text-[10px] text-zinc-950 font-black uppercase px-2 py-0.5 rounded-lg bg-yellow-400">UPCOMING</span>}
                  <span className="text-[10px] text-zinc-500 font-black uppercase px-2 py-0.5 rounded-lg bg-zinc-800">{movie.category}</span>
                  <span className="text-[10px] text-zinc-400 font-medium truncate max-w-[80px]">{movie.adLink}</span>
                  <span className="text-[10px] text-red-400 font-black px-2 py-0.5 rounded-lg bg-red-500/10 border border-red-500/20">{movie.timer || 10}s</span>
                </div>
              </div>
              <div className="flex gap-2 pr-2">
                <button 
                  onClick={() => handleEdit(movie)}
                  className="rounded-xl bg-zinc-800 p-3 text-white hover:bg-white hover:text-black transition-all"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => handleDelete(movie.id)}
                  className="rounded-xl bg-red-600/10 p-3 text-red-500 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          {movies.length === 0 && (
            <div className="py-20 text-center rounded-[32px] border-2 border-dashed border-white/5">
               <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">No content found</p>
               <button onClick={() => setIsAdding(true)} className="mt-4 text-red-500 text-xs font-black">Add your first post</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
