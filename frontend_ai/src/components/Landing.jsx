import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Local image paths for the carousel (replace with your actual image paths)
  const slides = [
    {
      image: 'https://i.pinimg.com/736x/56/0e/fa/560efa36c00b3f25ec8fab0fd58a13a9.jpg',
      title: 'Join Our Vibrant Farmers Market',
      description: 'Showcase your fresh produce to a community passionate about local, sustainable farming.'
    },
    {
      image: 'https://cshepkenya.org/wp-content/uploads/2024/04/Cshep-Organic-farmers-market-at-kidventurous-Garden-estate-6.jpg',
      title: 'Connect with Local Buyers',
      description: 'Bring your harvest to market and connect directly with customers who value quality.'
    },
    {
      image: 'https://lh3.googleusercontent.com/gps-cs-s/AC9h4no0gTo5pyBLOQUB3lC3mCa2aogCESrI8i0H6mg3eBTBcp7BBUY8LY-cvfsTQDZ0nUvK1yh962Yb8ramFWh4angZEVQtyikEDhHIisdGLDKu74hfkoBvIESwZfQGEIVkH6ElAd4x=s680-w680-h510-rw',
      title: 'Grow Your Farm’s Reach',
      description: 'Partner with us to sell your organic produce in thriving community markets.'
    }
  ];

  // Gallery images with proper aspect ratios for better responsiveness
  const galleryImages = [
    {
      src: 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Fresh vegetables at farmers market',
      category: 'Produce'
    },
    {
      src: 'https://images.unsplash.com/photo-1570996055360-d5c30deeb778?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Local farmers market stall',
      category: 'Market'
    },
    {
      src: 'https://images.unsplash.com/photo-1461354464878-ad92f492a5a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Organic fruits display',
      category: 'Produce'
    },
    {
      src: 'https://images.unsplash.com/photo-1591722861017-928458cc4a00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Farmers market community',
      category: 'Community'
    },
    {
      src: 'https://images.unsplash.com/photo-1591722861193-15533830c026?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Fresh bread at market',
      category: 'Bakery'
    },
    {
      src: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Colorful market scene',
      category: 'Market'
    },
    {
      src: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Local honey products',
      category: 'Products'
    },
    {
      src: 'https://images.unsplash.com/photo-1570996055360-d5c30deeb778?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Farmers market flowers',
      category: 'Flowers'
    }
  ];

  // Categories for gallery filtering
  const categories = ['All', 'Produce', 'Market', 'Community', 'Bakery', 'Products', 'Flowers'];

  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    // Handle scroll event for header
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Carousel auto-slide
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
    };
  }, [slides.length]);

  const handleSlideChange = (index) => {
    setCurrentSlide(index);
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  // Filter gallery images by category
  const filteredGalleryImages = activeCategory === 'All' 
    ? galleryImages 
    : galleryImages.filter(image => image.category === activeCategory);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
      {/* Modern Header */}
      <header className={`fixed w-full top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-md py-2' : 'bg-transparent py-4'} ${isMenuOpen ? 'bg-white' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white">
                <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor"></path>
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">Farmers Market</span>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button onClick={() => scrollToSection('about')} className="text-gray-800 font-medium hover:text-emerald-600 transition-colors duration-200">About</button>
            <button onClick={() => scrollToSection('gallery')} className="text-gray-800 font-medium hover:text-emerald-600 transition-colors duration-200">Gallery</button>
            <button onClick={() => scrollToSection('testimonials')} className="text-gray-800 font-medium hover:text-emerald-600 transition-colors duration-200">Testimonials</button>
            <button onClick={() => scrollToSection('contact')} className="text-gray-800 font-medium hover:text-emerald-600 transition-colors duration-200">Contact</button>
          </nav>
          
          <div className="flex items-center space-x-3">
            <Link to="/login" className="hidden sm:block px-4 py-2 sm:px-5 sm:py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors duration-200 shadow-sm text-sm sm:text-base">
              Login
            </Link>
            <Link to="/signup" className="hidden sm:block px-4 py-2 sm:px-5 sm:py-2 rounded-lg bg-white text-emerald-700 font-semibold border border-emerald-600 hover:bg-gray-100 transition-colors duration-200 shadow-sm text-sm sm:text-base">
              Register
            </Link>
            
            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z"></path>
                </svg>
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-6 py-4 space-y-4">
              <button onClick={() => scrollToSection('about')} className="block w-full text-left py-2 text-gray-800 font-medium hover:text-emerald-600 transition-colors duration-200">About</button>
              <button onClick={() => scrollToSection('gallery')} className="block w-full text-left py-2 text-gray-800 font-medium hover:text-emerald-600 transition-colors duration-200">Gallery</button>
              <button onClick={() => scrollToSection('testimonials')} className="block w-full text-left py-2 text-gray-800 font-medium hover:text-emerald-600 transition-colors duration-200">Testimonials</button>
              <button onClick={() => scrollToSection('contact')} className="block w-full text-left py-2 text-gray-800 font-medium hover:text-emerald-600 transition-colors duration-200">Contact</button>
              <div className="pt-4 border-t border-gray-200 flex flex-col space-y-3">
                <Link to="/login" className="px-5 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors duration-200 shadow-sm text-center">
                  Login
                </Link>
                <Link to="/signup" className="px-5 py-2 rounded-lg bg-white text-emerald-700 font-semibold border border-emerald-600 hover:bg-gray-100 transition-colors duration-200 shadow-sm text-center">
                  Register
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section with Carousel */}
      <section className="relative w-full h-screen flex items-center justify-center bg-gray-50 overflow-hidden pt-16">
        <div className="absolute inset-0 z-0">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ backgroundImage: `url("${slide.image}")` }}
            ></div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-white/85 to-transparent z-10"></div>
          <div className="absolute inset-0 bg-black/20 z-10"></div>
        </div>
        
        <div className="relative z-20 max-w-7xl w-full px-4 sm:px-6 mx-auto">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4">
              {slides[currentSlide].title}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-800 mb-8">
              {slides[currentSlide].description}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link to="/signup" className="px-6 py-3 sm:px-8 sm:py-4 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-center text-sm sm:text-base">
                Join Now
              </Link>
              <button onClick={() => scrollToSection('about')} className="px-6 py-3 sm:px-8 sm:py-4 bg-white/90 text-gray-900 font-semibold rounded-lg hover:bg-white transition-all duration-300 border border-gray-200 hover:shadow-md transform hover:-translate-y-1 text-sm sm:text-base">
                Learn More
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Controls */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-3">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-emerald-600 w-8' : 'bg-white/80'
              } hover:bg-emerald-500`}
              onClick={() => handleSlideChange(index)}
              aria-label={`Go to slide ${index + 1}`}
            ></button>
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 hidden md:block">
          <div className="animate-bounce">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Join Our Market</h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
              Partner with us to bring your farm's fresh produce to a thriving community of buyers.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256" className="text-emerald-600">
                    <path d="M223.45,40.07a8,8,0,0,0-7.52-7.52C139.8,28.08,78.82,51,52.82,94a87.09,87.09,0,0,0-12.76,49c.57,15.92,5.21,32,13.79,47.85l-19.51,19.5a8,8,0,0,0,11.32,11.32l19.5-19.51C81,210.73,97.09,215.37,113,215.94q1.67.06,3.33.06A86.93,86.93,0,0,0,162,203.18C205,177.18,227.93,116.21,223.45,40.07ZM153.75,189.5c-22.75,13.78-49.68,14-76.71.77l88.63-88.62a8,8,0,0,0-11.32-11.32L65.73,179c-13.19-27-13-54,.77-76.71,22.09-36.47,74.6-56.44,141.31-54.06C210.2,114.89,190.22,167.41,153.75,189.5Z"></path>
                  </svg>
                ),
                title: "Organic Focus",
                description: "Showcase your certified organic produce to health-conscious consumers."
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256" className="text-emerald-600">
                    <path d="M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.34c18.83-18.83,27.3-37.61,27.65-38.4A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128,133.33,133.33,0,0,1,48.07,97.25C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231.05,128C223.84,141.46,192.43,192,128,192Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z"></path>
                  </svg>
                ),
                title: "Sustainable Community",
                description: "Join farmers committed to regenerative practices for a healthier planet."
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256" className="text-emerald-600">
                    <path d="M247.42,117l-14-35A15.93,15.93,0,0,0,218.58,72H184V64a8,8,0,0,0-8-8H24A16,16,0,0,0,8,72V184a16,16,0,0,0,16,16H41a32,32,0,0,0,62,0h50a32,32,0,0,0,62,0h17a16,16,0,0,0,16-16V120A7.94,7.94,0,0,0,247.42,117ZM184,88h34.58l9.60,24H184ZM24,72H168v64H24ZM72,208a16,16,0,1,1,16-16A16,16,0,0,1,72,208Zm81-24H103A32,32,0,0,0-62,0H24V152H168v12.31A32.11,32.11,0,0,0,153,184Zm31,24a16,16,0,1,1,16-16A16,16,0,0,1,184,208Zm48-24H215A32.06,32.06,0,0,0-31,24V128h48Z"></path>
                  </svg>
                ),
                title: "Local Reach",
                description: "Sell directly to local customers through our vibrant market network."
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-emerald-50 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-emerald-100 transition-colors duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 text-sm sm:text-base">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Market Story</h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
              Since 2010, we've connected farmers with communities, creating vibrant markets where fresh produce thrives.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div>
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">Our Mission</h3>
                <p className="text-gray-600 mb-6 text-sm sm:text-base">
                  We aim to foster sustainable agriculture by bridging the gap between local farmers and conscious consumers. Our markets provide a platform for organic and locally grown produce, promoting healthier communities and a greener planet.
                </p>
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">Our History</h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  Founded in 2010, Farmers Market began as a small initiative to support local growers. Today, we operate multiple markets across the region, helping thousands of farmers reach customers who value quality and sustainability.
                </p>
              </div>
            </div>
            <div className="bg-emerald-600 rounded-2xl overflow-hidden shadow-xl">
              <div className="aspect-video bg-gray-200 rounded-2xl flex items-center justify-center">
                <svg className="w-16 h-16 sm:w-24 sm:h-24 text-emerald-200" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M243.33,90.91,210,56.5A16,16,0,0,0,198.46,52H160V40a12,12,0,0,0-12-12H52A12,12,0,0,0,40,40V180a12,12,0,0,0,12,12h20v28a12,12,0,0,0,12,12H208a12,12,0,0,0,12-12V159.44a16.07,16.07,0,0,0-4.67-11.37ZM160,68h30.46l16,16H160ZM196,212H96V192h76a12,12,0,0,1,12,12Zm20-52H160V140h56Z"></path>
                </svg>
              </div>
            </div>
          </div>
          <div className="text-center mt-10 sm:mt-12">
            <Link to="/signup" className="px-6 py-3 sm:px-8 sm:py-4 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl inline-flex items-center text-sm sm:text-base">
              Join Our Community
              <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">Market Gallery</h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
              Explore the vibrant atmosphere of our farmers markets through our gallery.
            </p>
          </div>
          
          {/* Gallery Filter */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm sm:text-base transition-colors duration-200 ${
                  activeCategory === category
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          
          {/* Gallery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredGalleryImages.map((image, index) => (
              <div key={index} className="group cursor-pointer overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300">
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  <img 
                    src={image.src} 
                    alt={image.alt}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-white font-medium text-center px-2 text-sm sm:text-base">View Image</span>
                  </div>
                </div>
                <div className="p-3 sm:p-4">
                  <p className="text-gray-700 text-sm sm:text-base">{image.alt}</p>
                  <span className="text-xs text-emerald-600 font-medium">{image.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 bg-emerald-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
            {[
              { number: "500+", label: "Active Farmers" },
              { number: "25", label: "Market Locations" },
              { number: "10K+", label: "Weekly Visitors" },
              { number: "15", label: "Years of Service" }
            ].map((stat, index) => (
              <div key={index} className="p-4 sm:p-6">
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-emerald-100 text-sm sm:text-base">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-16 sm:py-20 bg-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Farmers Say</h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
              Hear from farmers who've grown their reach with our markets.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                quote: "This market transformed my small farm into a thriving business!",
                author: "Sarah J.",
                role: "Organic Farmer",
                image: "/assets/images/farmer1.jpg"
              },
              {
                quote: "The community support and direct sales have been a game-changer.",
                author: "Michael T.",
                role: "Local Grower",
                image: "/assets/images/farmer2.jpg"
              },
              {
                quote: "I love the vibrant atmosphere and loyal customers at these markets.",
                author: "Lisa M.",
                role: "Family Farmer",
                image: "/assets/images/farmer3.jpg"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300">
                <div className="text-emerald-500 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 256 256" className="w-6 h-6 sm:w-8 sm:h-8">
                    <path d="M140,56H40A16,16,0,0,0,24,72V184a16,16,0,0,0,16,16h84.23L164,240V200h20a16,16,0,0,0,16-16V72A16,16,0,0,0,180,56Zm0,128H40V72h100v88.23L128.47,168H140Zm40,0H180V72h20V184Z"></path>
                  </svg>
                </div>
                <p className="text-gray-700 text-base sm:text-lg mb-6">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full mr-3 sm:mr-4 overflow-hidden">
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24ZM74.08,197.5a64,64,0,0,1,107.84,0,87.83,87.83,0,0,1-107.84,0ZM96,120a32,32,0,1,1,32,32A32,32,0,0,1,96,120Zm97.76,66.41a79.66,79.66,0,0,0-36.06-28.75,48,48,0,1,0-59.4,0,79.66,79.66,0,0,0-36.06,28.75,88,88,0,1,1,131.52,0Z"></path>
                      </svg>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">{testimonial.author}</p>
                    <p className="text-gray-500 text-xs sm:text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">Ready to Join Our Market?</h2>
          <p className="text-base sm:text-lg text-emerald-100 max-w-3xl mx-auto mb-6 sm:mb-8">
            Register your farm today and start connecting with customers who value fresh, local produce.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link to="/signup" className="px-6 py-3 sm:px-8 sm:py-4 bg-white text-emerald-600 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base">
              Create Account
            </Link>
            <button onClick={() => scrollToSection('contact')} className="px-6 py-3 sm:px-8 sm:py-4 bg-transparent text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-300 border border-white text-sm sm:text-base">
              Contact Us
            </button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">Get in Touch</h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
              Have questions or want to join our network? Send us a message, and we'll get back to you soon.
            </p>
          </div>
          <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-100">
            <form>
              <div className="mb-4 sm:mb-6">
                <label htmlFor="name" className="block text-gray-900 font-medium mb-2 text-sm sm:text-base">Name</label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-colors duration-200 text-sm sm:text-base"
                  placeholder="Your Name"
                  required
                />
              </div>
              <div className="mb-4 sm:mb-6">
                <label htmlFor="email" className="block text-gray-900 font-medium mb-2 text-sm sm:text-base">Email</label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-colors duration-200 text-sm sm:text-base"
                  placeholder="Your Email"
                  required
                />
              </div>
              <div className="mb-4 sm:mb-6">
                <label htmlFor="message" className="block text-gray-900 font-medium mb-2 text-sm sm:text-base">Message</label>
                <textarea
                  id="message"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-colors duration-200 text-sm sm:text-base"
                  rows="5"
                  placeholder="Your Message"
                  required
                ></textarea>
              </div>
              <div className="text-center">
                <button
                  type="submit"
                  className="px-6 py-3 sm:px-8 sm:py-4 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-10 sm:mb-12">
            <div>
              <h3 className="text-lg font-semibold mb-3 sm:mb-4">Farmers Market</h3>
              <p className="text-gray-400 text-sm sm:text-base">
                Connecting farmers with communities since 2010.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3 sm:mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><button onClick={() => scrollToSection('about')} className="text-gray-400 hover:text-white transition-colors duration-200 text-sm sm:text-base">About</button></li>
                <li><button onClick={() => scrollToSection('gallery')} className="text-gray-400 hover:text-white transition-colors duration-200 text-sm sm:text-base">Gallery</button></li>
                <li><button onClick={() => scrollToSection('testimonials')} className="text-gray-400 hover:text-white transition-colors duration-200 text-sm sm:text-base">Testimonials</button></li>
                <li><button onClick={() => scrollToSection('contact')} className="text-gray-400 hover:text-white transition-colors duration-200 text-sm sm:text-base">Contact</button></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3 sm:mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400 text-sm sm:text-base">
                <li>123 Market Lane</li>
                <li>Green Valley, CA 90210</li>
                <li>(555) 123-4567</li>
                <li>info@farmersmarket.com</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3 sm:mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256" className="w-5 h-5 sm:w-6 sm:h-6">
                    <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm8,191.63V152h24a8,8,0,0,0,0-16H136V112a16,16,0,0,1,16-16h16a8,8,0,0,0,0-16H152a32,32,0,0,0-32,32v24H96a8,8,0,0,0,0,16h24v63.63a88,88,0,1,1,16,0Z"></path>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256" className="w-5 h-5 sm:w-6 sm:h-6">
                    <path d="M247.39,68.94A8,8,0,0,0,240,64H209.57A48.66,48.66,0,0,0,168.1,40a46.91,46.91,0,0,0-33.75,13.7A47.9,47.9,0,0,0,120,88v6.09C79.74,83.47,46.81,50.72,46.46,50.37a8,8,0,0,0-13.65,4.92c-4.31,47.79,9.57,79.77,22,98.18a110.93,110.93,0,0,0,21.88,24.2c-15.23,17.53-39.21,26.74-39.47,26.84a8,8,0,0,0-3.85,11.93c.75,1.12,3.75,5.05,11.08,8.72C53.51,229.7,65.48,232,80,232c70.67,0,129.72-54.42,135.75-124.44l29.91-29.9A8,8,0,0,0,247.39,68.94Zm-45,29.41a8,8,0,0,0-2.32,5.14C196,166.58,143.28,216,80,216c-10.56,0-18-1.4-23.22-3.08,11.51-6.25,27.56-17,37.88-32.48A8,8,0,0,0,92,169.08c-.47-.27-43.91-26.34-44-96,16,13,45.25,33.17,78.67,38.79A8,8,0,0,0,136,104V88a32,32,0,0,1,9.6-22.92A30.94,30.94,0,0,1,167.9,56c12.66.16,24.49,7.88,29.44,19.21A8,8,0,0,0,204.67,80h16Z"></path>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256" className="w-5 h-5 sm:w-6 sm:h-6">
                    <path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160ZM176,24H80A56.06,56.06,0,0,0,24,80v96a56.06,56.06,0,0,0,56,56h96a56.06,56.06,0,0,0,56-56V80A56.06,56.06,0,0,0,176,24Zm40,152a40,40,0,0,1-40,40H80a40,40,0,0,1-40-40V80A40,40,0,0,1,80,40h96a40,40,0,0,1,40,40ZM192,76a12,12,0,1,1-12-12A12,12,0,0,1,192,76Z"></path>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 sm:pt-8 text-center text-gray-400 text-sm sm:text-base">
            <p>© 2025 Farmers Market. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;