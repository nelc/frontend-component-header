import React from 'react';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFacebookF, faInstagram, faLinkedinIn, faSnapchat, faTelegram, faTiktok, faWhatsapp, faXTwitter, faYoutube,
} from '@fortawesome/free-brands-svg-icons';

import FxIntlProvider from './FxIntlProvider';
import FxIcon from './Icons';
import { useFxShell } from './hooks';
import messages from './messages';
import {
  brandStyle, localize, primaryLang, resolveUrl, socialHref, socialKey,
} from './utils';

const SOCIAL_ICONS = {
  x: faXTwitter,
  youtube: faYoutube,
  instagram: faInstagram,
  snapchat: faSnapchat,
  linkedin: faLinkedinIn,
  facebook: faFacebookF,
  tiktok: faTiktok,
  telegram: faTelegram,
  whatsapp: faWhatsapp,
};

const SOCIAL_LABELS = {
  x: 'X',
  youtube: 'YouTube',
  instagram: 'Instagram',
  snapchat: 'Snapchat',
  linkedin: 'LinkedIn',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  telegram: 'Telegram',
  whatsapp: 'WhatsApp',
};

const FxLearnerFooterInner = () => {
  const intl = useIntl();
  const { status, shell } = useFxShell();
  const lang = primaryLang(intl.locale);
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  if (status === 'loading') { return null; }

  const footer = (shell && shell.footer) || {};
  const links = (footer.links || [])
    .map((link) => ({
      title: localize(link.title, lang), href: resolveUrl(link.url), newTab: !!link.new_tab,
    }))
    .filter((link) => link.title && link.href);
  const siteHref = resolveUrl(footer.site_url);
  const siteLabel = localize(footer.site_label, lang);
  const social = (footer.social || [])
    .map((entry) => ({
      key: socialKey(entry.provider), href: socialHref(entry.provider, entry.value),
    }))
    .filter((entry) => entry.href && SOCIAL_ICONS[entry.key]);
  const copyright = localize(footer.copyright, lang) || intl.formatMessage(messages.footerRights, {
    year: String(new Date().getFullYear()),
    site: (shell && (localize(shell.short_name, lang) || localize(shell.site_name, lang))) || getConfig().SITE_NAME || '',
  });
  const newTabHint = intl.formatMessage(messages.footerNewTab);

  return (
    <footer
      className="fx-shell fx-footer"
      dir={dir}
      lang={lang}
      aria-label={intl.formatMessage(messages.footerLabel)}
      style={brandStyle(shell && shell.brand_color)}
    >
      <div className="fx-wrap fx-foot">
        <small className="fx-foot__rights">{copyright}</small>
        {(links.length > 0 || (siteHref && siteLabel)) && (
          <ul className="fx-foot__links">
            {links.map((link) => (
              <li key={`${link.href}-${link.title}`}>
                <a href={link.href} {...(link.newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                  {link.title}
                  {link.newTab && <span className="fx-sr-only"> {newTabHint}</span>}
                </a>
              </li>
            ))}
            {siteHref && siteLabel && (
              <li>
                <a href={siteHref} target="_blank" rel="noopener noreferrer">
                  {siteLabel}
                  <FxIcon name="external" size={13} />
                  <span className="fx-sr-only"> {newTabHint}</span>
                </a>
              </li>
            )}
          </ul>
        )}
        {social.length > 0 && (
          <div className="fx-foot__social" role="group" aria-label={intl.formatMessage(messages.footerSocialLabel)}>
            {social.map((entry) => (
              <a
                key={`${entry.key}-${entry.href}`}
                href={entry.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={SOCIAL_LABELS[entry.key]}
              >
                <FontAwesomeIcon icon={SOCIAL_ICONS[entry.key]} fixedWidth />
              </a>
            ))}
          </div>
        )}
      </div>
    </footer>
  );
};

/** NELC learner shell footer: links, social icons, copyright and the entity's site, all from the shell API. */
const FxLearnerFooter = () => (
  <FxIntlProvider>
    <FxLearnerFooterInner />
  </FxIntlProvider>
);

export default FxLearnerFooter;
