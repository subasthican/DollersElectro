import React from 'react';
import { 
  BoltIcon, 
  ShieldCheckIcon, 
  HeartIcon, 
  CogIcon
} from '@heroicons/react/24/outline';

const AboutPage: React.FC = () => {
  const values = [
    {
      icon: ShieldCheckIcon,
      title: 'Quality Assurance',
      description: 'All products meet international safety and quality standards'
    },
    {
      icon: BoltIcon,
      title: 'Expert Knowledge',
      description: 'Team of certified electrical engineers and technicians'
    },
    {
      icon: HeartIcon,
      title: 'Customer First',
      description: 'Dedicated support team committed to your satisfaction'
    },
    {
      icon: CogIcon,
      title: 'Innovation',
      description: 'Cutting-edge solutions that keep you ahead of the curve'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Matching Categories Style */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10 px-6">
          <div className="mb-6">
            <span className="inline-block px-6 py-2 backdrop-blur-xl bg-blue-500/10 border-2 border-blue-500/20 rounded-full text-blue-600 font-semibold text-sm mb-6">
              ⚡ Our Story
            </span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
            About DollersElectro
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-medium">
            Leading the electrical industry with innovative solutions, exceptional quality, and unwavering commitment to customer satisfaction since 2013.
          </p>
        </div>
      </section>

      {/* Story Section - Clean & Simple */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <div className="order-2 md:order-1">
              <div className="rounded-3xl overflow-hidden shadow-sm">
                <img 
                  src="/dollerselectro_main.jpg" 
                  alt="DollersElectro Store" 
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
            
            {/* Content */}
            <div className="order-1 md:order-2">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Our Story
              </h2>
              <p className="text-lg text-gray-600 mb-4 leading-relaxed">
                Founded in 2013 in Jaffna, DollersElectro started as a small electronics and electrical supply store with a simple mission: to provide quality electrical products to our local community.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Today, we serve customers across Jaffna and surrounding areas, from DIY enthusiasts to professional electricians and businesses of all sizes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section - Apple Grid Style */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
            Why Choose Us
            </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-gray-50 rounded-3xl p-8">
                <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Info - Simple */}
      <section className="py-16 px-6 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
          <p className="text-xl text-gray-400 mb-8">
            Have questions? We'd love to hear from you.
          </p>
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 text-gray-300">
              <div>
              <p className="font-semibold text-white mb-1">Email</p>
              <p>support@dollerselectro.com</p>
            </div>
            <div>
              <p className="font-semibold text-white mb-1">Phone</p>
              <p>077 063 2559</p>
            </div>
            <div>
              <p className="font-semibold text-white mb-1">Location</p>
              <p>11 Stanley Rd, Jaffna</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
