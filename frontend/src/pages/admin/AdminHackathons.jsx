import { useState } from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { hackathonAPI } from '../../services/endpoints';
import { Input, Button } from '../../components/FormElements';
import { Modal, LoadingSkeleton, EmptyState } from '../../components/CommonComponents';
import { Plus, Edit, Trash2, BarChart3, Calendar, Flag } from 'lucide-react';
import { format } from 'date-fns';

export const AdminHackathons = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
  });

  const { data: hackathons, isLoading, refetch } = useQuery(
    'hackathons',
    () => hackathonAPI.getAll({ limit: 100 }),
    { select: (res) => res.data.hackathons }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await hackathonAPI.update(editingId, formData);
        toast.success('Hackathon updated!');
      } else {
        await hackathonAPI.create(formData);
        toast.success('Hackathon created!');
      }
      setModalOpen(false);
      setFormData({ title: '', description: '', startDate: '', endDate: '' });
      setEditingId(null);
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving hackathon');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this hackathon?')) {
      try {
        await hackathonAPI.delete(id);
        toast.success('Hackathon deleted!');
        refetch();
      } catch (error) {
        toast.error('Error deleting hackathon');
      }
    }
  };

  const openEditModal = (hackathon) => {
    setEditingId(hackathon._id);
    setFormData(hackathon);
    setModalOpen(true);
  };

  if (isLoading) return <LoadingSkeleton count={6} />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Hackathons
        </h1>
        <Button
          variant="primary"
          onClick={() => {
            setEditingId(null);
            setFormData({ title: '', description: '', startDate: '', endDate: '' });
            setModalOpen(true);
          }}
        >
          <Plus size={18} className="mr-2" /> Create Hackathon
        </Button>
      </div>

      {!hackathons || hackathons.length === 0 ? (
        <EmptyState
          title="No Hackathons Yet"
          description="Start by creating your first hackathon"
          action={
            <Button variant="primary" onClick={() => setModalOpen(true)}>
              Create One Now
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hackathons.map((hackathon) => (
            <motion.div
              key={hackathon._id}
              whileHover={{ y: -4 }}
              className="card p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {hackathon.title}
                </h3>
                <span className="px-3 py-1 bg-primary/10 text-primary ring-1 ring-primary/20 rounded-full text-xs font-semibold capitalize">
                  {hackathon.status}
                </span>
              </div>

              <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">
                {hackathon.description}
              </p>

              <div className="space-y-2 mb-5 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-slate-400" />
                  <span>
                    Start: {format(new Date(hackathon.startDate), 'MMM dd, yyyy')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Flag size={16} className="text-slate-400" />
                  <span>
                    End: {format(new Date(hackathon.endDate), 'MMM dd, yyyy')}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => openEditModal(hackathon)}
                  aria-label="Edit hackathon"
                >
                  <Edit size={16} />
                </Button>
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => handleDelete(hackathon._id)}
                  aria-label="Delete hackathon"
                >
                  <Trash2 size={16} className="text-red-500" />
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  aria-label="View analytics"
                >
                  <BarChart3 size={16} />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Hackathon' : 'Create Hackathon'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <Input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field"
              rows="4"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Start Date</label>
              <Input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">End Date</label>
              <Input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="primary" type="submit" className="flex-1">
              Save
            </Button>
            <Button variant="ghost" onClick={() => setModalOpen(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

