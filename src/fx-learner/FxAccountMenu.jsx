import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';

import FxIcon from './Icons';
import messages from './messages';
import { clampPercent, initialOf, resolveUrl } from './utils';

const hasCount = (n) => Number.isFinite(Number(n)) && n !== null && n !== '';

/**
 * Signed-in account menu (brief 3.2): name + masked email, resume card, programs, certificates, profile,
 * help, divider, sign out. Entries whose URL is unknown are left out rather than rendered dead.
 */
const FxAccountMenu = ({
  firstName = '', fullName = '', maskedEmail = '', stats = null, resume = null, urls,
}) => {
  const intl = useIntl();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!open) { return undefined; }
    const onPointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) { setOpen(false); }
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        if (buttonRef.current) { buttonRef.current.focus(); }
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const fallbackName = intl.formatMessage(messages.accountFallbackName);
  const initial = initialOf(firstName);
  const resumePercent = resume ? clampPercent(resume.progress_percent) : 0;
  // Like every other URL from the API: relative paths belong to the LMS, not to the MFE's own origin.
  const resumeHref = resume ? resolveUrl(resume.resume_url) : null;

  const items = [
    {
      key: 'programs', icon: 'book', href: urls.my, label: messages.menuPrograms, count: stats && stats.in_progress,
    },
    {
      key: 'certificates', icon: 'cert', href: urls.certificates, label: messages.menuCertificates, count: stats && stats.certificates,
    },
    {
      key: 'profile', icon: 'user', href: urls.profile, label: messages.menuProfile,
    },
    {
      key: 'help', icon: 'help', href: urls.help, label: messages.menuHelp,
    },
  ].filter((item) => item.href);

  return (
    <div className="fx-acct" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className="fx-acct__btn"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls="fx-acct-menu"
        aria-label={intl.formatMessage(messages.accountMenuLabel)}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="fx-avatar" aria-hidden="true">{initial || <FxIcon name="user" size={16} />}</span>
        <span className="fx-acct__name">{firstName || fallbackName}</span>
        <span className="fx-acct__chevron"><FxIcon name="chevron" size={16} /></span>
      </button>
      {open && (
        <div
          id="fx-acct-menu"
          className="fx-acct__menu"
          role="group"
          aria-label={intl.formatMessage(messages.accountMenuLabel)}
        >
          <div className="fx-acct__head">
            <span className="fx-avatar" aria-hidden="true">{initial || <FxIcon name="user" size={16} />}</span>
            <div className="fx-acct__who">
              <b>{fullName || firstName || fallbackName}</b>
              {maskedEmail && <small dir="ltr">{maskedEmail}</small>}
            </div>
          </div>

          {resumeHref && (
            <a className="fx-acct__resume" href={resumeHref}>
              <small>{intl.formatMessage(messages.menuResume)}</small>
              <b>{resume.title}</b>
              <span
                className="fx-pbar"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={resumePercent}
                aria-label={intl.formatMessage(messages.menuProgress, { percent: String(resumePercent) })}
              >
                <i style={{ width: `${resumePercent}%` }} />
              </span>
            </a>
          )}

          <div className="fx-acct__sep" />
          {items.map((item) => (
            <a key={item.key} className="fx-acct__item" href={item.href}>
              <FxIcon name={item.icon} />
              <span>{intl.formatMessage(item.label)}</span>
              {hasCount(item.count) && <em>{String(item.count)}</em>}
            </a>
          ))}
          {urls.logout && (
            <>
              <div className="fx-acct__sep" />
              <a className="fx-acct__item fx-acct__item--out" href={urls.logout}>
                <FxIcon name="out" />
                <span>{intl.formatMessage(messages.menuLogout)}</span>
              </a>
            </>
          )}
        </div>
      )}
    </div>
  );
};

FxAccountMenu.propTypes = {
  firstName: PropTypes.string,
  fullName: PropTypes.string,
  maskedEmail: PropTypes.string,
  stats: PropTypes.shape({
    in_progress: PropTypes.number,
    completed: PropTypes.number,
    certificates: PropTypes.number,
  }),
  resume: PropTypes.shape({
    title: PropTypes.string,
    progress_percent: PropTypes.number,
    resume_url: PropTypes.string,
  }),
  urls: PropTypes.shape({
    my: PropTypes.string,
    certificates: PropTypes.string,
    profile: PropTypes.string,
    help: PropTypes.string,
    logout: PropTypes.string,
  }).isRequired,
};

export default FxAccountMenu;
