import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  skip: {
    id: 'fx.learner.header.skip',
    defaultMessage: 'Skip to main content',
    description: 'Skip-navigation link of the learner header.',
  },
  navLabel: {
    id: 'fx.learner.header.nav.label',
    defaultMessage: 'Main navigation',
    description: 'Accessible label of the main navigation in the learner header.',
  },
  login: {
    id: 'fx.learner.header.login',
    defaultMessage: 'Sign in',
    description: 'Signed-out button in the learner header.',
  },
  languageToggle: {
    id: 'fx.learner.header.language.toggle',
    defaultMessage: 'Change language',
    description: 'Accessible label of the language toggle in the learner header.',
  },
  accountMenuLabel: {
    id: 'fx.learner.header.account.menu.label',
    defaultMessage: 'Account menu',
    description: 'Accessible label of the account menu button and panel.',
  },
  accountFallbackName: {
    id: 'fx.learner.header.account.fallback.name',
    defaultMessage: 'My account',
    description: 'Shown instead of the first name when the user has no name on record.',
  },
  menuResume: {
    id: 'fx.learner.menu.resume',
    defaultMessage: 'Continue where you left off',
    description: 'Heading of the resume card in the account menu.',
  },
  menuProgress: {
    id: 'fx.learner.menu.progress',
    defaultMessage: 'Progress {percent}%',
    description: 'Accessible label of the progress bar in the resume card; percent is a plain number.',
  },
  menuPrograms: {
    id: 'fx.learner.menu.programs',
    defaultMessage: 'My programs',
    description: 'Account menu entry for the learner programs page.',
  },
  menuCertificates: {
    id: 'fx.learner.menu.certificates',
    defaultMessage: 'My certificates',
    description: 'Account menu entry for the learner certificates page.',
  },
  menuProfile: {
    id: 'fx.learner.menu.profile',
    defaultMessage: 'Profile',
    description: 'Account menu entry for the profile page.',
  },
  menuHelp: {
    id: 'fx.learner.menu.help',
    defaultMessage: 'Help',
    description: 'Account menu entry for the help page.',
  },
  menuLogout: {
    id: 'fx.learner.menu.logout',
    defaultMessage: 'Sign out',
    description: 'Account menu entry that signs the user out.',
  },
  footerLabel: {
    id: 'fx.learner.footer.label',
    defaultMessage: 'Site footer',
    description: 'Accessible label of the learner footer.',
  },
  footerSocialLabel: {
    id: 'fx.learner.footer.social.label',
    defaultMessage: 'Social media',
    description: 'Accessible label of the social links group in the footer.',
  },
  footerNewTab: {
    id: 'fx.learner.footer.new.tab',
    defaultMessage: '(opens in a new tab)',
    description: 'Screen-reader hint appended to footer links that open in a new tab.',
  },
  footerRights: {
    id: 'fx.learner.footer.rights',
    defaultMessage: 'All rights reserved © {year} {site}',
    description: 'Fallback copyright line when the platform copyright text is not available; year is a plain number.',
  },
});

export default messages;
