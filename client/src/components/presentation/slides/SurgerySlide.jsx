import React from 'react';
import ClinicalCaseSlide from './ClinicalCaseSlide';

const SurgerySlide = ({ slide, isFullscreen }) => {
  return <ClinicalCaseSlide slide={{ ...slide, caseType: 'surgery' }} isFullscreen={isFullscreen} />;
};

export default SurgerySlide;
