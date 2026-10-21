import React, { useState, useEffect } from 'react';
import { Camera, X } from 'lucide-react';
import { GoldRule } from '../components/GoldRule';

export interface GalleryImage {
  url: string;
  name: string;
}

export const GallerySection: React.FC = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    async function loadGallery() {
      try {
        const base = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const res = await fetch(`${base}/rest/v1/gallery_items?select=image_url,title&published=eq.true&order=sort_order.asc`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows)) {
          setImages(rows.filter((r: any) => r.image_url).map((r: any) => ({ url: r.image_url, name: r.title || 'Project photo' })));
        }
      }
      } catch (err) {
        console.warn('Failed to load gallery from server:', err);
      } finally {
        setLoading(false);
      }
    }

    loadGallery();
  }, []);

  return (
    <section id="gallery" className="py-16 sm:py-24 bg-brand-navy text-brand-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-widest font-semibold text-brand-gold bg-brand-purple/20 px-3.5 py-1.5 rounded-full inline-block mb-3 border border-brand-gold/30">
            Project Showcase
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-brand-white font-bold tracking-tight mb-3">
            Featured Works & Completed Projects
          </h2>
          <p className="text-brand-white/70 text-base sm:text-lg">
            A visual record of our civil engineering, residential developments, and commercial property handovers across South Africa.
          </p>
          <div className="max-w-xs mx-auto">
            <GoldRule withCenterAccent />
          </div>
        </div>

        {/* Gallery Content */}
        {!loading && images.length === 0 ? (
          /* Empty state: 3 placeholder cards */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[1, 2, 3].map((num) => (
              <div
                key={num}
                className="w-full h-[200px] bg-brand-navy rounded-xl border border-brand-gold/20 flex flex-col items-center justify-center gap-3 p-6 text-center shadow-sm"
              >
                <div className="w-12 h-12 rounded-full bg-brand-purple/20 border border-brand-purple/30 flex items-center justify-center">
                  <Camera className="w-6 h-6 text-brand-white/40" />
                </div>
                <span className="text-sm font-medium text-brand-white/40">
                  Gallery launching soon
                </span>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Mobile: Horizontal scroll row (snap-x scroll) */}
            <div className="flex md:hidden overflow-x-auto gap-4 snap-x pb-4 no-scrollbar">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveImage(img.url)}
                  className="w-[280px] h-[200px] shrink-0 rounded-xl overflow-hidden border border-brand-gold/20 snap-start cursor-pointer hover:border-brand-gold transition-colors bg-brand-navy relative group"
                >
                  <img
                    src={img.url}
                    alt={img.name || 'Yacht Properties Project'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>

            {/* Desktop (md+): 3-column grid */}
            <div className="hidden md:grid md:grid-cols-3 gap-6">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveImage(img.url)}
                  className="w-full h-[200px] rounded-xl overflow-hidden border border-brand-gold/20 cursor-pointer hover:border-brand-gold transition-colors bg-brand-navy relative group"
                >
                  <img
                    src={img.url}
                    alt={img.name || 'Yacht Properties Project'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Inline Full-Screen Lightbox Overlay */}
      {activeImage && (
        <div
          className="fixed inset-0 z-50 bg-brand-navy/95 flex items-center justify-center p-4 sm:p-8"
          onClick={() => setActiveImage(null)}
        >
          <button
            onClick={() => setActiveImage(null)}
            className="absolute top-6 right-6 text-brand-white p-2.5 rounded-full bg-brand-purple/40 hover:bg-brand-purple/70 border border-brand-gold/40 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-brand-white" />
          </button>
          <img
            src={activeImage}
            alt="Yacht Properties Project Large View"
            className="max-w-full max-h-[85vh] object-contain rounded-xl border border-brand-gold/40 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
};

export default GallerySection;
