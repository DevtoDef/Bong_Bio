'use client';

import React, { useEffect, useMemo, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import { FaFacebookF, FaInstagram, FaTiktok, FaYoutube } from 'react-icons/fa6';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { SiShopee } from 'react-icons/si';

//================== DASHED SECTION ==================
// Tạo viền nét đứt xung quanh, có bo góc, có đổ bóng
// Dùng SVG để vẽ viền, có thể tùy chỉnh độ dài nét, khoảng cách giữa nét, độ dày nét, bo góc
function DashedSection({
  children,
  className = "",
  dash = 24,     // độ dài nét
  gap = 14,      // khoảng cách giữa nét
  stroke = 5,    // độ dày nét
  radius = 24,   // bo góc
  padding = "p-4 md:p-6",
}: {
  children: React.ReactNode;
  className?: string;
  dash?: number;
  gap?: number;
  stroke?: number;
  radius?: number;
  padding?: string;
}) {
  return (
    <section className={`relative ${className}`}>
      {/* nội dung */}
      <div className={`relative rounded-[${radius}px] ${padding}`}>
        {children}
      </div>

      {/* viền nét đứt dài + nổi khối */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* halo nhẹ để nổi khối */}
        <rect
          x="6" y="6"
          width="calc(100% - 12px)" height="calc(100% - 12px)"
          rx={radius}
          fill="none"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth={stroke + 3}
          strokeDasharray={`${dash} ${gap}`}
          strokeLinecap="round"
        />
        {/* nét chính màu trắng */}
        <rect
          x="6" y="6"
          width="calc(100% - 12px)" height="calc(100% - 12px)"
          rx={radius}
          fill="none"
          stroke="rgba(255,255,255,0.95)"
          strokeWidth={stroke}
          strokeDasharray={`${dash} ${gap}`}
          strokeLinecap="round"
        />
      </svg>

      {/* đổ bóng để “nổi” khỏi nền */}
      <div className="pointer-events-none absolute inset-0 rounded-[24px] drop-shadow-[0_10px_28px_rgba(0,0,0,0.14)]" />
    </section>
  );
}


/* ================== CONFIG ================== */
const BIO = {
  logoUrl: 'https://intphcm.com/data/upload/logo-the-thao-dep.jpg',
  name: 'Review Chất',
  note: 'Review công nghệ, gia dụng và decor',
  socials: [
    { name: 'Facebook', icon: FaFacebookF, url: 'https://facebook.com/' },
    { name: 'Instagram', icon: FaInstagram, url: 'https://instagram.com/' },
    { name: 'TikTok', icon: FaTiktok, url: 'https://tiktok.com/@' },
    { name: 'YouTube', icon: FaYoutube, url: 'https://youtube.com/' },
  ],
  guideImages: ['/guides/step1.jpg', '/guides/step2.jpg', '/guides/step3.jpg'],
  youtubeVideoId: 'oF-c-uduuMQ',
};

const SOCIAL_STYLES: Record<string, string> = {
  Facebook: 'bg-[#1877F2] hover:bg-[#0f5bd3]',
  Instagram: 'bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] hover:brightness-110',
  TikTok: 'bg-black hover:bg-neutral-800',
  YouTube: 'bg-[#FF0000] hover:bg-[#cc0000]',
};

/* ================== TYPES ================== */
interface Product {
  id: string;
  name: string;
  code: string;
  images: string[];
  categories: string[];
  links: { shopee?: string; tiktok?: string };
}
interface CategoryCount { name: string; count: number }

/* ================== API ================== */
async function fetchCategories(): Promise<CategoryCount[]> {
  const res = await fetch('/api/categories');
  const json = await res.json();
  return (json.items ?? []) as CategoryCount[];
}
async function fetchProducts(q: string, category: string): Promise<Product[]> {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (category && category !== 'All') params.set('category', category);
  const res = await fetch(`/api/products?${params.toString()}`);
  const json = await res.json();
  return (json.items ?? []) as Product[];
}

/* ================== ATOMS ================== */
function Chip({ active, children, onClick }: { active?: boolean; children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center whitespace-nowrap px-5 py-3 rounded-full text-base font-medium shadow-sm transition
        ${active ? 'bg-purple-700 text-white' : 'bg-white/80 text-black hover:bg-white'}
      `}
    >
      {children}
    </button>
  );
}

function IconBtn({
  onClick,
  Icon,
  label,
  iconClass = "",
  className = "",
}: {
  onClick?: () => void;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  iconClass?: string;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-center rounded-none
                  bg-white text-black h-12 px-3 leading-none
                  transition hover:bg-gray-50 active:opacity-90 ${className}`}
    >
      {/* icon: block + shrink-0 để không co, align-middle để đồng baseline */}
      <Icon size={18} className={`block shrink-0 align-middle ${iconClass}`} />
      {/* text: khoảng cách nhỏ + căn giữa + nắn 1px để nhìn thẳng hàng hơn */}
      <span className="ml-1.5 align-middle leading-none text-[16px] font-semibold translate-y-[1px]">
        {label}
      </span>
    </button>
  );
}


function HScrollRow({ children }: { children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const st = React.useRef({ down: false, startX: 0, sl: 0 });

  const onDown = (e: React.MouseEvent<HTMLDivElement>) => {
    st.current.down = true;
    st.current.startX = e.pageX;
    st.current.sl = ref.current?.scrollLeft || 0;
    ref.current?.classList.add('dragging');
  };
  const onUpLeave = () => {
    st.current.down = false;
    ref.current?.classList.remove('dragging');
  };
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!st.current.down || !ref.current) return;
    const dx = e.pageX - st.current.startX;
    ref.current.scrollLeft = st.current.sl - dx;
  };
  const onWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    // Lăn dọc để cuộn ngang cho tiện dùng chuột
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      ref.current.scrollLeft += e.deltaY;
      e.preventDefault();
    }
  };
  const scrollBy = (dx: number) => ref.current?.scrollBy({ left: dx, behavior: 'smooth' });

  return (
    <div className="relative">
      <div
        ref={ref}
        className="flex gap-3 overflow-x-auto flex-nowrap touch-pan-x select-none px-5 py-4 touch-no-scrollbar"
        onMouseDown={onDown}
        onMouseUp={onUpLeave}
        onMouseLeave={onUpLeave}
        onMouseMove={onMove}
        onWheel={onWheel}
        role="region"
        aria-label="Bộ lọc danh mục"
      >
        {children}
      </div>

      {/* Gradients mép trái/phải chỉ hiện trên desktop */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-pink-100/90 to-transparent hidden md:block" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-pink-100/90 to-transparent hidden md:block" />

      {/* Nút mũi tên điều hướng (desktop) */}
      <button
        aria-label="Scroll left"
        className="hidden md:flex absolute left-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/90 shadow ring-1 ring-black/5 items-center justify-center hover:bg-white"
        onClick={() => scrollBy(-280)}
      >
        <ChevronLeft className="w-5 h-5 text-black" />
      </button>
      <button
        aria-label="Scroll right"
        className="hidden md:flex absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/90 shadow ring-1 ring-black/5 items-center justify-center hover:bg-white"
        onClick={() => scrollBy(280)}
      >
        <ChevronRight className="w-5 h-5 text-black" />
      </button>
    </div>
  );
}

/* ================== HEADER ================== */
function Header() {
  return (
    <div className="flex flex-col items-center text-center gap-2 pt-4 pb-4">
        <div className="w-28 h-28 rounded-full bg-white/95 p-2 shadow ring-1 ring-black/5 overflow-hidden">
        <img src={BIO.logoUrl} alt="Logo" className="w-full h-full object-contain" />
      </div>
      <h1 className="h-title text-3xl md:text-4xl text-black font-bold">{BIO.name}</h1>
      <p className="text-black text-lg">{BIO.note}</p>
      <div className="flex items-center gap-4 pt-1">
        {BIO.socials.map((s) => {
          const Icon = s.icon;
          return (
            <a
              key={s.name}
              href={s.url}
              aria-label={s.name}
              target="_blank"
              rel="noreferrer"
              className={`p-2.5 rounded-full shadow transition hover:scale-105 ring-1 ring-black/5 ${SOCIAL_STYLES[s.name] ?? 'bg-white'}`}
            >
              <Icon className="w-6 h-6 text-white" />
            </a>
          );
        })}
      </div>
    </div>
  );
}

/* ================== GUIDE LIGHTBOX ================== */
function GuideLightbox({
  images, index, onClose, onPrev, onNext,
}: { images: string[]; index: number; onClose: () => void; onPrev: () => void; onNext: () => void }) {
  const src = images[index] || images[0];
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3" onClick={onClose}>
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-2 right-2 p-2 rounded-full bg-black/70 text-white hover:bg-black" aria-label="Đóng">
          <X className="w-5 h-5" />
        </button>
        <button onClick={onPrev} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 text-white hover:bg-black" aria-label="Ảnh trước">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button onClick={onNext} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 text-white hover:bg-black" aria-label="Ảnh sau">
          <ChevronRight className="w-6 h-6" />
        </button>
        <div className="w-full h-full flex items-center justify-center">
          <Zoom>
            <img src={src} alt="Hướng dẫn" className="max-h-[90vh] w-auto object-contain select-none" loading="eager" />
          </Zoom>
        </div>
      </div>
    </div>
  );
}

/* ================== GUIDE CAROUSEL ================== */
function GuideCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });
  const [idx, setIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setIdx(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    onSelect();
  }, [emblaApi]);

  const nextImg = () => setLightboxIndex((i) => (i + 1) % BIO.guideImages.length);
  const prevImg = () => setLightboxIndex((i) => (i - 1 + BIO.guideImages.length) % BIO.guideImages.length);

  return (
    <>
      <div className="px-4">
        <div className="overflow-hidden rounded-3xl shadow bg-white" ref={emblaRef}>
          <div className="flex">
            {BIO.guideImages.map((src, i) => (
              <div className="min-w-0 flex-[0_0_100%] flex items-center justify-center" key={i}>
                <button
                  type="button"
                  className="w-full h-[260px] md:h-[360px] bg-white flex items-center justify-center active:scale-[.995] transition"
                  onClick={() => { setLightboxIndex(i); setLightboxOpen(true); }}
                >
                  <img
                    src={src}
                    alt={`Hướng dẫn ${i + 1}`}
                    className="max-h-full w-auto object-contain"
                    loading={i === 0 ? 'eager' : 'lazy'}
                    decoding={i === 0 ? 'sync' : 'async'}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center gap-2 py-3">
          {BIO.guideImages.map((_, i) => (
            <span key={i} className={`w-2.5 h-2.5 rounded-full ${i === idx ? 'bg-purple-700' : 'bg-purple-300'}`} />
          ))}
        </div>
      </div>

      {lightboxOpen && (
        <GuideLightbox
          images={BIO.guideImages}
          index={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          onPrev={prevImg}
          onNext={nextImg}
        />
      )}
    </>
  );
}

/* ================== PRODUCT CARD ================== */
function ProductCard({ p }: { p: Product }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });

  useEffect(() => {
    if (!emblaApi) return;
    const id = setInterval(() => { try { emblaApi.scrollNext(); } catch {} }, 5000);
    return () => clearInterval(id);
  }, [emblaApi]);

  const shopee = p.links.shopee || '#';
  const goShopee = () => window.open(shopee, '_blank');
  const goTikTok = () => p.links.tiktok && window.open(p.links.tiktok, '_blank');

  return (
    <div className="bg-white rounded-[22px] shadow-lg overflow-hidden h-full flex flex-col">
      {/* IMAGES */}
      <div ref={emblaRef} onClick={goShopee}>
        <div className="flex">
          {p.images.map((src, i) => (
            <div key={i} className="min-w-0 flex-[0_0_100%]">
              <div className="w-full aspect-square bg-white flex items-center justify-center">
                <img
                  src={src}
                  alt={`${p.name}-${i}`}
                  className="w-full h-full object-contain"
                  loading={i === 0 ? 'eager' : 'lazy'}
                  decoding={i === 0 ? 'sync' : 'async'}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* META */}
      <div className="px-3 pt-2 pb-1">
        <div className="text-black text-xs md:text-sm font-medium">Mã: {p.code || '—'}</div>
        <div className="mt-1 text-black text-sm md:text-base font-semibold leading-snug line-clamp-2">{p.name}</div>
      </div>

      {/* CTAs – giống ảnh mẫu: nền trắng, border trên & đường gạch giữa */}
<div className="mt-auto">
  <div className="grid grid-cols-2 border-t border-gray-200 divide-x divide-gray-200 bg-white">
    <IconBtn
      onClick={goTikTok}
      Icon={FaTiktok}
      label="TikTok"
      iconClass="text-black"
    />
    <IconBtn
      onClick={goShopee}
      Icon={SiShopee}
      label="Shopee"
      iconClass="text-[#EE4D2D]"
    />
  </div>
</div>

    </div>
  );
}

/* ================== MAIN PAGE ================== */
export default function Page() {
  const [q, setQ] = useState('');
  const [categories, setCategories] = useState<CategoryCount[]>([]);
  const [activeCat, setActiveCat] = useState('All');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [allCount, setAllCount] = useState(0);

  useEffect(() => {
    (async () => {
      const cats = await fetchCategories();
      setCategories(cats);
      setAllCount(cats.reduce((s, c) => s + c.count, 0));
    })();
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchProducts(q, activeCat).then(setProducts).finally(() => setLoading(false));
  }, [q, activeCat]);

  const groups = useMemo(() => {
    const g = new Map<string, Product[]>();
    for (const p of products) {
      const cats = p.categories?.length ? p.categories : ['Khác'];
      for (const c of cats) {
        if (activeCat !== 'All' && c !== activeCat) continue;
        if (!g.has(c)) g.set(c, []);
        g.get(c)!.push(p);
      }
    }
    return Array.from(g.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [products, activeCat]);

  return (
  <div className="min-h-screen bg-gradient-to-b from-pink-200 via-pink-100 to-purple-100">
    <div className="max-w-3xl mx-auto py-8 md:py-12">
      {/* Khung 1: Header + GuideCarousel */}
      <DashedSection
        className="mx-4 mt-2 mb-5 rounded-3xl"
  dash={12} gap={16} stroke={5} radius={24}
  padding="p-4 md:p-6"
>
  <Header />
  <GuideCarousel />
</DashedSection>



      {/* Khung 2: toàn bộ phần còn lại */}
      <DashedSection
  className="mx-4 mb-10 rounded-3xl"
  dash={12} gap={16} stroke={5} radius={24}
  padding="p-4 md:p-6"
>
        {/* Tiêu đề + ô tìm kiếm */}
        <div className="pt-2">
          <div className="text-xl font-semibold h-title pb-2 text-black">
            Sản phẩm trong video đều ở bên dưới! 👇
          </div>
          <label className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M21 21l-4.3-4.3" stroke="#666" strokeWidth="2" strokeLinecap="round" />
              <circle cx="10.5" cy="10.5" r="6.5" stroke="#666" strokeWidth="2" />
            </svg>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm kiếm sản phẩm..."
              className="flex-1 outline-none text-[17px]"
            />
          </label>
        </div>

        {/* Chips: không xuống dòng, kéo ngang */}
        <HScrollRow>
  <Chip active={activeCat === 'All'} onClick={() => setActiveCat('All')}>
    All ({allCount})
  </Chip>
  {categories.map((c) => (
    <Chip key={c.name} active={activeCat === c.name} onClick={() => setActiveCat(c.name)}>
      {c.name} ({c.count})
    </Chip>
  ))}
</HScrollRow>


        {/* Groups */}
        <div className="pb-8">
          {loading && <div className="text-center text-gray-600 py-10">Đang tải sản phẩm…</div>}

          {!loading &&
            groups.map(([cat, list]) => (
              <section key={cat} className="pb-6">
                <h2 className="h-title text-2xl mb-3 text-black">
                  {cat} <span className="text-black">({list.length})</span>
                </h2>

                {/* 2 cột mobile, 3 cột desktop; card cao bằng nhau */}
                <div className="grid grid-cols-2 max-[360px]:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
                  {list.map((p) => (
                    <div key={p.id} className="h-full">
                      <ProductCard p={p} />
                    </div>
                  ))}
                </div>
              </section>
            ))}

          {!loading && groups.length === 0 && (
            <div className="text-center text-gray-600 py-12">Không tìm thấy sản phẩm.</div>
          )}
        </div>

        {/* YouTube embed */}
        <div className="pb-2">
          <h3 className="h-title text-2xl mb-3 text-black">Video hướng dẫn sử dụng link bio</h3>
          <div className="aspect-video w-full rounded-2xl overflow-hidden shadow bg-white">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${BIO.youtubeVideoId}`}
              title="YouTube video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      </DashedSection>

    </div>
  </div>
);

}
