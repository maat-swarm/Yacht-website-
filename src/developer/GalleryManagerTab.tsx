import React, { useState, useEffect, useRef } from 'react';
import { supabase, GalleryItem } from '../lib/supabaseClient';
import { processImageInBrowser, validateImageFile } from './imageProcessor';
import {
  UploadCloud,
  CheckSquare,
  Square,
  Star,
  Eye,
  EyeOff,
  Trash2,
  Edit3,
  GripVertical,
  Plus,
  RefreshCw,
  Folder,
  Layers,
  AlertCircle,
  Check,
} from 'lucide-react';

interface UploadTask {
  id: string;
  file: File;
  name: string;
  progress: number;
  status: 'pending' | 'processing' | 'uploading' | 'completed' | 'error';
  errorMsg?: string;
}

interface GalleryManagerTabProps {
  onNotify: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const GalleryManagerTab: React.FC<GalleryManagerTabProps> = ({ onNotify }) => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [uploadTasks, setUploadTasks] = useState<UploadTask[]>([]);
  const [isUploadingOverall, setIsUploadingOverall] = useState(false);
  const [albumFilter, setAlbumFilter] = useState('All');
  const [bulkAlbumName, setBulkAlbumName] = useState('');
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch gallery items
  const fetchItems = async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('gallery_items')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) {
        onNotify(`Error loading gallery items: ${error.message}`, 'error');
      } else if (data) {
        setItems(data as GalleryItem[]);
      }
    } catch (err: any) {
      onNotify(`Error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Distinct albums list
  const albums = Array.from(new Set(items.map((i) => i.album?.trim()).filter(Boolean)));

  // Filtered view
  const displayItems = albumFilter === 'All' ? items : items.filter((i) => i.album === albumFilter);

  // Counts
  const totalCount = items.length;
  const publishedCount = items.filter((i) => i.published).length;
  const draftsCount = totalCount - publishedCount;

  // File selection handling (up to 60 files)
  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    if (files.length > 60) {
      onNotify('Maximum 60 files allowed in a single batch upload.', 'error');
      return;
    }

    const newTasks: UploadTask[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const val = validateImageFile(f);
      if (!val.valid) {
        onNotify(val.error || 'Invalid file', 'error');
        continue;
      }

      newTasks.push({
        id: `task-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
        file: f,
        name: f.name,
        progress: 0,
        status: 'pending',
      });
    }

    if (newTasks.length > 0) {
      setUploadTasks(newTasks);
      startBatchUpload(newTasks);
    }
  };

  // Concurrency limiter: 3 parallel uploads
  const startBatchUpload = async (tasks: UploadTask[]) => {
    const client = supabase;
    if (!client) return;
    setIsUploadingOverall(true);

    const year = new Date().getFullYear().toString();
    const concurrency = 3;
    let taskQueue = [...tasks];
    let activeWorkers = 0;

    const runNext = async () => {
      if (taskQueue.length === 0) {
        if (activeWorkers === 0) {
          setIsUploadingOverall(false);
          onNotify('Batch upload processing completed.', 'success');
          fetchItems();
        }
        return;
      }

      const currentTask = taskQueue.shift();
      if (!currentTask) return;

      activeWorkers++;

      // Update status to processing
      setUploadTasks((prev) =>
        prev.map((t) => (t.id === currentTask.id ? { ...t, status: 'processing', progress: 20 } : t))
      );

      try {
        // 1. Process in browser (resize 1920px, thumb 600px, webp)
        const processed = await processImageInBrowser(currentTask.file);

        setUploadTasks((prev) =>
          prev.map((t) => (t.id === currentTask.id ? { ...t, status: 'uploading', progress: 50 } : t))
        );

        const uuid = crypto.randomUUID();
        const ext = processed.format === 'webp' ? 'webp' : 'jpg';
        const fullPath = `${year}/${uuid}.${ext}`;
        const thumbPath = `thumbs/${uuid}.${ext}`;

        // 2. Upload full image to Supabase Storage bucket 'gallery'
        const { error: fullUploadError } = await client.storage
          .from('gallery')
          .upload(fullPath, processed.fullBlob, {
            contentType: processed.format === 'webp' ? 'image/webp' : 'image/jpeg',
            cacheControl: '3600',
            upsert: false,
          });

        if (fullUploadError) throw fullUploadError;

        // 3. Upload thumbnail
        const { error: thumbUploadError } = await client.storage
          .from('gallery')
          .upload(thumbPath, processed.thumbBlob, {
            contentType: processed.format === 'webp' ? 'image/webp' : 'image/jpeg',
            cacheControl: '3600',
            upsert: false,
          });

        if (thumbUploadError) throw thumbUploadError;

        // 4. Retrieve public URLs
        const { data: fullUrlData } = client.storage.from('gallery').getPublicUrl(fullPath);
        const { data: thumbUrlData } = client.storage.from('gallery').getPublicUrl(thumbPath);

        setUploadTasks((prev) =>
          prev.map((t) => (t.id === currentTask.id ? { ...t, progress: 85 } : t))
        );

        // 5. Insert row into gallery_items
        const cleanTitle = currentTask.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        const nextOrder = items.length > 0 ? Math.max(...items.map((i) => i.sort_order || 0)) + 1 : 0;

        const { error: dbError } = await client.from('gallery_items').insert({
          title: cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1),
          caption: null,
          album: albumFilter !== 'All' ? albumFilter : 'General',
          image_url: fullUrlData.publicUrl,
          thumb_url: thumbUrlData.publicUrl,
          width: processed.width,
          height: processed.height,
          featured: false,
          published: true,
          sort_order: nextOrder,
        });

        if (dbError) throw dbError;

        setUploadTasks((prev) =>
          prev.map((t) => (t.id === currentTask.id ? { ...t, status: 'completed', progress: 100 } : t))
        );
      } catch (err: any) {
        console.error('Upload error for task', currentTask.name, err);
        setUploadTasks((prev) =>
          prev.map((t) =>
            t.id === currentTask.id ? { ...t, status: 'error', errorMsg: err.message } : t
          )
        );
      } finally {
        activeWorkers--;
        runNext();
      }
    };

    // Spawn initial pool
    for (let w = 0; w < concurrency; w++) {
      runNext();
    }
  };

  // Toggle single item publish status
  const handleTogglePublish = async (item: GalleryItem) => {
    if (!supabase) return;
    const newPublished = !item.published;

    // Optimistic update
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, published: newPublished } : i)));

    try {
      const { error } = await supabase
        .from('gallery_items')
        .update({ published: newPublished })
        .eq('id', item.id);

      if (error) throw error;
      onNotify(`Item ${newPublished ? 'published' : 'moved to drafts'}.`, 'success');
    } catch (err: any) {
      // Rollback
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, published: item.published } : i)));
      onNotify(`Update error: ${err.message}`, 'error');
    }
  };

  // Toggle single item featured status
  const handleToggleFeatured = async (item: GalleryItem) => {
    if (!supabase) return;
    const newFeatured = !item.featured;

    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, featured: newFeatured } : i)));

    try {
      const { error } = await supabase
        .from('gallery_items')
        .update({ featured: newFeatured })
        .eq('id', item.id);

      if (error) throw error;
      onNotify(`Item ${newFeatured ? 'marked as featured' : 'unmarked'}.`, 'success');
    } catch (err: any) {
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, featured: item.featured } : i)));
      onNotify(`Update error: ${err.message}`, 'error');
    }
  };

  // Delete item with confirm
  const handleDeleteItem = async (item: GalleryItem) => {
    if (!supabase) return;
    if (!window.confirm(`Are you sure you want to delete "${item.title}"?`)) return;

    const previousItems = [...items];
    setItems((prev) => prev.filter((i) => i.id !== item.id));

    try {
      const { error } = await supabase.from('gallery_items').delete().eq('id', item.id);
      if (error) throw error;
      onNotify('Gallery item deleted.', 'success');
    } catch (err: any) {
      setItems(previousItems);
      onNotify(`Delete failed: ${err.message}`, 'error');
    }
  };

  // Bulk actions
  const handleSelectAll = () => {
    if (selectedIds.length === displayItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(displayItems.map((i) => i.id));
    }
  };

  const handleBulkPublish = async (status: boolean) => {
    if (!supabase || selectedIds.length === 0) return;

    const prev = [...items];
    setItems((current) =>
      current.map((i) => (selectedIds.includes(i.id) ? { ...i, published: status } : i))
    );

    try {
      const { error } = await supabase
        .from('gallery_items')
        .update({ published: status })
        .in('id', selectedIds);

      if (error) throw error;
      onNotify(`Updated ${selectedIds.length} items to ${status ? 'Published' : 'Draft'}.`, 'success');
      setSelectedIds([]);
    } catch (err: any) {
      setItems(prev);
      onNotify(`Bulk update failed: ${err.message}`, 'error');
    }
  };

  const handleBulkSetAlbum = async () => {
    if (!supabase || selectedIds.length === 0 || !bulkAlbumName.trim()) return;

    const targetAlbum = bulkAlbumName.trim();
    const prev = [...items];
    setItems((current) =>
      current.map((i) => (selectedIds.includes(i.id) ? { ...i, album: targetAlbum } : i))
    );

    try {
      const { error } = await supabase
        .from('gallery_items')
        .update({ album: targetAlbum })
        .in('id', selectedIds);

      if (error) throw error;
      onNotify(`Set album for ${selectedIds.length} items to "${targetAlbum}".`, 'success');
      setBulkAlbumName('');
      setSelectedIds([]);
    } catch (err: any) {
      setItems(prev);
      onNotify(`Bulk album update failed: ${err.message}`, 'error');
    }
  };

  const handleBulkDelete = async () => {
    if (!supabase || selectedIds.length === 0) return;
    if (!window.confirm(`Permanently delete ${selectedIds.length} selected items?`)) return;

    const prev = [...items];
    setItems((current) => current.filter((i) => !selectedIds.includes(i.id)));

    try {
      const { error } = await supabase.from('gallery_items').delete().in('id', selectedIds);
      if (error) throw error;
      onNotify(`Deleted ${selectedIds.length} items.`, 'success');
      setSelectedIds([]);
    } catch (err: any) {
      setItems(prev);
      onNotify(`Bulk delete failed: ${err.message}`, 'error');
    }
  };

  // Reorder sort_order (move up / down)
  const handleMove = async (currentIndex: number, direction: 'up' | 'down') => {
    if (!supabase) return;
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= displayItems.length) return;

    const newItems = [...displayItems];
    const temp = newItems[currentIndex];
    newItems[currentIndex] = newItems[newIndex];
    newItems[newIndex] = temp;

    // Optimistically update
    setItems(newItems);

    try {
      const updates = newItems.map((item, idx) => ({
        id: item.id,
        sort_order: idx,
      }));

      for (const u of updates) {
        await supabase.from('gallery_items').update({ sort_order: u.sort_order }).eq('id', u.id);
      }
      onNotify('Sort order updated.', 'info');
    } catch (err: any) {
      fetchItems();
      onNotify(`Reorder failed: ${err.message}`, 'error');
    }
  };

  // Save Item Edit Modal
  const handleSaveEdit = async () => {
    if (!supabase || !editingItem) return;

    try {
      const { error } = await supabase
        .from('gallery_items')
        .update({
          title: editingItem.title,
          caption: editingItem.caption,
          album: editingItem.album,
          featured: editingItem.featured,
          published: editingItem.published,
        })
        .eq('id', editingItem.id);

      if (error) throw error;
      setItems((prev) => prev.map((i) => (i.id === editingItem.id ? editingItem : i)));
      setEditingItem(null);
      onNotify('Item details updated.', 'success');
    } catch (err: any) {
      onNotify(`Save failed: ${err.message}`, 'error');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Counts & Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#14142B] p-5 rounded-xl border border-brand-purple/20">
        <div>
          <h2 className="text-lg font-bold text-brand-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-gold" />
            <span>Gallery Manager</span>
          </h2>
          <p className="text-xs text-brand-white/60 mt-0.5">
            Manage project showcase photography, albums, and publication status.
          </p>
        </div>

        {/* Real Counts */}
        <div className="flex items-center gap-3 text-xs">
          <div className="bg-[#1A1A38] px-3 py-1.5 rounded-lg border border-brand-purple/15">
            <span className="text-brand-white/50 block text-[10px] uppercase font-mono">Total</span>
            <span className="font-bold text-brand-white text-sm">{totalCount}</span>
          </div>
          <div className="bg-[#1A1A38] px-3 py-1.5 rounded-lg border border-brand-purple/15">
            <span className="text-brand-white/50 block text-[10px] uppercase font-mono">Published</span>
            <span className="font-bold text-emerald-400 text-sm">{publishedCount}</span>
          </div>
          <div className="bg-[#1A1A38] px-3 py-1.5 rounded-lg border border-brand-purple/15">
            <span className="text-brand-white/50 block text-[10px] uppercase font-mono">Drafts</span>
            <span className="font-bold text-amber-400 text-sm">{draftsCount}</span>
          </div>
        </div>
      </div>

      {/* Upload Zone (Drag & Drop or File Picker, up to 60 files) */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFilesSelected(e.dataTransfer.files);
        }}
        className="border-2 border-dashed border-brand-purple/40 hover:border-brand-gold/70 bg-[#161633]/60 hover:bg-[#161633] rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 group"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFilesSelected(e.target.files)}
        />
        <div className="w-12 h-12 rounded-full bg-brand-purple/20 text-brand-gold flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
          <UploadCloud className="w-6 h-6" />
        </div>
        <h4 className="font-semibold text-brand-white text-sm">
          Click or drop photos to upload
        </h4>
        <p className="text-xs text-brand-white/50 mt-1 max-w-sm mx-auto">
          Up to 60 files at once (3 in parallel). In-browser optimization: resized to 1920px, WebP compressed, EXIF stripped.
        </p>
      </div>

      {/* Overall Upload Progress Tray */}
      {uploadTasks.length > 0 && (
        <div className="bg-[#14142B] p-4 rounded-xl border border-brand-purple/20 space-y-3">
          <div className="flex items-center justify-between text-xs text-brand-white">
            <span className="font-semibold">
              Batch Uploading ({uploadTasks.filter((t) => t.status === 'completed').length} / {uploadTasks.length})
            </span>
            <span className="text-[11px] text-brand-gold font-mono">
              {isUploadingOverall ? 'Processing...' : 'Finished'}
            </span>
          </div>

          <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
            {uploadTasks.map((task) => (
              <div key={task.id} className="text-xs bg-[#1A1A38] p-2 rounded flex items-center justify-between gap-3">
                <span className="truncate max-w-[200px] text-brand-white/80">{task.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 bg-brand-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        task.status === 'completed'
                          ? 'bg-emerald-400'
                          : task.status === 'error'
                          ? 'bg-brand-scarlet'
                          : 'bg-brand-gold'
                      }`}
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-brand-white/60 font-mono w-16 text-right">
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Bulk Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#14142B] p-4 rounded-xl border border-brand-purple/20 text-xs">
        {/* Album filter */}
        <div className="flex items-center gap-2">
          <Folder className="w-4 h-4 text-brand-gold shrink-0" />
          <span className="text-brand-white/70">Album:</span>
          <select
            value={albumFilter}
            onChange={(e) => setAlbumFilter(e.target.value)}
            className="bg-[#1A1A38] border border-brand-purple/30 text-brand-white rounded px-2.5 py-1.5 text-xs outline-none focus:border-brand-gold"
          >
            <option value="All">All Albums ({totalCount})</option>
            {albums.map((a) => (
              <option key={a} value={a}>
                {a} ({items.filter((i) => i.album === a).length})
              </option>
            ))}
          </select>
        </div>

        {/* Bulk tools */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleSelectAll}
            className="px-3 py-1.5 rounded bg-[#1A1A38] hover:bg-[#25254A] text-brand-white border border-brand-purple/20 flex items-center gap-1.5 transition-colors"
          >
            {selectedIds.length === displayItems.length && displayItems.length > 0 ? (
              <CheckSquare className="w-3.5 h-3.5 text-brand-gold" />
            ) : (
              <Square className="w-3.5 h-3.5 text-brand-white/50" />
            )}
            <span>Select All ({selectedIds.length})</span>
          </button>

          {selectedIds.length > 0 && (
            <>
              <button
                type="button"
                onClick={() => handleBulkPublish(true)}
                className="px-3 py-1.5 rounded bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/50 flex items-center gap-1 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Publish</span>
              </button>
              <button
                type="button"
                onClick={() => handleBulkPublish(false)}
                className="px-3 py-1.5 rounded bg-amber-950/60 hover:bg-amber-900 text-amber-300 border border-amber-700/50 flex items-center gap-1 transition-colors"
              >
                <EyeOff className="w-3.5 h-3.5" />
                <span>Unpublish</span>
              </button>
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  placeholder="New album name"
                  value={bulkAlbumName}
                  onChange={(e) => setBulkAlbumName(e.target.value)}
                  className="bg-[#1A1A38] border border-brand-purple/30 text-brand-white rounded px-2 py-1 text-xs w-28"
                />
                <button
                  type="button"
                  onClick={handleBulkSetAlbum}
                  disabled={!bulkAlbumName.trim()}
                  className="px-2.5 py-1.5 rounded bg-brand-purple text-brand-white hover:bg-brand-purple/90 disabled:opacity-50"
                >
                  Set
                </button>
              </div>
              <button
                type="button"
                onClick={handleBulkDelete}
                className="px-3 py-1.5 rounded bg-brand-scarlet/80 hover:bg-brand-scarlet text-brand-white flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={fetchItems}
            className="p-1.5 rounded bg-[#1A1A38] hover:bg-[#25254A] text-brand-white/70 hover:text-brand-white border border-brand-purple/20"
            title="Refresh list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Thumbnail Grid */}
      {displayItems.length === 0 ? (
        <div className="bg-[#14142B] p-12 rounded-xl text-center border border-brand-purple/20 text-brand-white/50 text-xs">
          No items found in this view. Use the upload box above to add project photos.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {displayItems.map((item, index) => {
            const isSelected = selectedIds.includes(item.id);

            return (
              <div
                key={item.id}
                className={`bg-[#14142B] rounded-xl overflow-hidden border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-brand-gold shadow-[0_0_12px_rgba(201,162,74,0.3)]'
                    : 'border-brand-purple/20 hover:border-brand-purple/50'
                }`}
              >
                {/* Thumbnail Image Container */}
                <div className="relative aspect-4/3 w-full bg-[#0D0D1A] overflow-hidden group">
                  <img
                    src={item.thumb_url || item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />

                  {/* Checkbox overlay */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedIds((prev) =>
                        prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id]
                      );
                    }}
                    className="absolute top-2 left-2 z-10 w-6 h-6 rounded bg-black/60 flex items-center justify-center text-brand-white"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-brand-gold" />
                    ) : (
                      <Square className="w-4 h-4 text-brand-white/60" />
                    )}
                  </button>

                  {/* Status Badges Overlay */}
                  <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleToggleFeatured(item)}
                      title={item.featured ? 'Featured item' : 'Mark as featured'}
                      className={`w-6 h-6 rounded bg-black/60 flex items-center justify-center transition-colors ${
                        item.featured ? 'text-brand-gold' : 'text-brand-white/40 hover:text-brand-gold'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${item.featured ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(item)}
                      title={item.published ? 'Published' : 'Draft'}
                      className={`w-6 h-6 rounded bg-black/60 flex items-center justify-center transition-colors ${
                        item.published ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {item.published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Hover Reorder arrows */}
                  <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 backdrop-blur-xs p-1 rounded flex items-center justify-between text-[10px] text-brand-white/80">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMove(index, 'up')}
                      className="px-1.5 py-0.5 rounded hover:bg-white/20 disabled:opacity-30"
                    >
                      &larr; Move
                    </button>
                    <span className="font-mono text-[9px] text-brand-gold">#{item.sort_order}</span>
                    <button
                      type="button"
                      disabled={index === displayItems.length - 1}
                      onClick={() => handleMove(index, 'down')}
                      className="px-1.5 py-0.5 rounded hover:bg-white/20 disabled:opacity-30"
                    >
                      Move &rarr;
                    </button>
                  </div>
                </div>

                {/* Details Bar */}
                <div className="p-3 space-y-1 text-xs">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] text-brand-gold uppercase font-mono truncate">
                      {item.album}
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                        item.published ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
                      }`}
                    >
                      {item.published ? 'Live' : 'Draft'}
                    </span>
                  </div>

                  <h5 className="font-bold text-brand-white text-xs truncate" title={item.title}>
                    {item.title}
                  </h5>

                  {/* Card bottom actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-brand-purple/15 text-brand-white/60">
                    <button
                      type="button"
                      onClick={() => setEditingItem(item)}
                      className="hover:text-brand-gold flex items-center gap-1 text-[11px]"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item)}
                      className="hover:text-brand-scarlet text-[11px]"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#14142B] border border-brand-purple/30 rounded-2xl p-6 w-full max-w-md text-brand-white space-y-4 shadow-2xl">
            <h3 className="font-serif text-lg font-bold text-brand-gold flex items-center gap-2">
              <Edit3 className="w-4 h-4" />
              <span>Edit Gallery Item</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold uppercase text-brand-white/70 mb-1">
                Title
              </label>
              <input
                type="text"
                value={editingItem.title}
                onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                className="w-full bg-[#1A1A38] border border-brand-purple/30 rounded px-3 py-2 text-xs text-brand-white outline-none focus:border-brand-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-brand-white/70 mb-1">
                Album
              </label>
              <input
                type="text"
                value={editingItem.album}
                onChange={(e) => setEditingItem({ ...editingItem, album: e.target.value })}
                className="w-full bg-[#1A1A38] border border-brand-purple/30 rounded px-3 py-2 text-xs text-brand-white outline-none focus:border-brand-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-brand-white/70 mb-1">
                Caption
              </label>
              <textarea
                rows={3}
                value={editingItem.caption || ''}
                onChange={(e) => setEditingItem({ ...editingItem, caption: e.target.value })}
                placeholder="Brief project handover details or architectural notes..."
                className="w-full bg-[#1A1A38] border border-brand-purple/30 rounded px-3 py-2 text-xs text-brand-white outline-none focus:border-brand-gold"
              />
            </div>

            <div className="flex items-center gap-4 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingItem.published}
                  onChange={(e) => setEditingItem({ ...editingItem, published: e.target.checked })}
                  className="rounded"
                />
                <span>Published</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingItem.featured}
                  onChange={(e) => setEditingItem({ ...editingItem, featured: e.target.checked })}
                  className="rounded"
                />
                <span>Featured Tile</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-brand-purple/20">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 rounded text-xs text-brand-white/70 hover:text-brand-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-5 py-2 rounded bg-brand-purple hover:bg-brand-purple/90 text-brand-white text-xs font-semibold uppercase tracking-wider"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
