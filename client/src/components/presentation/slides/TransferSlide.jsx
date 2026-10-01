import React from 'react';
import ClinicalCaseSlide from './ClinicalCaseSlide';

const TransferSlide = ({ slide, isFullscreen }) => {
  return <ClinicalCaseSlide slide={{ ...slide, caseType: 'transfer' }} isFullscreen={isFullscreen} />;
};

export default TransferSlide;
