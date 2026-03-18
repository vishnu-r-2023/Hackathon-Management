import { useMemo, useState } from "react";

import ConfirmDialog from "../../components/ui/ConfirmDialog.jsx";
import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Pagination from "../../components/ui/Pagination.jsx";
import { useAuth } from "../../context/auth/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { useAsyncData } from "../../hooks/useAsyncData.js";
import { usersApi } from "../../services/api/users.js";
import { ROLE_LABELS } from "../../utils/constants.js";
import { formatDateTime } from "../../utils/format.js";

const PAGE_SIZE = 8;

export default function AdminUsersPage() {
  const auth = useAuth();
  const toast = useToast();
  const [roleFilter, setRoleFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [busyId, setBusyId] = useState("");

  const { data, error, loading, refetch } = useAsyncData(
    () =>
      usersApi.list({
        limit: 100,
        role: roleFilter === "all" ? undefined : roleFilter,
      }),
    [roleFilter]
  );

  const users = data?.users || [];
  const filtered = useMemo(() => {
    return users.filter((user) => {
      if (!search) return true;
      const query = search.toLowerCase();
      return (
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query)
      );
    });
  }, [search, users]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function handleDelete() {
    if (!pendingDelete) return;
    setBusyId(pendingDelete._id);
    try {
      await usersApi.remove(pendingDelete._id);
      toast.toast({
        title: "User deleted",
        description: `${pendingDelete.name} was removed.`,
        type: "success",
      });
      setPendingDelete(null);
      refetch();
    } catch (nextError) {
      toast.toast({
        title: "Delete failed",
        description: nextError.message,
        type: "error",
      });
    } finally {
      setBusyId("");
    }
  }

  if (loading) {
    return <Card className="p-10">Loading users...</Card>;
  }

  if (error) {
    return (
      <EmptyState
        description={error.message}
        icon="group_off"
        title="Could not load users"
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-300">
              Identity access
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-ink-900 dark:text-white">
              Manage users
            </h1>
          </div>

          <div className="flex flex-col gap-3 md:flex-row">
            <input
              className="field-base min-w-[240px]"
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search by name or email"
              value={search}
            />
            <select
              className="field-base min-w-[180px]"
              onChange={(event) => {
                setRoleFilter(event.target.value);
                setPage(1);
              }}
              value={roleFilter}
            >
              <option value="all">All roles</option>
              <option value="admin">Admin</option>
              <option value="judge">Judge</option>
              <option value="participant">Participant</option>
            </select>
          </div>
        </div>
      </Card>

      {filtered.length ? (
        <div className="table-shell">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="border-b border-white/10 bg-black/5 text-xs uppercase tracking-[0.24em] text-ink-500 dark:bg-white/[0.06] dark:text-ink-400">
                <tr>
                  <th className="px-5 py-4">User</th>
                  <th className="px-5 py-4">Role</th>
                  <th className="px-5 py-4">Created</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((user) => (
                  <tr className="border-b border-white/8 last:border-b-0" key={user._id}>
                    <td className="px-5 py-4">
                      <p className="font-medium text-ink-900 dark:text-white">{user.name}</p>
                      <p className="text-sm text-ink-500 dark:text-ink-300">{user.email}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-ink-600 dark:text-ink-300">
                      {ROLE_LABELS[user.role]}
                    </td>
                    <td className="px-5 py-4 text-sm text-ink-600 dark:text-ink-300">
                      {formatDateTime(user.createdAt)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Button
                        disabled={user._id === auth.user?.id}
                        onClick={() => setPendingDelete(user)}
                        size="sm"
                        variant="danger"
                      >
                        {user._id === auth.user?.id ? "Current user" : "Delete"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            onPageChange={setPage}
            page={page}
            pageSize={PAGE_SIZE}
            total={filtered.length}
          />
        </div>
      ) : (
        <EmptyState
          description="No users match the current filters."
          icon="group_off"
          title="No users found"
        />
      )}

      <ConfirmDialog
        confirmLabel="Delete user"
        description={
          pendingDelete
            ? `This removes ${pendingDelete.name} and updates affected teams automatically.`
            : ""
        }
        loading={busyId === pendingDelete?._id}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
        open={Boolean(pendingDelete)}
        title="Delete this user?"
      />
    </div>
  );
}
