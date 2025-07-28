export function extractNameFromEmail(email: string) {
  const emailRegex = /^([a-zA-Z0-9._%+-]+)@/;

  const match = email.match(emailRegex);
  if (!match) return email;

  const localPart = match[1];
  const nameParts = localPart
    .split(/[._+-]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());

  return nameParts.join("");
}

export function getFromName(from: string) {
  const emailOnlyRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (emailOnlyRegex.test(from)) {
    return extractNameFromEmail(from);
  }

  return from || "Mailory";
}

type ExtractedInfo = {
  domain: string | null;
  name: string | null;
};

export function extractFromField(from: string): ExtractedInfo {
  from = from.trim();

  const angleMatch = from.match(/<\s*([^<>@]+@[^<>]+)\s*>/);
  if (angleMatch) {
    const email = angleMatch[1].trim();
    const domain = email.split('@')[1];
    return {
      domain,
      name: null
    };
  }

  const emailMatch = from.match(/^[^<>@]+@[^<>]+$/);
  if (emailMatch) {
    const domain = from.split('@')[1];
    return {
      domain,
      name: null
    };
  }

  return {
    domain: null,
    name: from
  };
}