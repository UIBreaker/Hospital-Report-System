import React, { useState } from 'react';
import CustomFormList from '../custom-forms/CustomFormList';
import CustomFormBuilder from '../custom-forms/CustomFormBuilder';
import DynamicFormRenderer from '../custom-forms/DynamicFormRenderer';
import DynamicFormSubmissions from '../custom-forms/DynamicFormSubmissions';
import TrackerWidgetView from '../custom-forms/TrackerWidgetView';

const CustomFormsTab = () => {
  // view: 'list' | 'builder' | 'renderer' | 'submissions' | 'tracker'
  const [view, setView] = useState('list');
  const [selectedForm, setSelectedForm] = useState(null);
  const [targetCode, setTargetCode] = useState('');

  const handleCreateNew = () => {
    setSelectedForm(null);
    setView('builder');
  };

  const handleEdit = (form) => {
    setSelectedForm(form);
    setView('builder');
  };

  const handleSelectForm = (code) => {
    setTargetCode(code);
    setView('renderer');
  };

  const handleViewTracker = (code) => {
    setTargetCode(code);
    setView('tracker');
  };

  const handleViewSubmissions = (code) => {
    setTargetCode(code);
    setView('submissions');
  };

  const handleBackToList = () => {
    setSelectedForm(null);
    setTargetCode('');
    setView('list');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {view === 'list' && (
        <CustomFormList
          onCreateForm={handleCreateNew}
          onEditForm={handleEdit}
          onSelectForm={handleSelectForm}
          onViewTracker={handleViewTracker}
          onViewSubmissions={handleViewSubmissions}
        />
      )}

      {view === 'builder' && (
        <CustomFormBuilder
          initialForm={selectedForm}
          onCancel={handleBackToList}
          onSaved={() => handleBackToList()}
        />
      )}

      {view === 'renderer' && (
        <DynamicFormRenderer
          formCode={targetCode}
          onBack={handleBackToList}
        />
      )}

      {view === 'tracker' && (
        <TrackerWidgetView
          formCode={targetCode}
          onBack={handleBackToList}
        />
      )}

      {view === 'submissions' && (
        <DynamicFormSubmissions
          formCode={targetCode}
          onBack={handleBackToList}
        />
      )}
    </div>
  );
};

export default CustomFormsTab;
