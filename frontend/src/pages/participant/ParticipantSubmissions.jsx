import { useState } from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { submissionAPI } from '../../services/endpoints';
import { Card, Button, Input, TextArea } from '../../components/FormElements';
import { LoadingSkeleton, EmptyState, Modal } from '../../components/CommonComponents';
import { Plus, Github, Link as LinkIcon } from 'lucide-react';

export const ParticipantSubmissions = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    projectTitle: '',
    description: '',
    githubLink: '',
    demoLink: '',
  });

  const { data: submissions, isLoading, refetch } = useQuery(
    'submissions',
    () => submissionAPI.getByHackathon('all'),
    { select: (res) => res.data.submissions }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submissionAPI.create({
        ...formData,
        teamId: 'team-id',
        hackathonId: 'hackathon-id'
      });
      toast.success('Submission created!');
      setFormData({ projectTitle: '', description: '', githubLink: '', demoLink: '' });
      setModalOpen(false);
      refetch();
    } catch (error) {
      toast.error('Error creating submission');
    }
  };

  if (isLoading) return <LoadingSkeleton count={4} />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Submissions
        </h1>
        <Button variant="primary" onClick={() => setModalOpen(true)}>
          <Plus size={18} className="mr-2" /> Submit Project
        </Button>
      </div>

      {!submissions || submissions.length === 0 ? (
        <EmptyState
          title="No submissions yet"
          description="Submit your project now!"
          action={
            <Button variant="primary" onClick={() => setModalOpen(true)}>
              Submit Project
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <motion.div
              key={submission._id}
              whileHover={{ x: 4 }}
              className="card p-6"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    {submission.projectTitle}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    {submission.description}
                  </p>
                  <div className="flex gap-4">
                    {submission.githubLink && (
                      <a href={submission.githubLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                        <Github size={16} /> GitHub
                      </a>
                    )}
                    {submission.demoLink && (
                      <a href={submission.demoLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-secondary hover:underline">
                        <LinkIcon size={16} /> Demo
                      </a>
                    )}
                  </div>
                </div>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold whitespace-nowrap ml-4">
                  {submission.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Submission Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Submit Your Project"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Project Title</label>
            <Input
              type="text"
              placeholder="Your project name"
              value={formData.projectTitle}
              onChange={(e) => setFormData({ ...formData, projectTitle: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <TextArea
              placeholder="Tell us about your project..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows="3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">GitHub Link</label>
            <Input
              type="url"
              placeholder="https://github.com/..."
              value={formData.githubLink}
              onChange={(e) => setFormData({ ...formData, githubLink: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Demo Link</label>
            <Input
              type="url"
              placeholder="https://demo.example.com"
              value={formData.demoLink}
              onChange={(e) => setFormData({ ...formData, demoLink: e.target.value })}
            />
          </div>

          <div className="flex gap-3">
            <Button variant="primary" type="submit" className="flex-1">
              Submit
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
