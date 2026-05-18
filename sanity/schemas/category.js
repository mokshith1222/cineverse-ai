export default {
  name: 'category',
  title: 'Category / Genre',
  type: 'document',
  fields: [
    { name: 'title', title: 'Title', type: 'string', validation: Rule => Rule.required() },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' } },
    { name: 'description', title: 'Description', type: 'text', rows: 3 },
    { name: 'visible', title: 'Visible', type: 'boolean', initialValue: true },
  ],
};
