import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';

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
      { name: 'Divine Gold Mangalsutra', desc: 'Handcrafted 22K gold mangalsutra with sacred black beads and a stunning floral gold pendant, representing timeless Indian heritage.', img: '/images/Jewellery/Gold 2.png' },
      { name: 'Modern Heritage Set', desc: 'A contemporary take on traditional motifs, this gold necklace set features clean lines blended with classic artisan craftsmanship.', img: '/images/Jewellery/Gold 3.png' },
    ]
  },
  silver: { 
    name: 'Modern Silver', 
    desc: 'Contemporary and traditional silver collections crafted in 925 purity for the modern lifestyle.', 
    img: '/images/collections/silver_premium.png',
    intro: "Discover the elegance of 925 Sterling Silver. Our collection blends modern minimalist designs with traditional Indian motifs, perfect for daily elegance or festive celebrations.",
    subsections: [
      {
        title: 'Home Appliances',
        items: [
           { name: 'Premium Silver Glasses & Plates', desc: 'A premium aesthetic display of our elegant 925 silver glasses and dining plates.', img: '/images/silver jewellery/gen_16_glasses_dark.png' },
           { name: 'Premium Silver Glasses Set', desc: 'A set of exquisite 925 silver glasses, beautifully displayed.', img: '/images/silver jewellery/gen_18_glasses_dark.png' }
        ]
      },
      {
        title: 'Essentials',
        items: [
           { name: 'Premium Silver Diyas', desc: 'Traditional silver diyas presented in a luxurious dark aesthetic setting.', img: '/images/silver jewellery/gen_17_diyas_dark.png' },
           { name: 'Premium Silver Karanda', desc: 'An elegant pure silver Karanda set for haldi and kumkum, beautifully placed on a decorative tray.', img: '/images/silver jewellery/gen_15_moorti_dark.png' }
        ]
      },
      {
        title: 'Moorties',
        items: [
           { name: 'Divine Silver Ganesha', desc: 'A beautifully crafted sacred pure silver Ganesha idol.', img: '/images/silver jewellery/gen_14_ganesha_dark.png' },
           { name: 'Premium Silver Idol', desc: 'A divine silver idol with luxurious detailing, placed gracefully on a rich background.', img: '/images/silver jewellery/ai_gen_1.png' },
           { name: 'Exquisite Deity Pair', desc: 'Beautifully crafted divine pair with an exquisite finish, ideal for heritage gifting.', img: '/images/silver jewellery/ai_gen_2.png' },
           { name: 'Silver Bal Krishna Idols', desc: 'Exquisitely crafted pure silver Bal Krishna idols.', img: '/images/silver jewellery/ai_gen_wa2.png' },
           { name: 'Silver Horse Showpiece Pair', desc: 'A majestic pair of silver horse showpieces.', img: '/images/silver jewellery/ai_gen_wa3.png' }
        ]
      },
      {
        title: 'Necklaces & Mangalsutras',
        items: [
           { name: 'Modern Silver Mangalsutra', desc: 'Contemporary mangalsutra crafted in pure 925 silver.', img: '/images/silver jewellery/ai_gen_4.png' },
           { name: 'Elegant Silver Mangalsutra', desc: 'A timeless silver mangalsutra with traditional black beads.', img: '/images/silver jewellery/ai_gen_7.png' },
           { name: 'Classic Silver Set', desc: 'A complete matching silver necklace set of exquisite purity.', img: '/images/silver jewellery/ai_gen_9.png' }
        ]
      },
      {
        title: 'Rings, Bracelets & Ornaments',
        items: [
           { name: 'Traditional Golden Nath Collection', desc: 'A beautiful collection of traditional golden naths with intricate pearl and bead work.', img: '/images/silver jewellery/ai_gen_6.png' },
           { name: 'Layered Silver Kamarbandh (Waistband)', desc: 'A stunning layered silver waistband crafted for modern traditional elegance.', img: '/images/silver jewellery/ai_gen_10.png' },
           { name: 'Silver Statement Toe Ring', desc: 'A beautiful silver toe ring with exquisite traditional details.', img: '/images/silver jewellery/gen_4_ring.png' },
           { name: 'Pair of Silver Toe Rings', desc: 'Beautifully matching pair of silver toe rings.', img: '/images/silver jewellery/gen_13_rings.png' },
           { name: 'Charm Bracelet', desc: 'A beautiful silver charm bracelet.', img: '/images/silver jewellery/ai_gen_8.png' },
           { name: 'Luxury Silver Band 1', desc: 'Premium crafted silver band for daily elegance.', img: '/images/silver jewellery/ai_gen_wa1.png' }
        ]
      }
    ]
  },

  corporate: { 
    name: 'Show pieces', 
    desc: 'Custom-crafted pure silver and gold coins meticulously embossed with your company insignia.', 
    img: '/images/collections/corporate_premium.png',
    intro: "Elevate your corporate gifting with our bespoke solutions. We specialize in custom-crafted pure silver and gold coins, meticulously embossed with your company's insignia or the Aum Jewellers hallmark.",
    items: [
      { name: 'Krishna & Radha Flute', desc: 'A beautiful depiction of Lord Krishna and Radha playing the flute, meticulously crafted in premium materials.', img: '/images/corporate/gift_1.png' },
      { name: 'Rajwadi Haathi', desc: 'A beautiful elephant that represents Indian tradition, known as Rajwadi Haathi, crafted with intricate details.', img: '/images/corporate/gift_2.png' },
      { name: 'Divine Metal Frame', desc: 'A beautiful metal frame featuring Goddesses Ganpati, Lakshmi, and Saraswati Mata.', img: '/images/corporate/gift_4.png' },
      { name: 'Acrylic 999 Silver Plated Frame', desc: 'An acrylic frame featuring Ganpati, Lakshmi, and Saraswati Mata with pure 999 silver plating.', img: '/images/corporate/gift_5.png' },
      { name: 'Premium Moorti 1', desc: 'Divine craftsmanship for corporate gifting.', img: '/images/corporate/gen_corp_1_dark.png' },
      { name: 'Premium Moorti 2', desc: 'Divine craftsmanship for corporate gifting.', img: '/images/corporate/gen_corp_2_dark.png' },
      { name: 'Premium Moorti 3', desc: 'Divine craftsmanship for corporate gifting.', img: '/images/corporate/gift_3.png' },
      { name: 'Premium Moorti 4', desc: 'Divine craftsmanship for corporate gifting.', img: '/images/corporate/gen_corp_4_dark.png' }
    ]
  }
};

const CollectionDetail = () => {
  const { id } = useParams();
  const collection = collectionData[id];
  const [expandedSections, setExpandedSections] = useState({0: true, 1: true, 2: true, 3: true, 4: true});

  const toggleSection = (index) => {
    setExpandedSections(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

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
      <header className="page-header relative overflow-hidden" style={{ minHeight: '35vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '100px', paddingBottom: '40px' }}>
        <div className="bg-layer-deep">
          <img src={collection.img} alt={collection.name} className="bg-image bg-opacity-40" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          <div className="bg-gradient-dark"></div>
        </div>
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
      <section className="gold-intro section-padding relative overflow-hidden" style={{ background: 'var(--color-bg-olive)' }}>
        <div className="bg-layer bg-opacity-10">
          <img src="/images/bg/gold_intro.png" alt="Intro Background" className="bg-image bg-opacity-20" />
        </div>
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
          
          {collection.subsections ? (
            <div className="flex flex-col gap-6">
              {collection.subsections.map((section, sIndex) => {
                const isExpanded = expandedSections[sIndex];
                return (
                <div key={sIndex} className="subsection-container border border-gold-30/20 rounded-xl overflow-hidden bg-black/20">
                  <button 
                    onClick={() => toggleSection(sIndex)}
                    className="w-full px-8 py-6 flex justify-between items-center bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <h2 className="text-white text-2xl md:text-3xl font-display tracking-wide m-0" style={{ color: 'var(--color-gold)' }}>
                      {section.title} 
                    </h2>
                    {isExpanded ? <ChevronUp className="text-gold" /> : <ChevronDown className="text-gold" />}
                  </button>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
                          {section.items.map((item, index) => (
                            <motion.div 
                              key={index}
                              initial="hidden"
                              whileInView="visible"
                              viewport={{ once: true }}
                              variants={revealUp}
                              transition={{ delay: index * 0.1 }}
                              className="product-card"
                            >
                              <div className={`product-img-wrap h-[500px] overflow-hidden ${item.img.includes('.jpg') ? 'bg-white/90 p-8 flex items-center justify-center' : ''}`}>
                                <img src={item.img} alt={item.name} className={`w-full h-full transition-transform duration-1000 hover:scale-105 ${item.img.includes('.jpg') ? 'object-contain mix-blend-multiply' : 'object-cover'}`} />
                              </div>
                              <div className="product-info p-8 text-center">
                                <span className="inline-block px-3 py-1 border border-gold-30 rounded-full text-[0.65rem] tracking-widest uppercase text-gold mb-4">{collection.name} - {section.title}</span>
                                <h3 className="text-white text-2xl mb-2">{item.name}</h3>
                                <p className="opacity-60 text-sm mb-8 leading-relaxed max-w-sm mx-auto">{item.desc}</p>
                                <a href={`https://wa.me/919320197788?text=Hi, I am interested in ${item.name} from the ${collection.name} collection.`} className="btn btn-gold w-full mt-4">Enquire Now</a>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )})}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
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
                  <div className={`product-img-wrap h-[500px] overflow-hidden ${item.img.includes('.jpg') ? 'bg-white/90 p-8 flex items-center justify-center' : ''}`}>
                    <img src={item.img} alt={item.name} className={`w-full h-full transition-transform duration-1000 hover:scale-105 ${item.img.includes('.jpg') ? 'object-contain mix-blend-multiply' : 'object-cover'}`} />
                  </div>
                  <div className="product-info p-8 text-center">
                    <span className="inline-block px-3 py-1 border border-gold-30 rounded-full text-[0.65rem] tracking-widest uppercase text-gold mb-4">{collection.name} Collection</span>
                    <h3 className="text-white text-2xl mb-2">{item.name}</h3>
                    <p className="opacity-60 text-sm mb-8 leading-relaxed max-w-sm mx-auto">{item.desc}</p>
                    <a href={`https://wa.me/919320197788?text=Hi, I am interested in ${item.name} from the ${collection.name} collection.`} className="btn btn-gold w-full mt-4">Enquire Now</a>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {(!collection.items || collection.items.length === 0) && (!collection.subsections || collection.subsections.length === 0) && (
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
