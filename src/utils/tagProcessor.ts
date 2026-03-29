export type ProcessResult = {
  cleaned: string;
  isDoubtful: boolean;
};

export function processImpressionTag(tag: string): ProcessResult {
  let isDoubtful = false;

  // Ensure it's an IMG tag
  if (!tag.trim().toUpperCase().startsWith('<IMG')) {
    return { cleaned: tag, isDoubtful: false }; // Not an impression tag, leave as is
  }

  // Extract URL between src=" and the first ?
  // E.g., src="https://ad.doubleclick.net/ddm/trackimp/N1234.5678/B1234567.123456;dc_trk_aid=123456789;dc_trk_cid=123456789;ord=[timestamp];dc_lat=;dc_rdid=;tag_for_child_directed_treatment=;tfua=;ltd=?"
  const srcMatch = tag.match(/src="([^"?]+)(?:\?|")/i);
  if (!srcMatch) {
    return { cleaned: "Error: No src attribute found", isDoubtful: true };
  }

  let url = srcMatch[1];

  // Truncate everything after ;tfua
  const tfuaIndex = url.toLowerCase().indexOf(';tfua');
  if (tfuaIndex !== -1) {
    // Keep ';tfua'
    url = url.substring(0, tfuaIndex + ';tfua='.length);
  } else {
    // If ';tfua' is missing, that's doubtful
    isDoubtful = true;
  }

  // Replace [timestamp] with %%CACHEBUSTER%%
  if (url.includes('[timestamp]')) {
    url = url.replace(/\[timestamp\]/g, '%%CACHEBUSTER%%');
  } else if (url.includes('%5Btimestamp%5D')) {
    url = url.replace(/%5Btimestamp%5D/g, '%%CACHEBUSTER%%');
  } else {
    // Missing timestamp is doubtful
    isDoubtful = true;
  }

  // Append ? at the very end
  url = url + '?';

  return { cleaned: url, isDoubtful };
}

export function processLandingPageUrl(url: string): ProcessResult {
  // Target: URLs containing trackclk
  if (typeof url !== 'string' || !url.includes('trackclk')) {
    return { cleaned: url, isDoubtful: false }; // Not a landing page tag, leave as is
  }

  let cleaned = url;

  // Remove values assigned to GDPR and GDPR_CONSENT... but keep the keys
  // For example: &gdpr=${GDPR}&gdpr_consent=${GDPR_CONSENT_755} -> &gdpr=&gdpr_consent=
  // We'll replace gdpr=ANYTHING up to the next & or ; or end of string with gdpr=
  cleaned = cleaned.replace(/([;&?])(gdpr)=([^;&]*)/ig, '$1$2=');
  cleaned = cleaned.replace(/([;&?])(gdpr_consent)=([^;&]*)/ig, '$1$2=');

  return { cleaned, isDoubtful: false };
}
