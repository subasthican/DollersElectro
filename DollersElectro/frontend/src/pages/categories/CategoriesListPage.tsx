import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BoltIcon, 
  LightBulbIcon, 
  CogIcon, 
  ShieldCheckIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import LiquidGlassButton from '../../components/LiquidGlassButton';

const CategoriesListPage: React.FC = () => {
  const categories = [
    {
      id: '1',
      name: 'Lighting Solutions',
      description: 'LED bulbs, fixtures, and smart lighting systems',
      icon: LightBulbIcon,
      color: 'from-yellow-400 to-orange-500',
      productCount: 45,
      href: '/categories/lighting'
    },
    {
      id: '2',
      name: 'Electrical Components',
      description: 'Switches, outlets, wiring, and electrical accessories',
      icon: BoltIcon,
      color: 'from-blue-500 to-purple-600',
      productCount: 78,
      href: '/categories/electrical'
    },
    {
      id: '3',
      name: 'Smart Home',
      description: 'Automation devices, IoT solutions, and smart controls',
      icon: CogIcon,
      color: 'from-green-400 to-teal-500',
      productCount: 32,
      href: '/categories/smart-home'
    },
    {
      id: '4',
      name: 'Tools & Equipment',
      description: 'Professional electrical tools and testing equipment',
      icon: ShieldCheckIcon,
      color: 'from-red-500 to-pink-600',
      productCount: 56,
      href: '/categories/tools'
    },
    {
      id: '5',
      name: 'Safety & Protection',
      description: 'Circuit breakers, surge protectors, and safety gear',
      icon: BoltIcon,
      color: 'from-indigo-500 to-blue-600',
      productCount: 29,
      href: '/categories/safety'
    },
    {
      id: '6',
      name: 'Cables & Wires',
      description: 'High-quality cables, wires, and connectors',
      icon: BoltIcon,
      color: 'from-gray-500 to-slate-600',
      productCount: 67,
      href: '/categories/cables'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section - iOS 26 Style */}
      <section className="relative py-24 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
        
        <div className="container-custom relative z-10 text-center">
          <div className="mb-6">
            <span className="inline-block px-6 py-2 backdrop-blur-xl bg-blue-500/10 border-2 border-blue-500/20 rounded-full text-blue-600 font-semibold text-sm mb-6">
              ⚡ Explore Our Collection
            </span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
            Product Categories
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-medium">
            Discover our comprehensive range of electrical products and solutions
          </p>
        </div>
      </section>

      {/* Categories Grid - Apple/iOS Style */}
      <section className="py-12 pb-20">
        <div className="max-w-6xl mx-auto px-6">
          {/* Grid Layout - Apple Style 2-3 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={category.href}
                className="group"
              >
                {/* Apple-style Clean Card */}
                <div className="bg-white rounded-3xl p-8 
                              shadow-sm hover:shadow-xl
                              transition-all duration-300 
                              hover:-translate-y-1
                              border border-gray-100">
                  
                  {/* Icon - Simple Circle */}
                  <div className="mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-full 
                                   flex items-center justify-center 
                                   transition-transform duration-300
                                   group-hover:scale-110`}>
                      <category.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  
                  {/* Content - Clean & Simple */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {category.name}
                    </h3>
                    <p className="text-gray-500 text-sm mb-4 leading-relaxed">
                      {category.description}
                    </p>
                    
                    {/* Product Count - Simple Link Style */}
                    <div className="text-blue-600 font-medium text-sm 
                                  group-hover:text-blue-700 
                                  transition-colors">
                      {category.productCount} Products
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Get in Touch Section */}
      <section className="py-20 md:py-24 bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
        <div className="container-custom">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Get in <span className="text-blue-400">Touch</span>
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <EnvelopeIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Email</h3>
                <p className="text-blue-100">support@dollerselectro.com</p>
              </div>
              
              <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PhoneIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Phone</h3>
                <p className="text-blue-100">077 063 2559</p>
              </div>
              
              <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPinIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Address</h3>
                <p className="text-blue-100">11 Stanley Rd, Jaffna</p>
              </div>
              
              <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ClockIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Business Hours</h3>
                <div className="text-blue-100 text-sm">
                  <p>Mon-Thu: 8AM-7:30PM</p>
                  <p>Fri-Sat: 8AM-7:30PM</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <Link to="/contact">
                <LiquidGlassButton
                  variant="light"
                  size="lg"
                >
                  Contact Us
                </LiquidGlassButton>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CategoriesListPage;
