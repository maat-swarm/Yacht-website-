import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase, isSupabaseConfigured, GalleryItem } from '../lib/supabaseClient';
import { Lightbox } from './Lightbox';
import { GoldRule } from '../components/GoldRule';
import { useMotionIntensity } from '../motion/hooks';
import { MOTION_EASINGS } from '../motion/tokens';
import { ImageOff, Sparkles, FolderOpen, ArrowDown } from 'lucide-react';

export const GallerySection: React.FC = () => {
  const intensity = useMotionIntensity();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlbum, setSelectedAlbum] = useState<string>('All');
  const [pageLimit, setPageLimit] = useState<number>(24);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [erroredImages, setErroredImages] = useState<Record<string, boolean>>({});

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Fetch published items from Supabase
  useEffect(() => {
    async function fetchGallery() {
      if (!isSupabaseConfigured || !supabase) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('gallery_items')
          .select('*')
          .eq('published', true)
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('Notice loading gallery:', error.message);
        } else if (data) {
          setItems(data as GalleryItem[]);
        }
      } catch (err) {
        console.warn('Error fetching gallery:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchGallery();
  }, []);

  // Distinct albums list
  const albums = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.album && item.album.trim()) {
        set.add(item.album.trim());
      }
    });
    return ['All', ...Array.from(set)];
  }, [items]);

  // Filtered items
  const filteredItems = useMemo(() => {
    if (selectedAlbum === 'All') return items;
    return items.filter((item) => item.album === selectedAlbum);
  }, [items, selectedAlbum]);

  // Visible items based on pagination limit
  const visibleItems = useMemo(() => {
    return filteredItems.slice(0, pageLimit);
  }, [filteredItems, pageLimit]);

  const hasMore = visibleItems.length < filteredItems.length;

  // Infinite scroll loader using IntersectionObserver
  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPageLimit((prev) => prev + 24);
        }
      },
      { rootMargin: '300px' }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore]);

  const handleImageError = (id: string) => {
    setErroredImages((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <section id="gallery" className="py-16 sm:py-24 bg-brand-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-12"
          initial={intensity !== 'off' ? { opacity: 0, y: 24 } : false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, ease: MOTION_EASINGS.default }}
        >
          <span className="text-xs uppercase tracking-widest font-semibold text-brand-purple bg-brand-purple/10 px-3.5 py-1.5 rounded-full inline-block mb-3">
            Project Showcase
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-brand-navy font-bold tracking-tight mb-3">
            Featured Works & Completed Projects
          </h2>
          <p className="text-brand-text/75 text-base sm:text-lg">
            A visual record of our civil engineering, residential developments, and commercial property handovers across South Africa.
          </p>
          <div className="max-w-xs mx-auto">
            <GoldRule withCenterAccent />
          </div>
        </motion.div>

        {/* Empty / Not Connected State: Calm panel "Gallery coming soon" (No stock photos) */}
        {!loading && items.length === 0 && (
          <div className="max-w-xl mx-auto bg-brand-offwhite rounded-2xl p-8 sm:p-12 text-center border border-brand-purple/15 shadow-xs">
            <div className="w-14 h-14 rounded-full bg-brand-purple/10 text-brand-purple flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="w-7 h-7 text-brand-purple" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-brand-navy mb-2">
              Gallery Coming Soon
            </h3>
            <p className="text-sm text-brand-text/75 leading-relaxed max-w-md mx-auto">
              Our site photographers and engineering team are compiling high-resolution folios from recently completed construction handovers and commercial developments.
            </p>
            <div className="mt-6 pt-4 border-t border-brand-purple/10">
              <span className="text-xs font-mono text-brand-text/50">
                Official project documentation will be published as certifications are formalized.
              </span>
            </div>
          </div>
        )}

        {/* Album Filter Chips with Sliding Indicator */}
        {items.length > 0 && albums.length > 1 && (
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar">
            {albums.map((album) => {
              const isSelected = selectedAlbum === album;

              return (
                <button
                  key={album}
                  type="button"
                  onClick={() => {
                    setSelectedAlbum(album);
                    setPageLimit(24);
                  }}
                  className={`relative min-h-[44px] px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors select-none ${
                    isSelected ? 'text-brand-purple' : 'text-brand-text/70 hover:text-brand-navy'
                  }`}
                  data-interactive="true"
                >
                  <span className="relative z-10">{album}</span>

                  {/* Sliding active indicator */}
                  {isSelected && (
                    <motion.div
                      layoutId="active-album-chip"
                      className="absolute inset-0 bg-brand-purple/10 rounded-full border border-brand-purple/20 shadow-2xs"
                      transition={{ duration: 0.3, ease: MOTION_EASINGS.default }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Masonry / Aspect Ratio Preserved Grid */}
        {visibleItems.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {visibleItems.map((item, index) => {
              const isFeatured = item.featured;
              const hasError = erroredImages[item.id];
              const aspectRatio = item.width && item.height ? item.width / item.height : 1.33;

              return (
                <motion.div
                  key={item.id}
                  initial={intensity !== 'off' ? { opacity: 0, y: 20 } : false}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{
                    duration: 0.5,
                    delay: (index % 8) * 0.05,
                    ease: MOTION_EASINGS.default,
                  }}
                  onClick={() => !hasError && setLightboxIndex(index)}
                  className={`group relative rounded-xl overflow-hidden shadow-xs cursor-pointer bg-gradient-to-br from-brand-navy/15 via-brand-purple/10 to-brand-scarlet/10 border border-brand-purple/10 ${
                    isFeatured ? 'col-span-2 row-span-2' : 'col-span-1'
                  }`}
                  data-interactive="true"
                >
                  {/* Container preserving aspect ratio to eliminate layout shifts */}
                  <div
                    className="relative w-full overflow-hidden"
                    style={{
                      aspectRatio: isFeatured ? '16 / 10' : `${aspectRatio}`,
                      minHeight: '180px',
                    }}
                  >
                    {!hasError ? (
                      <img
                        src={item.thumb_url || item.image_url}
                        alt={item.title}
                        loading="lazy"
                        decoding="async"
                        onError={() => handleImageError(item.id)}
                        className={`w-full h-full object-cover transition-transform duration-700 ease-out ${
                          intensity === 'full' ? 'group-hover:scale-106' : ''
                        }`}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-brand-offwhite text-brand-text/50">
                        <ImageOff className="w-8 h-8 mb-2 text-brand-purple/40" />
                        <span className="text-xs font-semibold">Image unavailable</span>
                      </div>
                    )}

                    {/* Desktop Hover Effects: Thin gold border fades in */}
                    {intensity === 'full' && (
                      <div className="absolute inset-0 border-2 border-brand-gold/0 group-hover:border-brand-gold/60 transition-colors duration-300 pointer-events-none rounded-xl" />
                    )}

                    {/* Desktop Hover Effects: Caption gradient slides up */}
                    {intensity === 'full' && (
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/95 via-brand-navy/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4 text-brand-white">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-brand-gold">
                          {item.album}
                        </span>
                        <h4 className="font-serif text-sm font-bold text-brand-white truncate">
                          {item.title}
                        </h4>
                        {item.caption && (
                          <p className="text-[11px] text-brand-white/80 line-clamp-2 mt-0.5">
                            {item.caption}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Infinite Scroll Sentinel */}
        {hasMore && (
          <div ref={sentinelRef} className="py-8 flex justify-center">
            <div className="flex items-center gap-2 text-xs text-brand-purple font-semibold animate-pulse">
              <ArrowDown className="w-4 h-4" />
              <span>Loading additional works...</span>
            </div>
          </div>
        )}

      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <Lightbox
          items={filteredItems}
          currentIndex={lightboxIndex}
          isOpen={lightboxIndex !== null}
          onClose={() => setLightboxIndex(null)}
          onNavigate={(newIdx) => setLightboxIndex(newIdx)}
        />
      )}
    </section>
  );
};
