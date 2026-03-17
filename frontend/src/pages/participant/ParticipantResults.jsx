import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { resultAPI } from '../../services/endpoints';
import { Card, Button } from '../../components/FormElements';
import { LoadingSkeleton, EmptyState } from '../../components/CommonComponents';
import { Award, Trophy } from 'lucide-react';

export const ParticipantResults = () => {
  const { data: results, isLoading } = useQuery(
    'results',
    () => resultAPI.getLeaderboard('all'),
    { select: (res) => res.data.leaderboard }
  );

  if (isLoading) return <LoadingSkeleton count={5} />;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
        Results
      </h1>

      {!results || results.length === 0 ? (
        <EmptyState title="No results yet" description="Results will appear here soon" />
      ) : (
        <div className="space-y-4">
          {results.map((result, index) => (
            <motion.div
              key={result.submissionId || `${result.teamId}-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-slate-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">
                      {result.teamName}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {result.projectTitle}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end">
                    <Award size={20} className="text-yellow-500" />
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">
                      {result.avgScore}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">pts</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
