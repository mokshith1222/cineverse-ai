export default {
  name: 'footerContent',
  title: 'Footer Content',
  type: 'document',
  fields: [
    { name: 'description', title: 'Brand Description', type: 'text', rows: 3 },
    { name: 'attribution', title: 'API / Legal Attribution', type: 'text', rows: 3 },
    {
      name: 'socialLinks',
      title: 'Social Links',
      type: 'array',
      of: [{ type: 'socialLink' }],
    },
  ],
};
