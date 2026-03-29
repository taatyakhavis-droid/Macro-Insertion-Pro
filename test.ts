import { processImpressionTag, processLandingPageUrl } from './src/utils/tagProcessor.js';

const impInput = `<IMG SRC="https://ad.doubleclick.net/ddm/trackimp/N48702.159423SPOTIFY/B35037278.439116042;dc_trk_aid=632033904;dc_trk_cid=248685646;ord=[timestamp];dc_lat=;dc_rdid=;tag_for_child_directed_treatment=;tfua=;gdpr=\${GDPR};gdpr_consent=\${GDPR_CONSENT_755};ltd=;dc_tdv=1?" attributionsrc BORDER="0" HEIGHT="1" WIDTH="1" ALT="Advertisement">`;
const impExpected = `https://ad.doubleclick.net/ddm/trackimp/N48702.159423SPOTIFY/B35037278.439116042;dc_trk_aid=632033904;dc_trk_cid=248685646;ord=%%CACHEBUSTER%%;dc_lat=;dc_rdid=;tag_for_child_directed_treatment=;tfua?`;

const impRes = processImpressionTag(impInput);
console.log("IMP Match?", impRes.cleaned === impExpected);
console.log("IMP Output:", impRes.cleaned);
console.log("IMP Expected:", impExpected);

const lpInput = `https://ad.doubleclick.net/ddm/trackclk/N465010.159423SPOTIFY/B34701705.433973446;dc_trk_aid=627128960;dc_trk_cid=245781633;dc_lat=;dc_rdid=;tag_for_child_directed_treatment=;tfua=;gdpr=\${GDPR};gdpr_consent=\${GDPR_CONSENT_755};ltd=;dc_tdv=1`;
const lpExpected = `https://ad.doubleclick.net/ddm/trackclk/N465010.159423SPOTIFY/B34701705.433973446;dc_trk_aid=627128960;dc_trk_cid=245781633;dc_lat=;dc_rdid=;tag_for_child_directed_treatment=;tfua=;gdpr=;gdpr_consent=;ltd=;dc_tdv=1`;

const lpRes = processLandingPageUrl(lpInput);
console.log("LP Match?", lpRes.cleaned === lpExpected);
console.log("LP Output:", lpRes.cleaned);
