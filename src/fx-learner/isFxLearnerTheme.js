import { getConfig } from '@edx/frontend-platform';

/**
 * Runtime switch for the NELC learner shell.
 *
 * The LMS publishes `FX_LEARNER_THEME` through the MFE runtime config (per tenant). Env-style strings
 * such as "false" / "0" would be truthy in JS, so they are normalised to false here.
 *
 * @returns {boolean}
 */
export default function isFxLearnerTheme() {
  const flag = getConfig().FX_LEARNER_THEME;
  if (typeof flag === 'string') {
    return !['', '0', 'false', 'no', 'off'].includes(flag.trim().toLowerCase());
  }
  return !!flag;
}
