export function formatEmailToAvoidCapsuleConflict(email: string, accountId: string): string {
  const [localPart, domain] = email.split("@");
  const [username, existingTag] = localPart.split("+");

  const newLocalPart = existingTag
    ? `${username}+${existingTag}${accountId}`
    : `${username}+${accountId}`;

  return `${newLocalPart}@${domain}`;
}
