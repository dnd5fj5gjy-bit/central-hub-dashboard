import React, { useState, useEffect } from 'react';

const sectionFields = {
  projects: {
    fields: [
      { key: 'name', label: 'Project Name', type: 'text', required: true },
      { key: 'type', label: 'Type', type: 'select', options: ['Campaign', 'Launch', 'Strategy', 'Partnership', 'Other'] },
      { key: 'status', label: 'Status', type: 'select', options: ['Planning', 'Active', 'Paused', 'Complete'] },
      { key: 'startDate', label: 'Start Date', type: 'date' },
      { key: 'description', label: 'Description', type: 'textarea' },
    ],
    titleKey: 'name',
  },
  briefs: {
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'type', label: 'Type', type: 'select', options: ['Creative', 'Strategy', 'Campaign', 'Client', 'Other'] },
      { key: 'body', label: 'Brief Content', type: 'textarea' },
    ],
    titleKey: 'title',
  },
  proposals: {
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'type', label: 'Type', type: 'select', options: ['Proposal', 'Social Strategy', 'Marketing Strategy', 'Growth Plan', 'Other'] },
      { key: 'summary', label: 'Summary', type: 'textarea' },
      { key: 'body', label: 'Full Content / Link', type: 'textarea' },
    ],
    titleKey: 'title',
  },
  scripts: {
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'type', label: 'Type', type: 'select', options: ['UGC Script', 'Ad Copy', 'Email Copy', 'Social Post', 'Creative Concept', 'Other'] },
      { key: 'body', label: 'Script Content', type: 'textarea' },
    ],
    titleKey: 'title',
  },
  decks: {
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'link', label: 'Link (URL)', type: 'url' },
    ],
    titleKey: 'title',
  },
  links: {
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'url', label: 'URL', type: 'url', required: true },
      { key: 'category', label: 'Category', type: 'select', options: ['Analytics', 'Dashboard', 'Campaign', 'Creative', 'Strategy', 'Tool', 'Other'] },
      { key: 'note', label: 'Note', type: 'text' },
    ],
    titleKey: 'title',
  },
  notes: {
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'category', label: 'Category', type: 'select', options: ['Research', 'Meeting Note', 'Market Analysis', 'Competitor Intel', 'Reference', 'Other'] },
      { key: 'body', label: 'Content', type: 'textarea' },
    ],
    titleKey: 'title',
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

  const inputClasses =
    'w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-[#F0F0F5] placeholder-[#5A5A6A] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/30 transition-colors';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {config.fields.map((field) => (
        <div key={field.key}>
          <label className="block text-[12px] font-medium text-[#8A8A9A] mb-1.5 uppercase tracking-wider">
            {field.label}
            {field.required && <span className="text-[#3B82F6] ml-0.5">*</span>}
          </label>
          {field.type === 'select' ? (
            <select
              value={formData[field.key] || field.options[0]}
              onChange={(e) => handleChange(field.key, e.target.value)}
              className={inputClasses + ' cursor-pointer'}
            >
              {field.options.map((opt) => (
                <option key={opt} value={opt} className="bg-[#0A0A0F]">
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
              className={inputClasses + ' resize-y min-h-[80px]'}
            />
          ) : (
            <input
              type={field.type}
              value={formData[field.key] || ''}
              onChange={(e) => handleChange(field.key, e.target.value)}
              placeholder={`Enter ${field.label.toLowerCase()}...`}
              required={field.required}
              className={inputClasses}
            />
          )}
        </div>
      ))}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-[13px] font-medium py-2.5 rounded-lg transition-colors cursor-pointer"
        >
          {initialData ? 'Save Changes' : 'Add'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-white/[0.05] hover:bg-white/[0.08] text-[#8A8A9A] text-[13px] font-medium py-2.5 rounded-lg transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
