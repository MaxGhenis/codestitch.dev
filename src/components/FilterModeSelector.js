import React from 'react';

const FilterModeSelector = ({ label, helpText, options, value, onChange }) => {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label>{label}</label>
      <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
        {helpText}
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: '100%', padding: '0.25rem' }}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FilterModeSelector;