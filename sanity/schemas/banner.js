export default {
  name: 'banner',
  title: 'Homepage Banner',
  type: 'document',
  fields: [
    { name: 'title', title: 'Title', type: 'string', validation: Rule => Rule.required() },
    { name: 'subtitle', title: 'Subtitle', type: 'text', rows: 3 },
    { name: 'image', title: 'Image', type: 'image', options: { hotspot: true }, fields: [{ name: 'alt', title: 'Alt text', type: 'string' }] },
    { name: 'href', title: 'Link URL', type: 'string' },
    { name: 'placement', title: 'Placement', type: 'string', options: { list: ['homepage', 'trending', 'anime', 'trailers', 'ad'] }, initialValue: 'homepage' },
    { name: 'priority', title: 'Sort Priority', type: 'number', initialValue: 10 },
    { name: 'visible', title: 'Visible', type: 'boolean', initialValue: true },
  ],
};
