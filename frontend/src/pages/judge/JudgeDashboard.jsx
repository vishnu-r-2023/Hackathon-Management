import { useState } from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { evaluationAPI, submissionAPI } from '../../services/endpoints';
import { Card, Button, TextArea, Input } from '../../components/FormElements';
import { LoadingSkeleton, EmptyState, Modal } from '../../components/CommonComponents';
import { FileText, Star } from 'lucide-react';

export const JudgeDashboard = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [evaluation, setEvaluation] = useState({
    score: 0,
    feedback: '',
    innovation: 0,
    impact: 0,
    implementation: 0,
  });

  const { data: submissions, isLoading, refetch } = useQuery(
    'assigned-submissions',
    () => evaluationAPI.getAssigned(),
    {
      select: (res) => (res.data.assigned || []).map((a) => ({
        ...a.submission,
        evaluationId: a.evaluationId,
        score: a.score,
        feedback: a.feedback,
      })),
    }
  );

  const handleSubmitEvaluation = async (e) => {
    e.preventDefault();
    try {
      await evaluationAPI.create({
        submissionId: selectedSubmission._id,
        ...evaluation,
      });
      toast.success('Evaluation submitted!');
      setModalOpen(false);
      setEvaluation({ score: 0, feedback: '', innovation: 0, impact: 0, implementation: 0 });
      refetch();
    } catch (error) {
      toast.error('Error submitting evaluation');
    }
  };

  const openEvaluationModal = (submission) => {
    setSelectedSubmission(submission);
    setModalOpen(true);
  };

  if (isLoading) return <LoadingSkeleton count={4} />;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
        Assigned Submissions
      </h1>

      {!submissions || submissions.length === 0 ? (
        <EmptyState title="No submissions assigned" description="You'll see submissions here once they're assigned to you" />
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <motion.div
              key={submission._id}
              whileHover={{ x: 4 }}
              className="card p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {submission.projectTitle}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Team: {submission.teamId?.name || '—'}
                  </p>
                </div>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
                  {submission.hackathonId?.title || 'Assigned'}
                </span>
              </div>

              <p className="text-slate-600 dark:text-slate-400 mb-4">
                {submission.description}
              </p>

              <Button
                variant="primary"
                onClick={() => openEvaluationModal(submission)}
              >
                <FileText size={16} className="mr-2" /> Evaluate
              </Button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Evaluation Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Evaluate Submission"
      >
        <form onSubmit={handleSubmitEvaluation} className="space-y-4">
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
              {selectedSubmission?.projectTitle}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {selectedSubmission?.description}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Overall Score (0-100)</label>
            <Input
              type="number"
              min="0"
              max="100"
              value={evaluation.score}
              onChange={(e) => setEvaluation({ ...evaluation, score: parseInt(e.target.value) })}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-2">Innovation</label>
              <Input
                type="number"
                min="0"
                max="10"
                value={evaluation.innovation}
                onChange={(e) => setEvaluation({ ...evaluation, innovation: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Impact</label>
              <Input
                type="number"
                min="0"
                max="10"
                value={evaluation.impact}
                onChange={(e) => setEvaluation({ ...evaluation, impact: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Implementation</label>
              <Input
                type="number"
                min="0"
                max="10"
                value={evaluation.implementation}
                onChange={(e) => setEvaluation({ ...evaluation, implementation: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Feedback</label>
            <TextArea
              placeholder="Provide constructive feedback..."
              value={evaluation.feedback}
              onChange={(e) => setEvaluation({ ...evaluation, feedback: e.target.value })}
              rows="3"
            />
          </div>

          <div className="flex gap-3">
            <Button variant="primary" type="submit" className="flex-1">
              Submit Evaluation
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
