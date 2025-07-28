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

export function validateAndExtractDomain(fromField: string): {
  valid: boolean;
  domain?: string;
  formatError?: string;
} {
  const pattern = /^([\w\s]+)\s<([\w.-]+)@([\w.-]+\.[a-zA-Z]{2,})>$/;
  const match = fromField.match(pattern);

  if (!match) {
    return {
      valid: false,
      formatError:
        "Invalid 'from' format. Please use the pattern: 'name <name@mailory.site>' or a verified domain, for example: 'name <name@yourdomain.com>'.",
    };
  }

  const [, , , domain] = match;

  if (domain.toLowerCase() === "mailory.site") {
    return { valid: true };
  } else {
    return { valid: true, domain };
  }
}
