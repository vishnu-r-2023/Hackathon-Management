import { useState } from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { teamAPI } from '../../services/endpoints';
import { Card, Button, Input } from '../../components/FormElements';
import { LoadingSkeleton, EmptyState, Modal } from '../../components/CommonComponents';
import { Plus, Users } from 'lucide-react';

export const ParticipantTeams = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [teamName, setTeamName] = useState('');

  const { data: teams, isLoading, refetch } = useQuery(
    'teams',
    () => teamAPI.getByHackathon('all'),
    { select: (res) => res.data.teams }
  );

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      await teamAPI.create({
        name: teamName,
        hackathonId: 'selected-hackathon-id'
      });
      toast.success('Team created!');
      setTeamName('');
      setModalOpen(false);
      refetch();
    } catch (error) {
      toast.error('Error creating team');
    }
  };

  if (isLoading) return <LoadingSkeleton count={4} />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Teams
        </h1>
        <Button variant="primary" onClick={() => setModalOpen(true)}>
          <Plus size={18} className="mr-2" /> Create Team
        </Button>
      </div>

      {!teams || teams.length === 0 ? (
        <EmptyState
          title="No teams yet"
          description="Create a team or join an existing one"
          action={
            <Button variant="primary" onClick={() => setModalOpen(true)}>
              Create Team
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teams.map((team) => (
            <motion.div
              key={team._id}
              whileHover={{ y: -4 }}
              className="card p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {team.name}
                </h3>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Users size={16} />
                  {team.members?.length || 0} members
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="primary" className="flex-1">
                  View Details
                </Button>
                <Button variant="ghost" className="flex-1">
                  Leave
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Team Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create New Team"
      >
        <form onSubmit={handleCreateTeam} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Team Name</label>
            <Input
              type="text"
              placeholder="Enter team name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-3">
            <Button variant="primary" type="submit" className="flex-1">
              Create
            </Button>
            <Button
              variant="ghost"
              onClick={() => setModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
