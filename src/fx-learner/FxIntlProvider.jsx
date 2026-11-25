import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { IntlProvider, useIntl } from '@edx/frontend-platform/i18n';

import translations from './translations';
import { primaryLang } from './utils';

/**
 * Nested IntlProvider that layers the shell's own ar strings over whatever the host MFE loaded, so the
 * shell is translated even in MFEs that never merged this package's catalogue. English falls back to
 * each message's defaultMessage.
 */
const FxIntlProvider = ({ children }) => {
  const intl = useIntl();
  const { locale } = intl;
  const messages = useMemo(
    () => ({ ...intl.messages, ...(translations[primaryLang(locale)] || {}) }),
    [intl.messages, locale],
  );
  return <IntlProvider locale={locale} messages={messages}>{children}</IntlProvider>;
};

FxIntlProvider.propTypes = { children: PropTypes.node.isRequired };

export default FxIntlProvider;
