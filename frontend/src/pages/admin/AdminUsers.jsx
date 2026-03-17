import { useState } from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { userAPI } from '../../services/endpoints';
import { Card, Input, Button } from '../../components/FormElements';
import { LoadingSkeleton, EmptyState } from '../../components/CommonComponents';
import { Trash2, Search } from 'lucide-react';

export const AdminUsers = () => {
  const [search, setSearch] = useState('');

  const { data: users, isLoading, refetch } = useQuery(
    'users',
    () => userAPI.getAllUsers({ limit: 100 }),
    { select: (res) => res.data.users }
  );

  const filteredUsers = users?.filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleDelete = async (id) => {
    if (window.confirm('Delete this user?')) {
      try {
        await userAPI.deleteUser(id);
        toast.success('User deleted!');
        refetch();
      } catch (error) {
        toast.error('Error deleting user');
      }
    }
  };

  if (isLoading) return <LoadingSkeleton count={5} />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Users
        </h1>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 text-slate-400" size={18} />
        <Input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredUsers.length === 0 ? (
        <EmptyState title="No users found" description="Try adjusting your search" />
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/60 dark:bg-slate-900/40 border-b border-slate-200/60 dark:border-slate-800/60">
                  <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Role</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="border-b border-slate-200/60 dark:border-slate-800/60 hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-smooth"
                  >
                    <td className="py-3 px-4 text-slate-900 dark:text-white">{user.name}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 bg-primary/10 text-primary ring-1 ring-primary/20 rounded-full text-sm font-semibold capitalize">
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        variant="ghost"
                        onClick={() => handleDelete(user._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
