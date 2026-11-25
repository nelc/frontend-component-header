import React from 'react';
import PropTypes from 'prop-types';
import Header from './Header';
import LearningHeader from './learning-header/LearningHeader';
import messages from './i18n/index';
import StudioHeader from './studio-header';
import {
  FxLearnerHeader, FxLearnerFooter, isFxLearnerTheme,
} from './fx-learner';

// Runtime switch: with `FX_LEARNER_THEME` on (MFE runtime config, per tenant) the stock headers are replaced
// by the NELC learner shell; with it off they render exactly as before. The flag is read on every render.
const SwitchableHeader = (props) => (
  isFxLearnerTheme() ? <FxLearnerHeader /> : <Header {...props} />
);

// The learner shell has no course lock-up, so only `showUserDropdown` carries over; course props are ignored.
// `learning` keeps the Lisan AI assistant and the help plugin slot the stock LearningHeader renders.
const SwitchableLearningHeader = ({ showUserDropdown = true, ...rest }) => (
  isFxLearnerTheme()
    ? <FxLearnerHeader showUserDropdown={showUserDropdown} learning />
    : <LearningHeader showUserDropdown={showUserDropdown} {...rest} />
);

SwitchableLearningHeader.propTypes = { showUserDropdown: PropTypes.bool };

export {
  SwitchableLearningHeader as LearningHeader,
  messages,
  StudioHeader,
  FxLearnerHeader,
  FxLearnerFooter,
  isFxLearnerTheme,
};

export default SwitchableHeader;
