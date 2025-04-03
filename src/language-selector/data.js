import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient, getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { convertKeyNames, snakeCaseObject } from '@edx/frontend-platform/utils';
import { getCookies } from '@edx/frontend-platform/i18n/lib';

/**
 * Updates user language preferences via the preferences API.
 *
 * This function converts preference data to snake_case and formats specific keys
 * according to backend requirements before sending the PATCH request.
 *
 * @param {string} username - The username of the user whose preferences to update.
 * @param {Object} preferenceData - The preference parameters to update (e.g., { pref_lang: 'en' }).
 * @returns {Promise} - A promise that resolves when the API call completes successfully,
 *                      or rejects if there's an error with the request.
 */
export async function updateUserPreferences(username, preferenceData) {
  let formattedData = snakeCaseObject(preferenceData);
  formattedData = convertKeyNames(formattedData, {
    pref_lang: 'pref-lang',
  });

  await getAuthenticatedHttpClient().patch(
    `${getConfig().LMS_BASE_URL}/api/user/v1/preferences/${username}`,
    formattedData,
    { headers: { 'Content-Type': 'application/merge-patch+json' } },
  );
}

/**
 * Sets the language for the current session using the setlang endpoint.
 *
 * This function sends a POST request to the LMS setlang endpoint to change
 * the language for the current user session.
 *
 * @param {string} languageCode - The language code to set (e.g., 'en', 'es', 'ar').
 *                               Should be a valid ISO language code supported by the platform.
 * @returns {Promise} - A promise that resolves when the API call completes successfully,
 *                      or rejects if there's an error with the request.
 */
export async function setSessionLanguage(languageCode) {
  const formData = new FormData();
  const requestConfig = {
    headers: {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
  };
  const url = `${getConfig().LMS_BASE_URL}/i18n/setlang/`;
  formData.append('language', languageCode);

  await getAuthenticatedHttpClient().post(url, formData, requestConfig);
}

/**
 * Changes the user's language preference and applies it to the current session.
 *
 * This comprehensive function handles the complete language change process:
 * 1. Sets the language cookie with the selected language code
 * 2. If a user is authenticated, updates their server-side preference in the backend
 * 3. Updates the session language through the setlang endpoint
 * 4. Reloads the page to apply the language changes across the interface
 *
 * @param {string} languageCode - The selected language locale code (e.g., 'en', 'es', 'ar').
 *                               Should be a valid ISO language code supported by the platform.
 * @returns {Promise} - A promise that resolves when all operations complete (before page reload).
 *                      Note: After completion, the page will reload automatically.
 */
export async function changeUserSessionLanguage(languageCode) {
  const cookies = getCookies();
  const authenticatedUser = getAuthenticatedUser();

  const languageCookieName = getConfig().LANGUAGE_PREFERENCE_COOKIE_NAME;

  cookies.set(languageCookieName, languageCode);

  if (authenticatedUser) {
    await updateUserPreferences(authenticatedUser.username, { pref_lang: languageCode });
  }
  await setSessionLanguage(languageCode);

  window.location.reload();
}
