export default {
  name: 'seoMetadata',
  title: 'SEO Metadata',
  type: 'document',
  fields: [
    { name: 'title', title: 'Meta Title', type: 'string', validation: Rule => Rule.required() },
    { name: 'slug', title: 'Page Slug', type: 'slug', validation: Rule => Rule.required() },
    { name: 'description', title: 'Meta Description', type: 'text', rows: 3, validation: Rule => Rule.max(160) },
    { name: 'image', title: 'Social Share Image', type: 'image', options: { hotspot: true } },
  ],
};
