import React from 'react';
import ClinicalCaseSlide from './ClinicalCaseSlide';

const CriticalSlide = ({ slide, isFullscreen }) => {
  return <ClinicalCaseSlide slide={{ ...slide, caseType: 'critical' }} isFullscreen={isFullscreen} />;
};

export default CriticalSlide;
