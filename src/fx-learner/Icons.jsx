import React from 'react';
import PropTypes from 'prop-types';

// Stroke icons taken from the approved prototype (24px grid, 2px stroke, currentColor).
const PATHS = {
  book: <><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" /><path d="M4 19V5" /></>,
  cert: <><circle cx="12" cy="9" r="5" /><path d="M9 14l-1 7 4-2 4 2-1-7" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></>,
  help: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.7M12 17h.01" /></>,
  out: <path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10" />,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3.5 3 14 0 18M12 3c-3 3.5-3 14 0 18" /></>,
  chevron: <path d="m6 9 6 6 6-6" />,
  external: <path d="M14 5h5v5M19 5l-8 8M18 14v5H5V6h5" />,
};

const FxIcon = ({ name, size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    {PATHS[name]}
  </svg>
);

FxIcon.propTypes = {
  name: PropTypes.oneOf(Object.keys(PATHS)).isRequired,
  size: PropTypes.number,
};

export default FxIcon;
