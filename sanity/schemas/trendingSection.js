export default {
  name: 'trendingSection',
  title: 'Trending Section',
  type: 'document',
  fields: [
    { name: 'title', title: 'Section Title', type: 'string', initialValue: 'Trending Movies' },
    { name: 'subtitle', title: 'Subtitle', type: 'string' },
    { name: 'seedQuery', title: 'API Seed Query', type: 'string' },
    { name: 'visible', title: 'Visible', type: 'boolean', initialValue: true },
  ],
};
