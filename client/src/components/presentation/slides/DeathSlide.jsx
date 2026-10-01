import React from 'react';
import ClinicalCaseSlide from './ClinicalCaseSlide';

const DeathSlide = ({ slide, isFullscreen }) => {
  return <ClinicalCaseSlide slide={{ ...slide, caseType: 'death' }} isFullscreen={isFullscreen} />;
};

export default DeathSlide;
