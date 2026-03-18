import { useMemo, useState } from "react";

import ConfirmDialog from "../../components/ui/ConfirmDialog.jsx";
import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import { TextAreaField, TextField } from "../../components/ui/Fields.jsx";
import Modal from "../../components/ui/Modal.jsx";
import Pagination from "../../components/ui/Pagination.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { useAsyncData } from "../../hooks/useAsyncData.js";
import { hackathonsApi } from "../../services/api/hackathons.js";
import { resultsApi } from "../../services/api/results.js";
import { usersApi } from "../../services/api/users.js";
import { cn } from "../../utils/cn.js";
import { getEntityId } from "../../utils/data.js";
import { STATUS_STYLES } from "../../utils/constants.js";
import {
  computeHackathonStatus,
  formatDate,
  formatNumber,
} from "../../utils/format.js";

const PAGE_SIZE = 6;

function toInputDateTime(value) {
  return value ? new Date(value).toISOString().slice(0, 16) : "";
}

function defaultFormState() {
  return {
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    judgeIds: [],
  };
}

function getHackathonJudgeIds(hackathon) {
  return (hackathon?.judgeIds || []).map((judge) => getEntityId(judge)).filter(Boolean);
}

function hydrateHackathonJudges(hackathon, selectedJudgeIds, judgesById) {
  const responseJudgeIds = getHackathonJudgeIds(hackathon);
  const finalJudgeIds = responseJudgeIds.length ? responseJudgeIds : selectedJudgeIds;

  return {
    ...hackathon,
    judgeIds: finalJudgeIds
      .map((judgeId) => judgesById.get(judgeId))
      .filter(Boolean),
  };
}

export default function AdminHackathonsPage() {
  const toast = useToast();
  const { data, error, loading, refetch, setData } = useAsyncData(
    async () => {
      const [hackathonsResponse, judgesResponse] = await Promise.all([
        hackathonsApi.list({ limit: 100 }),
        usersApi.list({ limit: 100, role: "judge" }),
      ]);

      return {
        hackathons: hackathonsResponse.hackathons || [],
        judges: judgesResponse.users || [],
      };
    },
    []
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHackathon, setEditingHackathon] = useState(null);
  const [form, setForm] = useState(defaultFormState());
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingHackathon, setDeletingHackathon] = useState(null);
  const [busyHackathonId, setBusyHackathonId] = useState("");

  const hackathons = data?.hackathons || [];
  const judges = data?.judges || [];
  const judgesById = useMemo(
    () => new Map(judges.map((judge) => [getEntityId(judge), judge])),
    [judges]
  );

  const filtered = useMemo(() => {
    return hackathons.filter((hackathon) => {
      const judgeText = (hackathon.judgeIds || [])
        .map((judge) => judge?.name || judgesById.get(getEntityId(judge))?.name || "")
        .join(" ")
        .toLowerCase();
      const matchesSearch =
        !search ||
        hackathon.title.toLowerCase().includes(search.toLowerCase()) ||
        hackathon.description?.toLowerCase().includes(search.toLowerCase()) ||
        judgeText.includes(search.toLowerCase());
      const status = computeHackathonStatus(hackathon);
      const matchesStatus = statusFilter === "all" || status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [hackathons, judgesById, search, statusFilter]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function openCreateModal() {
    setEditingHackathon(null);
    setForm(defaultFormState());
    setFormError("");
    setModalOpen(true);
  }

  function openEditModal(hackathon) {
    setEditingHackathon(hackathon);
    setForm({
      title: hackathon.title || "",
      description: hackathon.description || "",
      startDate: toInputDateTime(hackathon.startDate),
      endDate: toInputDateTime(hackathon.endDate),
      judgeIds: getHackathonJudgeIds(hackathon),
    });
    setFormError("");
    setModalOpen(true);
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function toggleJudge(judgeId) {
    setForm((current) => ({
      ...current,
      judgeIds: current.judgeIds.includes(judgeId)
        ? current.judgeIds.filter((item) => item !== judgeId)
        : [...current.judgeIds, judgeId],
    }));
  }

  async function handleSave(event) {
    event.preventDefault();
    setFormError("");

    if (!form.title || !form.startDate || !form.endDate) {
      setFormError("Title, start date, and end date are required.");
      return;
    }

    if (new Date(form.endDate) <= new Date(form.startDate)) {
      setFormError("End date must be after the start date.");
      return;
    }

    if (judges.length && !form.judgeIds.length) {
      setFormError(
        "Select at least one judge so new submissions enter the review queue automatically."
      );
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        judgeIds: form.judgeIds,
      };
      let savedHackathon;

      if (editingHackathon) {
        savedHackathon = await hackathonsApi.update(editingHackathon._id, payload);
        toast.toast({
          title: "Hackathon updated",
          description: `${form.title} has been updated.`,
          type: "success",
        });
      } else {
        savedHackathon = await hackathonsApi.create(payload);
        toast.toast({
          title: "Hackathon created",
          description: `${form.title} is live in the admin workspace.`,
          type: "success",
        });
      }

      if (savedHackathon) {
        const normalizedHackathon = hydrateHackathonJudges(
          savedHackathon,
          form.judgeIds,
          judgesById
        );

        setData((current) => {
          const currentHackathons = current?.hackathons || [];
          const nextHackathons = editingHackathon
            ? currentHackathons.map((hackathon) =>
                hackathon._id === normalizedHackathon._id ? normalizedHackathon : hackathon
              )
            : [normalizedHackathon, ...currentHackathons];

          return {
            ...(current || {}),
            hackathons: nextHackathons,
            judges: current?.judges || judges,
          };
        });
      }

      setModalOpen(false);
    } catch (nextError) {
      setFormError(nextError.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deletingHackathon) return;

    setBusyHackathonId(deletingHackathon._id);
    try {
      await hackathonsApi.remove(deletingHackathon._id);
      toast.toast({
        title: "Hackathon deleted",
        description: `${deletingHackathon.title} was removed.`,
        type: "success",
      });
      setDeletingHackathon(null);
      refetch();
    } catch (nextError) {
      toast.toast({
        title: "Delete failed",
        description: nextError.message,
        type: "error",
      });
    } finally {
      setBusyHackathonId("");
    }
  }

  async function handlePublish(hackathon) {
    setBusyHackathonId(hackathon._id);
    try {
      await resultsApi.publish(hackathon._id);
      toast.toast({
        title: "Results published",
        description: `${hackathon.title} leaderboard is now public.`,
        type: "success",
      });
      refetch();
    } catch (nextError) {
      toast.toast({
        title: "Publish failed",
        description: nextError.message,
        type: "error",
      });
    } finally {
      setBusyHackathonId("");
    }
  }

  if (loading) {
    return <Card className="p-10">Loading hackathons...</Card>;
  }

  if (error) {
    return (
      <EmptyState
        description={error.message}
        icon="event_busy"
        title="Could not load hackathons"
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-300">
              Admin control
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-ink-900 dark:text-white">
              Manage hackathons
            </h1>
          </div>

          <div className="flex flex-col gap-3 md:flex-row">
            <input
              className="field-base min-w-[240px]"
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search hackathons"
              value={search}
            />
            <select
              className="field-base min-w-[180px]"
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
              value={statusFilter}
            >
              <option value="all">All statuses</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
            <Button icon="add" onClick={openCreateModal}>
              Create hackathon
            </Button>
          </div>
        </div>
      </Card>

      {filtered.length ? (
        <>
          <div className="grid gap-4 xl:grid-cols-2">
            {paged.map((hackathon) => {
              const status = computeHackathonStatus(hackathon);
              const assignedJudges = (hackathon.judgeIds || [])
                .map((judge) => judge?.name || judgesById.get(getEntityId(judge))?.name)
                .filter(Boolean);

              return (
                <Card className="p-6" key={hackathon._id}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span
                        className={cn(
                          "inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em]",
                          STATUS_STYLES[status]
                        )}
                      >
                        {status}
                      </span>
                      <h2 className="mt-4 font-display text-2xl font-semibold text-ink-900 dark:text-white">
                        {hackathon.title}
                      </h2>
                    </div>
                    <div className="rounded-2xl bg-brand-500/[0.12] p-3 text-brand-300">
                      <span className="material-symbols-outlined text-2xl">event</span>
                    </div>
                  </div>

                  <p className="mt-4 min-h-14 text-sm leading-7 text-ink-600 dark:text-ink-300">
                    {hackathon.description || "No description provided."}
                  </p>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/70 p-4 dark:bg-white/[0.06]">
                      <p className="text-xs uppercase tracking-[0.24em] text-ink-500 dark:text-ink-400">
                        Participants
                      </p>
                      <p className="mt-2 text-lg font-semibold text-ink-900 dark:text-white">
                        {formatNumber(hackathon.participantCount)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/70 p-4 dark:bg-white/[0.06]">
                      <p className="text-xs uppercase tracking-[0.24em] text-ink-500 dark:text-ink-400">
                        Timeline
                      </p>
                      <p className="mt-2 text-sm font-semibold text-ink-900 dark:text-white">
                        {formatDate(hackathon.startDate)} - {formatDate(hackathon.endDate)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-white/10 bg-white/70 p-4 dark:bg-white/[0.06]">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs uppercase tracking-[0.24em] text-ink-500 dark:text-ink-400">
                        Jury / Judges
                      </p>
                      <p className="text-sm font-semibold text-ink-900 dark:text-white">
                        {formatNumber(assignedJudges.length)}
                      </p>
                    </div>
                    {assignedJudges.length ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {assignedJudges.map((judgeName) => (
                          <span
                            className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-ink-600 dark:text-ink-300"
                            key={judgeName}
                          >
                            {judgeName}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 text-sm leading-7 text-ink-500 dark:text-ink-300">
                        No judges linked yet. New submissions will stay outside the
                        automatic review queue until a jury is selected.
                      </p>
                    )}
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button
                      icon="edit"
                      onClick={() => openEditModal(hackathon)}
                      variant="secondary"
                    >
                      Edit
                    </Button>
                    <Button
                      icon="delete"
                      onClick={() => setDeletingHackathon(hackathon)}
                      variant="danger"
                    >
                      Delete
                    </Button>
                    <Button
                      disabled={status !== "completed" || hackathon.resultsPublished}
                      loading={busyHackathonId === hackathon._id}
                      onClick={() => handlePublish(hackathon)}
                      variant="secondary"
                    >
                      {hackathon.resultsPublished ? "Published" : "Publish results"}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="table-shell">
            <Pagination
              onPageChange={setPage}
              page={page}
              pageSize={PAGE_SIZE}
              total={filtered.length}
            />
          </div>
        </>
      ) : (
        <EmptyState
          action={openCreateModal}
          actionLabel="Create hackathon"
          description="No hackathons match your filters yet."
          icon="event_note"
          title="No hackathons found"
        />
      )}

      <Modal
        description="Create or update hackathon metadata and scheduling."
        onClose={() => setModalOpen(false)}
        open={modalOpen}
        title={editingHackathon ? "Edit hackathon" : "Create hackathon"}
      >
        {formError ? (
          <div className="mb-4 rounded-[1.5rem] border border-rose-400/25 bg-rose-500/[0.12] px-4 py-3 text-sm font-medium text-rose-700 dark:text-rose-100">
            {formError}
          </div>
        ) : null}

        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSave}>
          <div className="md:col-span-2">
            <TextField
              label="Title"
              onChange={(event) => updateField("title", event.target.value)}
              placeholder="HackSphere Global Finals"
              required
              value={form.title}
            />
          </div>

          <div className="md:col-span-2">
            <TextAreaField
              label="Description"
              onChange={(event) => updateField("description", event.target.value)}
              placeholder="Describe the event, criteria, and theme."
              value={form.description}
            />
          </div>

          <TextField
            label="Start date"
            onChange={(event) => updateField("startDate", event.target.value)}
            required
            type="datetime-local"
            value={form.startDate}
          />
          <TextField
            label="End date"
            onChange={(event) => updateField("endDate", event.target.value)}
            required
            type="datetime-local"
            value={form.endDate}
          />

          <div className="md:col-span-2 rounded-[1.75rem] border border-white/10 bg-white/70 p-5 dark:bg-white/[0.06]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-300">
                  Jury selection
                </p>
                <p className="mt-2 text-sm leading-7 text-ink-600 dark:text-ink-300">
                  Selected judges are automatically assigned to every new submission
                  created for this hackathon.
                </p>
              </div>
              <div className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-ink-500 dark:text-ink-300">
                {form.judgeIds.length} selected
              </div>
            </div>

            {judges.length ? (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {judges.map((judge) => {
                  const judgeId = getEntityId(judge);
                  const active = form.judgeIds.includes(judgeId);

                  return (
                    <label
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-[1.5rem] border p-4 transition",
                        active
                          ? "border-brand-400/25 bg-brand-500/[0.12]"
                          : "border-white/10 bg-black/5 hover:bg-black/[0.04] dark:bg-white/[0.03] dark:hover:bg-white/[0.05]"
                      )}
                      key={judgeId}
                    >
                      <input
                        checked={active}
                        className="mt-1 h-4 w-4 rounded border-white/10"
                        onChange={() => toggleJudge(judgeId)}
                        type="checkbox"
                      />
                      <div>
                        <p className="font-medium text-ink-900 dark:text-white">
                          {judge.name}
                        </p>
                        <p className="mt-1 text-sm text-ink-500 dark:text-ink-300">
                          {judge.email}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            ) : (
              <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-black/5 p-4 text-sm leading-7 text-ink-500 dark:bg-white/[0.03] dark:text-ink-300">
                No judge accounts are available yet. Create judge users first if you
                want submissions to enter the review queue automatically.
              </div>
            )}
          </div>

          <div className="md:col-span-2 flex justify-end gap-3">
            <Button onClick={() => setModalOpen(false)} variant="secondary">
              Cancel
            </Button>
            <Button loading={saving} type="submit">
              {editingHackathon ? "Save changes" : "Create hackathon"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        confirmLabel="Delete hackathon"
        description={
          deletingHackathon
            ? `This removes ${deletingHackathon.title} and related teams, submissions, evaluations, and results.`
            : ""
        }
        loading={busyHackathonId === deletingHackathon?._id}
        onClose={() => setDeletingHackathon(null)}
        onConfirm={handleDelete}
        open={Boolean(deletingHackathon)}
        title="Delete hackathon?"
      />
    </div>
  );
}
