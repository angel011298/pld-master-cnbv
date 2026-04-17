type ExternalIds = {
  stripeCustomerId?: string | null;
};

export function buildPublicCustomerId(sequence: number, date = new Date()) {
  const year = date.getUTCFullYear();
  const padded = String(sequence).padStart(6, "0");
  return `CL-${year}-${padded}`;
}

export function buildMasterExternalMap(params: ExternalIds) {
  return {
    stripe: params.stripeCustomerId ?? null,
  };
}

