import React from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, MessageCircle } from 'lucide-react';

const collectionData = {
  gold: { 
    name: 'Pure Gold', 
    desc: 'Heritage pieces crafted in pure 22K hallmarked gold, featuring timeless artistry and regal motifs.', 
    img: '/images/collections/gold_premium.png',
    intro: "From regal chokers to heritage necklace sets, our Pure Gold Collection is a tribute to India's finest goldsmithing traditions — where every piece is hallmarked, crafted by master artisans, and destined to become a cherished family heirloom.",
    items: [
      { name: 'Heritage Filigree Choker', desc: 'An intricately crafted pure 22K gold choker featuring traditional filigree work and royal motifs — a statement of grandeur for bridal trousseaus.', img: '/images/Jewellery/jewellery_mockup_3.png' },
      { name: 'Antique Lakshmi Haar', desc: 'A majestic long gold necklace featuring Goddess Lakshmi motifs and delicate gold beads, finished with a luminous antique polish.', img: '/images/Jewellery/jewellery_mockup_4.png' },
      { name: 'Floral Medallion Pendant', desc: 'A sophisticated gold pendant set featuring a central floral medallion and exquisite granular detailing, crafted in pure hallmarked 22K gold.', img: '/images/Jewellery/Gold 1.png' },
      { name: 'Royal Temple Bangles', desc: 'Exquisite handcrafted gold bangles with intricate temple carvings and floral engravings, representing timeless Indian heritage.', img: '/images/Jewellery/Gold 2.png' },
      { name: 'Modern Heritage Set', desc: 'A contemporary take on traditional motifs, this gold necklace set features clean lines blended with classic artisan craftsmanship.', img: '/images/Jewellery/Gold 3.png' },
    ]
  },
  silver: { 
    name: 'Modern Silver', 
    desc: 'Contemporary and traditional silver collections crafted in 925 purity for the modern lifestyle.', 
    img: '/images/collections/silver_premium.png',
    intro: "Discover the elegance of 925 Sterling Silver. Our collection blends modern minimalist designs with traditional Indian motifs, perfect for daily elegance or festive celebrations.",
    items: [
        { name: 'Sterling Silver Necklace', desc: 'A stunning contemporary necklace set in 925 pure silver, featuring fluid patterns and a brilliant high-shine finish.', img: '/images/silver jewellery/gen_9_necklace.png' },
        { name: 'Designer Silver Bands', desc: 'Exquisite 925 silver rings with modern minimalist designs, perfect for stacking or as a subtle statement piece.', img: '/images/silver jewellery/gen_13_rings.png' },
        { name: 'Modern Silver Mangalsutra', desc: 'A delicate blend of tradition and modernity, our silver mangalsutras are designed for the modern woman\'s daily elegance.', img: '/images/silver jewellery/gen_3_mangalsutra.png' },
        { name: 'Sacred Ganesha Idol', desc: 'A beautifully crafted pure silver Ganesha idol with intricate detailing, perfect for home altars or as a divine gift.', img: '/images/silver jewellery/gen_1_ganesha.png' },
    ]
  },
  bridal: { 
    name: 'Regal Bridal', 
    desc: 'The Wedding Edit: From intricate Polki and Kundan to breathtaking diamond sets for your special day.', 
    img: '/images/Jewellery/bridal_1.png',
    intro: "Embrace the grandeur of your special day with our exclusive bridal collections. From intricate Polki and Kundan to breathtaking diamond sets, we adorn you for eternity.",
    items: [
      { name: 'Royal Emerald Bridal Set', desc: 'An ultra-luxury heavy gold necklace set adorned with premium emeralds and intricate carvings, designed for a queenly wedding look.', img: '/images/Jewellery/bridal_1.png' },
      { name: 'Heritage Polki Masterpiece', desc: 'A breathtaking Polki set featuring uncut diamonds and South Sea pearls, representing the pinnacle of Rajasthani heritage craftsmanship.', img: '/images/Jewellery/bridal_2.png' },
      { name: 'Eternal Diamond Trousseau', desc: 'A sophisticated white gold and diamond necklace set with brilliant-cut solitaires, offering a timeless glow for the modern bride.', img: '/images/Jewellery/bridal_3.png' },
      { name: 'South Indian Temple Grandeur', desc: 'A traditional 22K gold temple jewellery set featuring divine motifs, rubies, and emeralds for a truly auspicious bridal aura.', img: '/images/Jewellery/bridal_4.png' },
    ]
  },
  corporate: { 
    name: 'Corporate Giftables', 
    desc: 'Custom-crafted pure silver and gold coins meticulously embossed with your company insignia.', 
    img: '/images/collections/corporate_premium.png',
    intro: "Elevate your corporate gifting with our bespoke solutions. We specialize in custom-crafted pure silver and gold coins, meticulously embossed with your company's insignia or the Aum Jewellers hallmark.",
    items: [
      { name: 'Embossed Silver Coin', desc: 'Pure 999 silver coins with high-relief company logo embossing, presented in a luxury velvet-lined case for executive recognition.', img: '/images/corporate/gift_1.png' },
      { name: 'Gold & Silver Medallions', desc: 'Elegant presentation sets featuring a combination of gold-plated and pure silver medallions with premium finishes.', img: '/images/corporate/gift_2.png' },
      { name: 'Heritage Coin Set', desc: 'A curated collection of historical motif coins in pure silver, ideal for festive corporate gifting and ceremonies.', img: '/images/corporate/gift_4.png' },
      { name: 'Bespoke Logo Keepsake', desc: 'Custom-sized medallions with precision laser-engraved company branding and a sophisticated matte finish.', img: '/images/corporate/gift_5.png' },
    ]
  }
};

const CollectionDetail = () => {
  const { id } = useParams();
  const collection = collectionData[id];

  if (!collection) {
    return (
      <div className="premium-container pt-32 pb-20 text-center">
        <h2 className="text-white text-3xl mb-4">Collection Not Found</h2>
        <Link to="/collections" className="btn btn-outline mt-6">Back to Collections</Link>
      </div>
    );
  }

  const revealUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 1, ease: [0.25, 1, 0.5, 1] }
    }
  };

  return (
    <div className="home-view">
      {/* Page Header */}
      <header className="page-header" style={{ minHeight: '75vh', paddingTop: '80px' }}>
        <motion.div 
            initial="hidden"
            animate="visible"
            variants={revealUp}
            className="page-header-content text-center"
        >
          <h1 className="heading-large text-white">{collection.name}</h1>
          <p className="text-champagne opacity-80 max-w-md mx-auto">{collection.desc}</p>
        </motion.div>
      </header>

      {/* Intro Strip */}
      <section className="gold-intro section-padding relative overflow-hidden">
        <div className="container text-center relative z-10">
          <span className="eyebrow">Crafted with Trust</span>
          <h2 className="section-heading text-white">The Art of <em>{collection.name}</em></h2>
          <p className="max-w-2xl mx-auto opacity-70 text-sm leading-relaxed">
            {collection.intro}
          </p>
          <div className="gold-divider mt-8 text-gold opacity-30 text-xl tracking-[1rem]">✦ ✦ ✦</div>
        </div>
      </section>

      {/* Product Gallery */}
      <section className="product-gallery" style={{ background: 'var(--color-bg-dark)', padding: '6rem 0' }}>
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {collection.items && collection.items.map((item, index) => (
              <motion.div 
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={revealUp}
                transition={{ delay: index * 0.1 }}
                className="product-card"
              >
                <div className="product-img-wrap h-[500px] overflow-hidden">
                  <img src={item.img} alt={item.name} className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105" />
                </div>
                <div className="product-info p-8 text-center bg-olive-light">
                  <span className="inline-block px-3 py-1 border border-gold-30 rounded-full text-[0.65rem] tracking-widest uppercase text-gold mb-4">{collection.name} Collection</span>
                  <h3 className="text-white text-2xl mb-2">{item.name}</h3>
                  <p className="opacity-60 text-sm mb-8 leading-relaxed max-w-sm mx-auto">{item.desc}</p>
                  <a href={`https://wa.me/919320197788?text=Hi, I am interested in ${item.name} from the ${collection.name} collection.`} className="btn-text">Enquire Now</a>
                </div>
              </motion.div>
            ))}
          </div>

          {(!collection.items || collection.items.length === 0) && (
            <div className="text-center py-20 opacity-50">
              <p>Items for this collection are coming soon. Please check back later or contact us for bespoke enquiries.</p>
              <Link to="/collections" className="btn btn-outline mt-10">Back to Catalog</Link>
            </div>
          )}
        </div>
      </section>

      <footer className="footer-section pt-10 pb-20 text-center opacity-40">
        <div className="premium-container">
          <p className="text-xs tracking-widest uppercase">&copy; 2026 Aum Jewellers. Pune, India.</p>
        </div>
      </footer>
    </div>
  );
};

export default CollectionDetail;
