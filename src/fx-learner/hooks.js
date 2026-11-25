import { useEffect, useState } from 'react';
import {
  getCachedShell, loadShell, loadPrograms, getCachedPrograms,
} from './api';

/** @returns {{status: 'loading'|'ready'|'error', shell: object|null}} */
export const useFxShell = () => {
  const [result, setResult] = useState(() => {
    const cached = getCachedShell();
    return cached ? { status: 'ready', shell: cached } : { status: 'loading', shell: null };
  });

  useEffect(() => {
    let cancelled = false;
    if (result.status === 'ready') { return undefined; }
    loadShell()
      .then((shell) => { if (!cancelled) { setResult({ status: 'ready', shell }); } })
      .catch(() => { if (!cancelled) { setResult({ status: 'error', shell: null }); } });
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return result;
};

/** Learner stats + resume card data; stays null if the call fails (the menu then just omits them). */
export const useLearnerPrograms = (enabled) => {
  const [programs, setPrograms] = useState(() => (enabled ? getCachedPrograms() : null));

  useEffect(() => {
    let cancelled = false;
    if (!enabled) { return undefined; }
    loadPrograms()
      .then((data) => { if (!cancelled) { setPrograms(data); } })
      .catch(() => { /* counts and resume are optional */ });
    return () => { cancelled = true; };
  }, [enabled]);

  return programs;
};
