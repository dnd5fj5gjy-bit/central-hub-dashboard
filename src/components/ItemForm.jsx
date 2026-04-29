import React, { useState, useEffect } from 'react';

const sectionFields = {
  projects: {
    fields: [
      { key: 'title', label: 'Project Name', type: 'text', required: true },
      { key: 'type', label: 'Type', type: 'select', options: ['Campaign', 'Launch', 'Strategy', 'Partnership', 'Other'] },
      { key: 'status', label: 'Status', type: 'select', options: ['Planning', 'Active', 'Paused', 'Complete'] },
      { key: 'startDate', label: 'Start Date', type: 'date' },
      { key: 'description', label: 'Description', type: 'textarea' },
    ],
  },
  briefs: {
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'type', label: 'Type', type: 'select', options: ['Creative', 'Strategy', 'Campaign', 'Client', 'Other'] },
      { key: 'body', label: 'Brief Content', type: 'textarea' },
    ],
  },
  proposals: {
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'type', label: 'Type', type: 'select', options: ['Proposal', 'Social Strategy', 'Marketing Strategy', 'Growth Plan', 'Other'] },
      { key: 'summary', label: 'Summary', type: 'textarea' },
      { key: 'body', label: 'Full Content', type: 'textarea' },
    ],
  },
  scripts: {
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'type', label: 'Type', type: 'select', options: ['UGC Script', 'Ad Copy', 'Email Copy', 'Social Post', 'Creative Concept', 'Other'] },
      { key: 'note', label: 'Note', type: 'text' },
      { key: 'body', label: 'Script Content', type: 'textarea' },
    ],
  },
  decks: {
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'link', label: 'Link (URL)', type: 'url' },
    ],
  },
  links: {
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'url', label: 'URL', type: 'url', required: true },
      { key: 'note', label: 'Note', type: 'text' },
    ],
  },
  documents: {
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'fileType', label: 'File Type', type: 'select', options: ['PDF', 'DOCX', 'XLSX', 'PPTX', 'HTML', 'Other'] },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'content', label: 'Content', type: 'textarea' },
      { key: 'link', label: 'Link (optional URL)', type: 'url' },
    ],
  },
  notes: {
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'category', label: 'Category', type: 'select', options: ['Research', 'Meeting Note', 'Market Analysis', 'Competitor Intel', 'Reference', 'Other'] },
      { key: 'body', label: 'Content', type: 'textarea' },
    ],
  },
};

export { sectionFields };

export default function ItemForm({ section, initialData, onSubmit, onCancel }) {
  const config = sectionFields[section];
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData });
    } else {
      const defaults = {};
      config.fields.forEach((f) => {
        if (f.type === 'select') {
          defaults[f.key] = f.options[0];
        } else {
          defaults[f.key] = '';
        }
      });
      setFormData(defaults);
    }
  }, [initialData, section]);

  function handleChange(key, value) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(formData);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {config.fields.map((field) => (
        <div key={field.key}>
          <label
            className="block text-[12px] font-medium mb-1.5 uppercase tracking-wider"
            style={{ color: '#A0A0B0' }}
          >
            {field.label}
            {field.required && <span style={{ color: '#3B82F6' }} className="ml-0.5">*</span>}
          </label>
          {field.type === 'select' ? (
            <select
              value={formData[field.key] || field.options[0]}
              onChange={(e) => handleChange(field.key, e.target.value)}
              className="input-field"
            >
              {field.options.map((opt) => (
                <option key={opt} value={opt} style={{ background: '#0E0F14' }}>
                  {opt}
                </option>
              ))}
            </select>
          ) : field.type === 'textarea' ? (
            <textarea
              value={formData[field.key] || ''}
              onChange={(e) => handleChange(field.key, e.target.value)}
              placeholder={`Enter ${field.label.toLowerCase()}...`}
              rows={4}
              className="input-field"
            />
          ) : (
            <input
              type={field.type}
              value={formData[field.key] || ''}
              onChange={(e) => handleChange(field.key, e.target.value)}
              placeholder={`Enter ${field.label.toLowerCase()}...`}
              required={field.required}
              className="input-field"
            />
          )}
        </div>
      ))}

      <div className="flex gap-3 pt-2">
        <button type="submit" className="btn-primary flex-1">
          {initialData ? 'Save Changes' : 'Add'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">
          Cancel
        </button>
      </div>
    </form>
  );
}
