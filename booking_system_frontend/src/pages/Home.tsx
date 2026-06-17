import { Link } from 'react-router-dom';
import { Button } from '../components/common';
import { Rocket, Globe, Shield, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { destinations, HAZARD_COLOURS } from '../data/destinations';

export const Home = () => {
  const features = [
    {
      icon: <Rocket size={32} />,
      title: 'Interplanetary Travel',
      description: 'Explore destinations across the solar system with our state-of-the-art spacecraft.',
    },
    {
      icon: <Globe size={32} />,
      title: 'Multiple Destinations',
      description: 'From Mars to Europa, discover new worlds and book your journey today.',
    },
    {
      icon: <Shield size={32} />,
      title: 'Safe & Secure',
      description: 'Your safety is our priority with advanced navigation and life support systems.',
    },
    {
      icon: <Zap size={32} />,
      title: 'Instant Booking',
      description: 'Book your flight in seconds and receive instant confirmation.',
    },
  ];

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center py-20"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-cosmic-gradient bg-clip-text text-transparent">
              Journey Beyond
            </span>
            <br />
            <span className="text-star-white">The Stars</span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xl text-star-white/80 mb-8 max-w-2xl mx-auto"
        >
          Experience the future of space travel with Galaxium. Book your
          interplanetary flight and explore the wonders of our solar system.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link to="/flights">
            <Button size="lg" className="w-full sm:w-auto">
              Explore Flights
            </Button>
          </Link>
          <Button variant="secondary" size="lg" className="w-full sm:w-auto">
            Learn More
          </Button>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <section>
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-center mb-12 text-star-white"
        >
          Why Choose Galaxium?
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-6 text-center hover:bg-white/10 transition-all duration-300"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cosmic-gradient mb-4">
                <div className="text-white">{feature.icon}</div>
              </div>
              <h3 className="text-xl font-semibold text-star-white mb-2">
                {feature.title}
              </h3>
              <p className="text-star-white/70">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Destinations Section */}
      <section>
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-center mb-12 text-star-white"
        >
          Explore <span className="bg-cosmic-gradient bg-clip-text text-transparent">Destinations</span>
        </motion.h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {destinations.map((dest, index) => {
            const hazard = HAZARD_COLOURS[dest.hazard_level];
            return (
              <motion.div
                key={dest.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.07 }}
                whileHover={{ y: -4 }}
              >
                <Link
                  to={`/destinations/${dest.slug}`}
                  className="glass-card p-5 flex flex-col gap-3 h-full hover:bg-white/10 transition-all duration-300 block"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-3xl" aria-hidden="true">{dest.emoji}</span>
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-semibold text-white shrink-0"
                      style={{ backgroundColor: hazard.hex }}
                    >
                      {hazard.label}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-star-white">{dest.display_name}</h3>
                    <p className="text-xs text-star-white/50 mb-2">{dest.body_type}</p>
                    <p className="text-sm text-star-white/70 leading-snug">{dest.tagline}</p>
                  </div>
                  <span className="mt-auto text-sm text-cosmic-purple font-medium">
                    Explore →
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="glass-card p-12 text-center bg-cosmic-gradient"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Ready for Your Space Adventure?
        </h2>
        <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
          Join thousands of space travelers who have already booked their
          journey to the stars. Your adventure awaits!
        </p>
        <Link to="/flights">
          <Button variant="secondary" size="lg">
            Book Your Flight Now
          </Button>
        </Link>
      </motion.section>
    </div>
  );
};

// Made with Bob
