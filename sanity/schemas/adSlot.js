export default {
  name: 'adSlot',
  title: 'Ad Section',
  type: 'document',
  fields: [
    { name: 'name', title: 'Internal Name', type: 'string', validation: Rule => Rule.required() },
    { name: 'placement', title: 'Placement', type: 'string', options: { list: ['homepage-top', 'homepage-inline', 'sidebar', 'footer'] } },
    { name: 'label', title: 'Public Label', type: 'string', initialValue: 'Advertisement' },
    { name: 'html', title: 'Ad HTML', type: 'text', rows: 6 },
    { name: 'priority', title: 'Sort Priority', type: 'number', initialValue: 10 },
    { name: 'enabled', title: 'Enabled', type: 'boolean', initialValue: false },
  ],
};
