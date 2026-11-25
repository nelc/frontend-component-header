/* eslint-disable react/prop-types */
import React from 'react';
import { getConfig, mergeConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient, getHttpClient } from '@edx/frontend-platform/auth';
import { changeUserSessionLanguage, IntlProvider } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { Context as ResponsiveContext } from 'react-responsive';
import {
  act, fireEvent, render, screen, waitFor,
} from '@testing-library/react';

import Header, { LearningHeader, FxLearnerFooter, isFxLearnerTheme } from '../index';
import { resetFxLearnerCache } from './api';
import {
  maskEmail, resolveUrl, socialHref,
} from './utils';

jest.mock('@edx/frontend-platform/auth');
jest.mock('@edunext/frontend-essentials', () => ({
  ProfileDataModal: () => null,
  LisanAI: () => null,
}));
jest.mock('@edx/frontend-platform/i18n', () => ({
  ...jest.requireActual('@edx/frontend-platform/i18n'),
  changeUserSessionLanguage: jest.fn(),
}));

const LMS = 'http://localhost:18000';

const SHELL = {
  active: true,
  logo_url: 'https://cdn.example.com/entity-logo.svg',
  site_name: { ar: 'منصة أبعاد', en: 'Abaad Platform' },
  short_name: { ar: 'أبعاد', en: 'Abaad' },
  parent_org: { ar: 'وزارة التعليم', en: 'Ministry of Education' },
  nav: [
    { title: { ar: 'الرئيسية', en: 'Home' }, url: '/', new_tab: false },
    { title: { ar: 'البرامج التدريبية', en: 'Programs' }, url: '/courses', new_tab: false },
    { title: { ar: 'عن المنصة', en: 'About' }, url: '/p/about', new_tab: false },
  ],
  footer: {
    links: [
      { title: { ar: 'سياسة الخصوصية', en: 'Privacy' }, url: '/p/privacy', new_tab: false },
      { title: { ar: 'الأسئلة الشائعة', en: 'FAQ' }, url: 'https://help.example.com/faq', new_tab: true },
    ],
    social: [
      { provider: 'twitter', value: 'abaad_sa' },
      { provider: 'youtube', value: 'https://www.youtube.com/@abaad' },
      { provider: 'unknown-net', value: 'x' },
    ],
    copyright: { ar: 'جميع الحقوق محفوظة لوزارة التعليم', en: 'All rights reserved to MOE' },
    site_label: { ar: 'موقع الوزارة', en: 'Ministry site' },
    site_url: 'https://moe.example.com',
  },
  help_url: '/faq',
  languages: ['ar', 'en'],
  default_language: 'ar',
  urls: {
    home: '/',
    catalog: '/courses',
    about: '/p/about',
    my: '/learner/my',
    certificates: '/learner/certificates',
    profile: '/learner/profile',
    login: `${LMS}/login`,
    logout: `${LMS}/logout`,
  },
};

const PROGRAMS = {
  stats: { in_progress: 2, completed: 1, certificates: 1 },
  resume: { title: 'Data Literacy', progress_percent: 40, resume_url: `${LMS}/learning/course/x` },
  results: [],
};

const USER = {
  userId: '7', username: 'secret_username', name: 'Abdulaziz Alotaibi', email: 'abdulaziz@example.com', roles: [],
};

const renderWith = (ui, { locale = 'en', user = null } = {}) => render(
  <ResponsiveContext.Provider value={{ width: 1280 }}>
    <IntlProvider locale={locale} messages={{}}>
      <AppContext.Provider value={{ authenticatedUser: user, config: getConfig() }}>
        {ui}
      </AppContext.Provider>
    </IntlProvider>
  </ResponsiveContext.Provider>,
);

let shellGet;
let programsGet;

beforeEach(() => {
  resetFxLearnerCache();
  jest.clearAllMocks();
  mergeConfig({
    FX_LEARNER_THEME: true,
    LMS_BASE_URL: LMS,
    LOGIN_URL: `${LMS}/login`,
    LOGOUT_URL: `${LMS}/logout`,
    LOGO_URL: 'https://platform.example.com/default-logo.svg',
    SITE_NAME: 'Platform Default',
    ACCOUNT_PROFILE_URL: 'http://localhost:1995',
    SITE_SUPPORTED_LANGUAGES: [],
  });
  shellGet = jest.fn().mockResolvedValue({ data: SHELL });
  programsGet = jest.fn().mockResolvedValue({ data: PROGRAMS });
  getHttpClient.mockReturnValue({ get: shellGet });
  getAuthenticatedHttpClient.mockReturnValue({ get: programsGet });
  window.history.pushState({}, '', '/');
});

afterEach(() => {
  mergeConfig({ FX_LEARNER_THEME: false });
});

describe('isFxLearnerTheme', () => {
  it.each([
    [undefined, false], [false, false], ['false', false], ['0', false], ['', false],
    [true, true], ['true', true], [1, true],
  ])('treats %p as %p', (value, expected) => {
    mergeConfig({ FX_LEARNER_THEME: value });
    expect(isFxLearnerTheme()).toBe(expected);
  });
});

describe('runtime switch', () => {
  it('keeps the stock headers when the flag is off, without any shell call', () => {
    mergeConfig({ FX_LEARNER_THEME: false });
    const { container, unmount } = renderWith(<Header />);
    expect(container.querySelector('.site-header-desktop')).toBeInTheDocument();
    expect(container.querySelector('.fx-header')).toBeNull();
    unmount();
    const learning = renderWith(<LearningHeader courseTitle="Course A" />);
    expect(learning.container.querySelector('.learning-header')).toBeInTheDocument();
    expect(screen.getByText('Course A')).toBeInTheDocument();
    expect(learning.container.querySelector('.fx-header')).toBeNull();
    expect(shellGet).not.toHaveBeenCalled();
  });

  it('renders the learner shell for the default and learning headers when the flag is on', async () => {
    const { container, unmount } = renderWith(<Header />);
    expect(container.querySelector('.site-header-desktop')).toBeNull();
    expect(container.querySelector('.fx-header')).toBeInTheDocument();
    await screen.findByText('Abaad');
    unmount();
    const learning = renderWith(<LearningHeader courseTitle="Course A" />);
    expect(learning.container.querySelector('.fx-header')).toBeInTheDocument();
    expect(learning.container.querySelector('.learning-header')).toBeNull();
    await screen.findByText('Abaad');
  });
});

describe('FxLearnerHeader, signed out', () => {
  it('shows logo, short name, parent org, nav and a sign-in button', async () => {
    const { container } = renderWith(<Header />);
    expect(await screen.findByText('Abaad')).toBeInTheDocument();
    expect(screen.getByText('Ministry of Education')).toBeInTheDocument();
    expect(container.querySelector('.fx-logo__mark img')).toHaveAttribute('src', SHELL.logo_url);
    const links = screen.getAllByRole('link').filter((a) => a.classList.contains('fx-nav__link'));
    expect(links.map((a) => a.textContent)).toEqual(['Home', 'Programs', 'About']);
    expect(links[1]).toHaveAttribute('href', `${LMS}/courses`);
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', `${LMS}/login`);
    expect(container.querySelector('.fx-acct')).toBeNull();
    expect(shellGet).toHaveBeenCalledWith(`${LMS}/api/fx/theme/v1/shell/`);
    expect(programsGet).not.toHaveBeenCalled();
  });

  it('marks the current nav item and drops unsafe nav urls', async () => {
    const shell = {
      ...SHELL,
      nav: [
        { title: { en: 'Programs' }, url: 'http://localhost/courses', new_tab: false },
        { title: { en: 'Evil' }, url: 'javascript:alert(1)', new_tab: false }, // eslint-disable-line no-script-url
      ],
    };
    shellGet.mockResolvedValue({ data: shell });
    window.history.pushState({}, '', '/courses/course-v1:x/about');
    renderWith(<Header />);
    const programs = await screen.findByRole('link', { name: 'Programs' });
    expect(programs).toHaveAttribute('aria-current', 'page');
    expect(screen.queryByText('Evil')).toBeNull();
  });

  it('renders Arabic text and RTL direction for an ar locale, with Western digits', async () => {
    const { container } = renderWith(<Header />, { locale: 'ar' });
    expect(await screen.findByText('أبعاد')).toBeInTheDocument();
    expect(screen.getByText('وزارة التعليم')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'تسجيل الدخول' })).toBeInTheDocument();
    expect(container.querySelector('.fx-header')).toHaveAttribute('dir', 'rtl');
    expect(screen.getByRole('link', { name: 'البرامج التدريبية' })).toBeInTheDocument();
  });

  it('shows the short name as text when the entity has no logo (never the platform logo)', async () => {
    shellGet.mockResolvedValue({ data: { ...SHELL, logo_url: null } });
    const { container } = renderWith(<Header />);
    expect(await screen.findByText('Abaad')).toBeInTheDocument();
    expect(container.querySelector('.fx-logo img')).toBeNull();
  });

  it('is usable while the shell is still loading', () => {
    shellGet.mockReturnValue(new Promise(() => {}));
    const { container } = renderWith(<Header />);
    expect(container.querySelector('.fx-logo--loading')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('falls back to the platform logo and name when the shell call fails', async () => {
    shellGet.mockRejectedValue(new Error('boom'));
    const { container } = renderWith(<Header />);
    await waitFor(() => expect(container.querySelector('.fx-logo__mark img')).toBeInTheDocument());
    expect(container.querySelector('.fx-logo__mark img')).toHaveAttribute('src', getConfig().LOGO_URL);
    expect(screen.getByText('Platform Default')).toBeInTheDocument();
    expect(container.querySelector('.fx-nav')).toBeNull();
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', `${LMS}/login`);
  });

  it('caches the shell between renders', async () => {
    const first = renderWith(<Header />);
    await screen.findByText('Abaad');
    first.unmount();
    renderWith(<Header />);
    expect(screen.getByText('Abaad')).toBeInTheDocument(); // synchronous: served from cache
    expect(shellGet).toHaveBeenCalledTimes(1);
  });
});

describe('FxLearnerHeader, language toggle', () => {
  it('offers English on an Arabic page and switches without leaving the page', async () => {
    renderWith(<Header />, { locale: 'ar' });
    const toggle = await screen.findByRole('button', { name: 'تغيير اللغة' });
    expect(toggle).toHaveTextContent('English');
    fireEvent.click(toggle);
    expect(changeUserSessionLanguage).toHaveBeenCalledWith('en');
  });

  it('offers Arabic on an English page', async () => {
    renderWith(<Header />, { locale: 'en' });
    const toggle = await screen.findByRole('button', { name: 'Change language' });
    expect(toggle).toHaveTextContent('العربية');
    fireEvent.click(toggle);
    expect(changeUserSessionLanguage).toHaveBeenCalledWith('ar');
  });

  it('is hidden when only one language is available', async () => {
    shellGet.mockResolvedValue({ data: { ...SHELL, languages: ['ar'] } });
    renderWith(<Header />, { locale: 'ar' });
    await screen.findByText('أبعاد');
    expect(screen.queryByRole('button', { name: 'تغيير اللغة' })).toBeNull();
  });
});

describe('FxLearnerHeader, signed in', () => {
  it('shows the avatar initial and the FIRST name, never the username', async () => {
    const { container } = renderWith(<Header />, { user: USER });
    await screen.findByText('Abaad');
    expect(screen.getByText('Abdulaziz')).toBeInTheDocument();
    expect(container.querySelector('.fx-avatar')).toHaveTextContent('A');
    expect(screen.queryByText(/secret_username/)).toBeNull();
    expect(screen.queryByRole('link', { name: 'Sign in' })).toBeNull();
  });

  it('opens the account menu with name, masked email, resume card, counts, links and red sign-out', async () => {
    const { container } = renderWith(<Header />, { user: USER });
    await screen.findByText('Abaad');
    await waitFor(() => expect(programsGet).toHaveBeenCalledWith(`${LMS}/api/fx/learner/v1/programs/`));
    expect(container.querySelector('.fx-acct__menu')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Account menu' }));

    const menu = container.querySelector('.fx-acct__menu');
    expect(menu).toHaveTextContent('Abdulaziz Alotaibi');
    expect(menu).toHaveTextContent('a***@example.com');
    expect(menu).not.toHaveTextContent('secret_username');

    const resume = screen.getByRole('link', { name: /Continue where you left off/ });
    expect(resume).toHaveAttribute('href', PROGRAMS.resume.resume_url);
    expect(resume).toHaveTextContent('Data Literacy');
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '40');

    const programs = screen.getByRole('link', { name: /My programs/ });
    expect(programs).toHaveAttribute('href', `${LMS}/learner/my`);
    expect(programs).toHaveTextContent('2');
    const certs = screen.getByRole('link', { name: /My certificates/ });
    expect(certs).toHaveAttribute('href', `${LMS}/learner/certificates`);
    expect(certs).toHaveTextContent('1');
    expect(screen.getByRole('link', { name: 'Profile' })).toHaveAttribute('href', `${LMS}/learner/profile`);
    expect(screen.getByRole('link', { name: 'Help' })).toHaveAttribute('href', `${LMS}/faq`);
    const out = screen.getByRole('link', { name: 'Sign out' });
    expect(out).toHaveAttribute('href', `${LMS}/logout`);
    expect(out).toHaveClass('fx-acct__item--out');
  });

  it('closes the menu on Escape', async () => {
    const { container } = renderWith(<Header />, { user: USER });
    await screen.findByText('Abaad');
    fireEvent.click(screen.getByRole('button', { name: 'Account menu' }));
    expect(container.querySelector('.fx-acct__menu')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(container.querySelector('.fx-acct__menu')).toBeNull();
  });

  it('still renders the menu (without counts or resume) when the programs call fails', async () => {
    programsGet.mockRejectedValue(new Error('403'));
    const { container } = renderWith(<Header />, { user: USER });
    await screen.findByText('Abaad');
    await waitFor(() => expect(programsGet).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: 'Account menu' }));
    expect(container.querySelector('.fx-acct__resume')).toBeNull();
    expect(container.querySelector('.fx-acct__item em')).toBeNull();
    expect(screen.getByRole('link', { name: 'My programs' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign out' })).toBeInTheDocument();
  });

  it('uses a generic label when the user has no name on record', async () => {
    renderWith(<Header />, { user: { ...USER, name: undefined } });
    await screen.findByText('Abaad');
    expect(screen.getByText('My account')).toBeInTheDocument();
    expect(screen.queryByText(/secret_username/)).toBeNull();
  });

  it('builds the menu from the platform config when the shell call fails', async () => {
    shellGet.mockRejectedValue(new Error('boom'));
    renderWith(<Header />, { user: USER });
    await waitFor(() => expect(screen.getByText('Platform Default')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Account menu' }));
    expect(screen.getByRole('link', { name: /My programs/ })).toHaveAttribute('href', `${LMS}/dashboard`);
    expect(screen.getByRole('link', { name: 'Sign out' })).toHaveAttribute('href', `${LMS}/logout`);
    expect(screen.queryByRole('link', { name: 'Help' })).toBeNull();
  });

  it('hides the account area when showUserDropdown is false', async () => {
    const { container } = renderWith(<LearningHeader showUserDropdown={false} />, { user: USER });
    await screen.findByText('Abaad');
    expect(container.querySelector('.fx-acct')).toBeNull();
    expect(programsGet).not.toHaveBeenCalled();
  });

  it('translates the menu for an ar locale', async () => {
    renderWith(<Header />, { locale: 'ar', user: USER });
    await screen.findByText('أبعاد');
    fireEvent.click(screen.getByRole('button', { name: 'قائمة الحساب' }));
    expect(screen.getByText('أكمل من حيث توقفت')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /برامجي/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /شهاداتي/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'الملف الشخصي' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'المساعدة' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'تسجيل الخروج' })).toBeInTheDocument();
  });
});

describe('FxLearnerFooter', () => {
  it('renders links, social icons, copyright and the entity site', async () => {
    const { container } = renderWith(<FxLearnerFooter />);
    expect(await screen.findByText('All rights reserved to MOE')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', `${LMS}/p/privacy`);
    const faq = screen.getByRole('link', { name: /FAQ/ });
    expect(faq).toHaveAttribute('target', '_blank');
    expect(faq).toHaveAttribute('rel', 'noopener noreferrer');
    const site = screen.getByRole('link', { name: /Ministry site/ });
    expect(site).toHaveAttribute('href', 'https://moe.example.com/');
    expect(site).toHaveAttribute('target', '_blank');
    expect(screen.getByRole('link', { name: 'X' })).toHaveAttribute('href', 'https://x.com/abaad_sa');
    expect(screen.getByRole('link', { name: 'YouTube' })).toHaveAttribute('href', 'https://www.youtube.com/@abaad');
    expect(container.querySelectorAll('.fx-foot__social a')).toHaveLength(2);
  });

  it('is Arabic and RTL for an ar locale', async () => {
    const { container } = renderWith(<FxLearnerFooter />, { locale: 'ar' });
    expect(await screen.findByText('جميع الحقوق محفوظة لوزارة التعليم')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'سياسة الخصوصية' })).toBeInTheDocument();
    expect(container.querySelector('.fx-footer')).toHaveAttribute('dir', 'rtl');
  });

  it('renders nothing while loading and a minimal copyright line if the shell call fails', async () => {
    let reject;
    shellGet.mockReturnValue(new Promise((_, r) => { reject = r; }));
    const { container } = renderWith(<FxLearnerFooter />);
    expect(container.querySelector('.fx-footer')).toBeNull();
    await act(async () => { reject(new Error('boom')); });
    await waitFor(() => expect(container.querySelector('.fx-footer')).toBeInTheDocument());
    expect(container.querySelector('.fx-foot__rights')).toHaveTextContent(/All rights reserved © \d{4} Platform Default/);
    expect(container.querySelector('.fx-foot__links')).toBeNull();
    expect(container.querySelector('.fx-foot__social')).toBeNull();
  });
});

describe('utils', () => {
  it('masks emails', () => {
    expect(maskEmail('ali@example.com')).toBe('a***@example.com');
    expect(maskEmail('nope')).toBe('');
  });

  it('only resolves safe urls, relative to the LMS', () => {
    expect(resolveUrl('/courses')).toBe(`${LMS}/courses`);
    expect(resolveUrl('https://a.example.com/x')).toBe('https://a.example.com/x');
    expect(resolveUrl('javascript:alert(1)')).toBeNull(); // eslint-disable-line no-script-url
    expect(resolveUrl('data:text/html,hi')).toBeNull();
    expect(resolveUrl('')).toBeNull();
  });

  it('builds social links from handles or urls and rejects unknown providers', () => {
    expect(socialHref('twitter', '@abaad')).toBe('https://x.com/abaad');
    expect(socialHref('snapchat', 'abaad')).toBe('https://www.snapchat.com/add/abaad');
    expect(socialHref('instagram', 'https://instagram.com/abaad')).toBe('https://instagram.com/abaad');
    expect(socialHref('myspace', 'abaad')).toBeNull();
  });
});
