import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { getConfig } from '@edx/frontend-platform';
import { changeUserSessionLanguage, useIntl } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { ProfileDataModal, LisanAI } from '@edunext/frontend-essentials';

import LearningHelpSlot from '../plugin-slots/LearningHelpSlot';
import FxAccountMenu from './FxAccountMenu';
import FxIntlProvider from './FxIntlProvider';
import FxIcon from './Icons';
import { useFxShell, useLearnerPrograms } from './hooks';
import messages from './messages';
import {
  brandStyle, findMainLandmark, firstNameOf, isCurrentPage, localize, maskEmail, primaryLang, resolveUrl, withReturnTo,
} from './utils';

const ENDONYMS = { ar: 'العربية', en: 'English' };

const languageLabel = (code) => {
  if (ENDONYMS[code]) { return ENDONYMS[code]; }
  try {
    const name = new Intl.DisplayNames([code], { type: 'language' }).of(code);
    return name.charAt(0).toUpperCase() + name.slice(1);
  } catch (e) {
    return code.toUpperCase();
  }
};

/** Everything the header needs, from the shell when we have it, from the app config when we do not. */
const buildModel = (shell, lang, username) => {
  const config = getConfig();
  const lms = config.LMS_BASE_URL;
  if (shell) {
    const urls = shell.urls || {};
    return {
      logo: resolveUrl(shell.logo_url),
      title: localize(shell.short_name, lang) || localize(shell.site_name, lang) || config.SITE_NAME || '',
      org: localize(shell.parent_org, lang),
      nav: (shell.nav || [])
        .map((item) => ({
          title: localize(item.title, lang), href: resolveUrl(item.url), newTab: !!item.new_tab,
        }))
        .filter((item) => item.title && item.href),
      languages: (shell.languages && shell.languages.length ? shell.languages : config.SITE_SUPPORTED_LANGUAGES) || [],
      urls: {
        home: resolveUrl(urls.home) || resolveUrl('/'),
        login: withReturnTo(resolveUrl(urls.login) || config.LOGIN_URL),
        logout: resolveUrl(urls.logout) || config.LOGOUT_URL,
        my: resolveUrl(urls.my),
        certificates: resolveUrl(urls.certificates),
        profile: resolveUrl(urls.profile),
        help: resolveUrl(shell.help_url),
      },
    };
  }
  // Shell not available (loading failed): keep the platform's own logo/name and the links we can build.
  return {
    logo: config.LOGO_URL || null,
    title: config.SITE_NAME || '',
    org: '',
    nav: [],
    languages: config.SITE_SUPPORTED_LANGUAGES || [],
    urls: {
      home: resolveUrl('/'),
      login: withReturnTo(config.LOGIN_URL),
      logout: config.LOGOUT_URL,
      my: lms ? `${lms}/dashboard` : null,
      certificates: null,
      profile: config.ACCOUNT_PROFILE_URL && username
        ? `${config.ACCOUNT_PROFILE_URL}/u/${encodeURIComponent(username)}`
        : null,
      help: null,
    },
  };
};

/** Move focus to the page's main region, whatever id the host MFE gave it. */
const skipToMain = (event) => {
  const target = findMainLandmark();
  if (!target) { return; } // nothing to resolve: leave the plain anchor behaviour
  event.preventDefault();
  if (!target.hasAttribute('tabindex')) { target.setAttribute('tabindex', '-1'); }
  target.focus();
  if (typeof target.scrollIntoView === 'function') { target.scrollIntoView(); }
};

const FxLearnerHeaderInner = ({ showUserDropdown = true, learning = false }) => {
  const intl = useIntl();
  const { authenticatedUser } = useContext(AppContext) || {};
  const { status, shell } = useFxShell();
  const signedIn = !!authenticatedUser;
  const programs = useLearnerPrograms(signedIn && showUserDropdown);

  const lang = primaryLang(intl.locale);
  const isRtl = lang === 'ar';
  const model = buildModel(shell, lang, authenticatedUser && authenticatedUser.username);
  const loading = status === 'loading';

  const otherLanguage = model.languages
    .map((code) => primaryLang(code))
    .find((code) => code !== lang);

  const userInfo = (programs && programs.user) || {};
  const fullName = userInfo.full_name || (authenticatedUser && authenticatedUser.name) || '';
  const firstName = userInfo.first_name || firstNameOf(fullName);
  const maskedEmail = userInfo.masked_email || maskEmail(authenticatedUser && authenticatedUser.email);

  return (
    <header
      className="fx-shell fx-header"
      dir={isRtl ? 'rtl' : 'ltr'}
      lang={lang}
      style={brandStyle(shell && shell.brand_color)}
    >
      <a className="fx-skip" href="#main-content" onClick={skipToMain}>{intl.formatMessage(messages.skip)}</a>
      <div className="fx-wrap fx-headrow">
        {loading ? (
          <span className="fx-logo fx-logo--loading" aria-hidden="true" />
        ) : (
          <a className="fx-logo" href={model.urls.home}>
            {model.logo && (
              <span className="fx-logo__mark"><img src={model.logo} alt="" /></span>
            )}
            <span className="fx-logo__name">
              <span className="fx-logo__title">{model.title}</span>
              {model.org && <span className="fx-logo__org">{model.org}</span>}
            </span>
          </a>
        )}

        {model.nav.length > 0 && (
          <nav className="fx-nav" aria-label={intl.formatMessage(messages.navLabel)}>
            {model.nav.map((item) => {
              const active = isCurrentPage(item.href);
              return (
                <a
                  key={`${item.href}-${item.title}`}
                  className="fx-nav__link"
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  {...(item.newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  {item.title}
                </a>
              );
            })}
          </nav>
        )}

        <div className="fx-tools">
          {learning && getConfig().LISAN_AI_ENABLED && (<LisanAI />)}
          {otherLanguage && (
            <button
              type="button"
              className="fx-lang"
              aria-label={intl.formatMessage(messages.languageToggle)}
              onClick={() => changeUserSessionLanguage(otherLanguage)}
            >
              <FxIcon name="globe" size={16} />
              <span className="fx-lang__text" lang={otherLanguage}>{languageLabel(otherLanguage)}</span>
            </button>
          )}
          {showUserDropdown && !signedIn && model.urls.login && (
            <a className="fx-btn fx-btn--primary" href={model.urls.login}>
              {intl.formatMessage(messages.login)}
            </a>
          )}
          {showUserDropdown && signedIn && (
            <>
              {learning && (
                <span className="fx-help"><LearningHelpSlot /></span>
              )}
              <FxAccountMenu
                firstName={firstName}
                fullName={fullName}
                maskedEmail={maskedEmail}
                stats={programs && programs.stats}
                resume={programs && programs.resume}
                urls={model.urls}
              />
              <ProfileDataModal />
            </>
          )}
        </div>
      </div>
    </header>
  );
};

FxLearnerHeaderInner.propTypes = { showUserDropdown: PropTypes.bool, learning: PropTypes.bool };

/**
 * NELC learner shell header. Rendered in place of the stock header when `FX_LEARNER_THEME` is on
 * (see `isFxLearnerTheme`). Takes no menu props: everything comes from `/api/fx/theme/v1/shell/`.
 * `learning` is set when it stands in for the stock LearningHeader: it then keeps what that header renders
 * besides the header itself (the Lisan AI assistant and the help plugin slot).
 */
const FxLearnerHeader = ({ showUserDropdown = true, learning = false }) => (
  <FxIntlProvider>
    <FxLearnerHeaderInner showUserDropdown={showUserDropdown} learning={learning} />
  </FxIntlProvider>
);

FxLearnerHeader.propTypes = { showUserDropdown: PropTypes.bool, learning: PropTypes.bool };

export default FxLearnerHeader;
