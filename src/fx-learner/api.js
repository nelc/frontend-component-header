import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient, getHttpClient } from '@edx/frontend-platform/auth';

const SHELL_TTL_MS = 5 * 60 * 1000;
const PROGRAMS_TTL_MS = 60 * 1000;
const FAILURE_BACKOFF_MS = 30 * 1000;

const state = {
  shell: null,
  shellAt: 0,
  shellPromise: null,
  shellFailedAt: 0,
  programs: null,
  programsAt: 0,
  programsPromise: null,
};

const storageKey = () => `fx-learner-shell:v1:${getConfig().LMS_BASE_URL}`;

const readStorage = () => {
  try {
    const raw = window.sessionStorage.getItem(storageKey());
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

const writeStorage = (data) => {
  try {
    window.sessionStorage.setItem(storageKey(), JSON.stringify({ t: Date.now(), data }));
  } catch (e) {
    // sessionStorage can be unavailable (private mode, quota); the in-memory cache still works.
  }
};

/** Synchronously return a fresh cached shell (memory, then sessionStorage) or null. */
export const getCachedShell = () => {
  const now = Date.now();
  if (state.shell && now - state.shellAt < SHELL_TTL_MS) { return state.shell; }
  const stored = readStorage();
  if (stored && stored.data && now - stored.t < SHELL_TTL_MS) {
    state.shell = stored.data;
    state.shellAt = stored.t;
    return state.shell;
  }
  return null;
};

/** `GET {LMS}/api/fx/theme/v1/shell/` (public). Resolves to the shell object, rejects on failure. */
export const loadShell = () => {
  const cached = getCachedShell();
  if (cached) { return Promise.resolve(cached); }
  if (state.shellPromise) { return state.shellPromise; }
  if (Date.now() - state.shellFailedAt < FAILURE_BACKOFF_MS) {
    return Promise.reject(new Error('fx shell: recent failure, not retrying yet'));
  }
  state.shellPromise = getHttpClient()
    .get(`${getConfig().LMS_BASE_URL}/api/fx/theme/v1/shell/`)
    .then(({ data }) => {
      if (!data || typeof data !== 'object') { throw new Error('fx shell: unexpected payload'); }
      state.shell = data;
      state.shellAt = Date.now();
      writeStorage(data);
      return data;
    })
    .catch((error) => {
      state.shellFailedAt = Date.now();
      throw error;
    })
    .finally(() => { state.shellPromise = null; });
  return state.shellPromise;
};

export const getCachedPrograms = () => (
  state.programs && Date.now() - state.programsAt < PROGRAMS_TTL_MS ? state.programs : null
);

/** `GET {LMS}/api/fx/learner/v1/programs/` (authenticated): stats + resume. Memory cache only, 60 s. */
export const loadPrograms = () => {
  const cached = getCachedPrograms();
  if (cached) { return Promise.resolve(cached); }
  if (state.programsPromise) { return state.programsPromise; }
  state.programsPromise = getAuthenticatedHttpClient()
    .get(`${getConfig().LMS_BASE_URL}/api/fx/learner/v1/programs/`)
    .then(({ data }) => {
      if (!data || typeof data !== 'object') { throw new Error('fx programs: unexpected payload'); }
      state.programs = data;
      state.programsAt = Date.now();
      return data;
    })
    .finally(() => { state.programsPromise = null; });
  return state.programsPromise;
};

/** Test helper / sign-out hook: forget everything cached. */
export const resetFxLearnerCache = () => {
  Object.assign(state, {
    shell: null,
    shellAt: 0,
    shellPromise: null,
    shellFailedAt: 0,
    programs: null,
    programsAt: 0,
    programsPromise: null,
  });
  try {
    window.sessionStorage.removeItem(storageKey());
  } catch (e) {
    // ignore
  }
};
