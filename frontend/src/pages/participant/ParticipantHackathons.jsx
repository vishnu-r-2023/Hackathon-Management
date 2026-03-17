import { useState } from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { hackathonAPI } from '../../services/endpoints';
import { Button } from '../../components/FormElements';
import { LoadingSkeleton, EmptyState, Modal } from '../../components/CommonComponents';
import { Calendar, Users } from 'lucide-react';
import { format } from 'date-fns';

export const ParticipantHackathons = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedHackathon, setSelectedHackathon] = useState(null);

  const { data: hackathons, isLoading } = useQuery(
    'hackathons',
    () => hackathonAPI.getAll({ status: 'upcoming', limit: 100 }),
    { select: (res) => res.data.hackathons }
  );

  if (isLoading) return <LoadingSkeleton count={6} />;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
        Available Hackathons
      </h1>

      {!hackathons || hackathons.length === 0 ? (
        <EmptyState
          title="No hackathons available"
          description="Check back soon for upcoming hackathons!"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hackathons.map((hackathon) => (
            <motion.div
              key={hackathon._id}
              whileHover={{ y: -8 }}
              className="card p-6 cursor-pointer"
              onClick={() => {
                setSelectedHackathon(hackathon);
                setModalOpen(true);
              }}
            >
              <div className="mb-4">
                <span className="px-3 py-1 bg-secondary/10 text-secondary ring-1 ring-secondary/20 rounded-full text-xs font-semibold capitalize">
                  {hackathon.status}
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {hackathon.title}
              </h3>

              <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                {hackathon.description}
              </p>

              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-5">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-slate-400" />
                  <span>{format(new Date(hackathon.startDate), 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-slate-400" />
                  <span>{hackathon.participantCount || 0} participants</span>
                </div>
              </div>

              <Button variant="primary" className="w-full">
                View Details
              </Button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Hackathon Details Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedHackathon?.title}
      >
        <div className="space-y-4">
          <p className="text-slate-600 dark:text-slate-400">
            {selectedHackathon?.description}
          </p>

          <div className="space-y-2 text-sm">
            <p>
              <span className="font-semibold">Start:</span>{' '}
              {selectedHackathon &&
                format(new Date(selectedHackathon.startDate), 'MMM dd, yyyy HH:mm')}
            </p>
            <p>
              <span className="font-semibold">End:</span>{' '}
              {selectedHackathon &&
                format(new Date(selectedHackathon.endDate), 'MMM dd, yyyy HH:mm')}
            </p>
            <p>
              <span className="font-semibold">Status:</span> {selectedHackathon?.status}
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="primary" className="flex-1">
              Join Hackathon
            </Button>
            <Button
              variant="ghost"
              onClick={() => setModalOpen(false)}
              className="flex-1"
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

