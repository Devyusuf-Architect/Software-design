export const MODES = ['overwhelmed', 'foggy', 'anxious', 'stressed', 'calm', 'original'];

export const modeConfigs = {

  original: {
    id: 'original',
    name: 'Original',
    icon: '📄',
    tagline: 'No adjustments',
    description: 'Exactly as it was — no ClearPath processing applied.',
    oneLiner: 'Original view — this is how the content looks before ClearPath.',
    hex: {
      bg:          '#FFFFFF',
      panel:       '#F8FAFC',
      accent:      '#475569',
      accentLight: '#F1F5F9',
      text:        '#1E293B',
    },
  },

  calm: {
    id: 'calm',
    name: 'Calm',
    icon: '🌿',
    tagline: 'Clear and steady',
    description: 'Everything available, presented peacefully. No urgency, no clutter.',
    oneLiner: 'Calm mode — a clean, peaceful view with all information available.',
    hex: {
      bg:          '#F5F7F2',
      panel:       '#EBF0E5',
      accent:      '#5C7A4E',
      accentLight: '#E2EAD9',
      text:        '#2A3D22',
    },
  },

  overwhelmed: {
    id: 'overwhelmed',
    name: 'Overwhelmed',
    icon: '🌸',
    tagline: 'One thing at a time',
    description: 'Everything hidden except what matters most right now.',
    oneLiner: 'Overwhelmed mode — everything is set aside so you can focus on one step at a time.',
    hex: {
      bg:          '#FFF5F7',
      panel:       '#FFE6EC',
      accent:      '#C94B6A',
      accentLight: '#FFCFDA',
      text:        '#7D1D30',
    },
  },

  foggy: {
    id: 'foggy',
    name: 'Foggy',
    icon: '🌥️',
    tagline: 'Structured and clear',
    description: 'Key words highlighted, sections clearly labelled. Move at your pace.',
    oneLiner: 'Foggy mode — key words are highlighted and sections are clearly labelled.',
    hex: {
      bg:          '#FFFBF0',
      panel:       '#FEF0BE',
      accent:      '#B45309',
      accentLight: '#FEF3C7',
      text:        '#451A03',
    },
  },

  anxious: {
    id: 'anxious',
    name: 'Anxious',
    icon: '🌊',
    tagline: 'Calm and predictable',
    description: 'Urgent language replaced with calm wording. No surprises here.',
    oneLiner: 'Anxious mode — urgent language has been replaced with calm, reassuring wording.',
    hex: {
      bg:          '#F0F9FF',
      panel:       '#D9EFFC',
      accent:      '#0284C7',
      accentLight: '#DEF0FB',
      text:        '#0C4A6E',
    },
  },

  stressed: {
    id: 'stressed',
    name: 'Stressed',
    icon: '🌱',
    tagline: 'Small steps forward',
    description: 'Task broken into small, manageable steps. One at a time is enough.',
    oneLiner: 'Stressed mode — the task is broken into five small, manageable steps.',
    hex: {
      bg:          '#F0FDF4',
      panel:       '#C6E8D0',
      accent:      '#16A34A',
      accentLight: '#D8F5E1',
      text:        '#052E16',
    },
  },
};
