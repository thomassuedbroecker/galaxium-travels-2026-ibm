import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Wind, Thermometer, Gauge, Clock, AlertTriangle, Lightbulb } from 'lucide-react';
import type { Flight } from '../types';
import { destinations, HAZARD_COLOURS } from '../data/destinations';
import { getFlights } from '../services/api';
import { LoadingSpinner, Button } from '../components/common';
import { FlightCard } from '../components/flights/FlightCard';
import { UserIdentification } from '../components/user/UserIdentification';
import { BookingModal } from '../components/bookings/BookingModal';
import { useUser } from '../hooks/useUser';
import toast from 'react-hot-toast';

export const DestinationDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useUser();

  const destination = destinations.find((d) => d.slug === slug);

  const [flights, setFlights] = useState<Flight[]>([]);
  const [isLoadingFlights, setIsLoadingFlights] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    if (!destination) return;
    const load = async () => {
      setIsLoadingFlights(true);
      try {
        const data = await getFlights({ destination: destination.display_name });
        setFlights(data);
      } catch {
        toast.error('Failed to load flights for this destination');
      } finally {
        setIsLoadingFlights(false);
      }
    };
    load();
  }, [destination]);

  const handleBookFlight = (flight: Flight) => {
    setSelectedFlight(flight);
    if (!user) {
      setShowUserModal(true);
    } else {
      setShowBookingModal(true);
    }
  };

  const handleUserIdentified = () => {
    setShowBookingModal(true);
  };

  const handleBookingSuccess = async () => {
    if (!destination) return;
    try {
      const data = await getFlights({ destination: destination.display_name });
      setFlights(data);
    } catch {
      // non-critical — flight list just won't refresh
    }
  };

  // Unknown slug — friendly not-found state
  if (!destination) {
    return (
      <div className="text-center py-24 space-y-6">
        <p className="text-6xl">🪐</p>
        <h1 className="text-3xl font-bold text-star-white">Destination not found</h1>
        <p className="text-star-white/70">
          We don't have a destination with the slug <code className="text-cosmic-purple">/{slug}</code> in our charts.
        </p>
        <Link to="/flights">
          <Button>Browse All Flights</Button>
        </Link>
      </div>
    );
  }

  const hazard = HAZARD_COLOURS[destination.hazard_level];

  const tempLabel = (() => {
    const { surface_temp_min: min, surface_temp_max: max } = destination;
    if (min === null && max === null) return 'No solid surface';
    if (max === null) return `${min}°C and below`;
    if (min === max) return `${min}°C`;
    return `${min}°C to ${max}°C`;
  })();

  return (
    <div className="space-y-12">
      {/* Back link */}
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
        <Link
          to="/flights"
          className="inline-flex items-center gap-2 text-star-white/60 hover:text-star-white transition-colors text-sm"
        >
          <ArrowLeft size={16} />
          Back to flights
        </Link>
      </motion.div>

      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-card p-10 text-center"
      >
        <p className="text-7xl mb-6" aria-hidden="true">{destination.emoji}</p>
        <div className="inline-block px-3 py-1 rounded-full border border-white/20 bg-white/5 text-star-white/70 text-xs font-medium mb-4">
          {destination.body_type}
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-4">
          <span className="bg-cosmic-gradient bg-clip-text text-transparent">{destination.display_name}</span>
        </h1>
        <p className="text-xl text-star-white/80 max-w-xl mx-auto">{destination.tagline}</p>
      </motion.section>

      {/* Facts grid */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <h2 className="text-2xl font-bold text-star-white mb-6">Destination Facts</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { icon: <Gauge size={20} />, label: 'Gravity', value: `${destination.gravity_g}× Earth` },
            { icon: <Clock size={20} />, label: 'Transit Time', value: destination.transit_days === 0 ? 'Home base' : `${destination.transit_days} day${destination.transit_days !== 1 ? 's' : ''}` },
            { icon: <Wind size={20} />, label: 'Atmosphere', value: destination.atmosphere },
            { icon: <Thermometer size={20} />, label: 'Temperature', value: tempLabel },
            { icon: <span className="text-base" aria-hidden="true">🌌</span>, label: 'Distance', value: destination.distance_au === 0 ? 'Origin' : `${destination.distance_au} AU` },
          ].map((fact) => (
            <div key={fact.label} className="glass-card p-4 flex flex-col gap-2">
              <div className="text-star-white/50 flex items-center gap-2">
                {fact.icon}
                <span className="text-xs uppercase tracking-wider">{fact.label}</span>
              </div>
              <p className="text-star-white font-semibold text-sm leading-snug">{fact.value}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Hazard banner */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass-card p-6"
      >
        <div className="flex flex-wrap items-start gap-4">
          <AlertTriangle size={20} style={{ color: hazard.hex }} className="mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className="px-3 py-1 rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: hazard.hex }}
              >
                Hazard Level {destination.hazard_level} — {hazard.label}
              </span>
              <span className="text-star-white/70 text-sm">{hazard.description}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {destination.hazards.map((h) => (
                <span
                  key={h}
                  className="px-2 py-0.5 rounded border text-xs text-star-white/80"
                  style={{ borderColor: `${hazard.hex}60`, backgroundColor: `${hazard.hex}18` }}
                >
                  {h}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Fun fact */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6 border border-cosmic-purple/30 bg-cosmic-purple/5"
      >
        <div className="flex items-start gap-4">
          <Lightbulb size={20} className="text-cosmic-purple mt-0.5 shrink-0" />
          <div>
            <p className="text-xs uppercase tracking-wider text-cosmic-purple font-medium mb-1">Fun Fact</p>
            <p className="text-star-white/90">{destination.fun_fact}</p>
          </div>
        </div>
      </motion.section>

      {/* Flights departing soon */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-star-white mb-6">
          Flights departing to{' '}
          <span className="bg-cosmic-gradient bg-clip-text text-transparent">{destination.display_name}</span>
        </h2>

        {isLoadingFlights ? (
          <LoadingSpinner size="lg" text="Loading flights..." />
        ) : flights.length === 0 ? (
          <div className="glass-card p-12 text-center text-star-white/60">
            <p className="text-4xl mb-4">🚀</p>
            <p className="text-lg">No upcoming flights to {destination.display_name} right now.</p>
            <p className="text-sm mt-2">Check back soon or browse all available routes.</p>
            <Link to="/flights" className="inline-block mt-6">
              <Button variant="secondary">Browse All Flights</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flights.map((flight) => (
              <FlightCard key={flight.flight_id} flight={flight} onBook={handleBookFlight} />
            ))}
          </div>
        )}
      </motion.section>

      {/* Modals */}
      <UserIdentification
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        onSuccess={handleUserIdentified}
      />
      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        flight={selectedFlight}
        onSuccess={handleBookingSuccess}
      />
    </div>
  );
};

// Made with Bob
