export function getEntityId(entity) {
  if (!entity) return "";
  return entity._id || entity.id || "";
}

export function hasMember(team, userId) {
  return (team?.members || []).some((member) => getEntityId(member) === userId);
}
