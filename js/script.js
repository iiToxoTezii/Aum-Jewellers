/**
 * AUM JEWELLERS - INTERACTIONS & ANIMATIONS
 */

document.addEventListener('DOMContentLoaded', () => {

  // --- 1. Navbar Scroll Effect ---
  const navbar = document.getElementById('navbar');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // --- 2. Mobile Menu Toggle ---
  const mobileMenu = document.getElementById('mobile-menu');
  const navLinks = document.querySelector('.nav-links');

  if (mobileMenu && navLinks) {
    mobileMenu.addEventListener('click', () => {
      mobileMenu.classList.toggle('active');
      navLinks.classList.toggle('active');
      document.body.classList.toggle('no-scroll');
    });

    // Close menu when a link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.classList.remove('no-scroll');
      });
    });
  }

  // --- 3. Intersection Observer for Reveals ---
  const revealElements = document.querySelectorAll('.reveal-up, .reveal-fade, .reveal-scale');

  const revealOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target); // Only animate once
      }
    });
  }, revealOptions);

  revealElements.forEach(el => {
    revealObserver.observe(el);
  });

  // --- 4. Simple Parallax Effect ---
  const parallaxElements = document.querySelectorAll('.parallax-img');

  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;

    parallaxElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      const elementTop = rect.top + scrolled;
      const windowHeight = window.innerHeight;

      // Only apply parallax when element is in viewport
      if (elementTop < scrolled + windowHeight && elementTop + rect.height > scrolled) {
        const yPos = (scrolled - elementTop) * 0.15; // Parallax speed

        // If it's a background image, apply to background-position
        if (el.style.backgroundImage) {
          el.style.backgroundPosition = `center ${yPos}px`;
        }
        // If it contains an image, apply to the image transform
        else {
          const img = el.querySelector('img');
          if (img) {
            img.style.transform = `translateY(${yPos}px) scale(1.1)`;
          }
        }
      }
    });
  });

});

// --- 5. Google Reviews Integration (Automated) ---
// IMPORTANT: To make this work automatically, you need to provide your Google Place ID.
// 1. Get your Place ID here: https://developers.google.com/maps/documentation/places/web-service/place-id
// 2. Paste it below:
const GOOGLE_PLACE_ID = 'ChIJ9z0MqCVwjsRjH3mAcAMwaM';

window.initReviews = function () {
  if (!GOOGLE_PLACE_ID || GOOGLE_PLACE_ID === 'YOUR_PLACE_ID_HERE') {
    console.warn('Google Reviews automation is inactive. Please set your GOOGLE_PLACE_ID in script.js and API Key in index.html.');
    return; // Fallback reviews remain visible
  }

  const grid = document.querySelector('.testimonials-grid');
  if (!grid) return;

  // Create a dummy map element required by Google PlacesService
  const dummyDiv = document.createElement('div');
  const service = new google.maps.places.PlacesService(dummyDiv);

  service.getDetails({
    placeId: GOOGLE_PLACE_ID,
    fields: ['reviews'] // Only request reviews to save data
  }, (place, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK && place.reviews && place.reviews.length > 0) {
      grid.innerHTML = ''; // Clear the fallback/static reviews

      // We take up to 3 reviews to fit the 3-column grid layout perfectly
      const reviewsToShow = place.reviews.slice(0, 3);

      reviewsToShow.forEach((review, index) => {
        const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
        const photoUrl = review.profile_photo_url || 'images/avatar_placeholder.png'; // Fallback if no photo

        const reviewHTML = `
          <div class="testimonial-card reveal-up in-view" style="transition-delay: ${index * 0.1}s;">
            <div class="testimonial-header">
              <img src="${photoUrl}" alt="${review.author_name}" class="testimonial-avatar" referrerpolicy="no-referrer">
              <div class="testimonial-info">
                <h3>${review.author_name}</h3>
                <span class="testimonial-meta">Google Reviewer</span>
              </div>
              <div class="google-icon">
                <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              </div>
            </div>
            <div class="testimonial-stars">
              <span style="color: #FBBC05;">${stars}</span> <span class="testimonial-time">${review.relative_time_description}</span>
            </div>
            <p class="testimonial-text">"${review.text}"</p>
          </div>
        `;
        grid.insertAdjacentHTML('beforeend', reviewHTML);
      });
    } else {
      console.error('Failed to fetch Google Reviews. Status:', status);
    }
  });
};
