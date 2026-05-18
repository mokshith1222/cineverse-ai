export default {
  name: 'animeSection',
  title: 'Anime Section',
  type: 'document',
  fields: [
    { name: 'title', title: 'Section Title', type: 'string', initialValue: 'Trending Anime' },
    { name: 'subtitle', title: 'Subtitle', type: 'string' },
    { name: 'mode', title: 'Source Mode', type: 'string', options: { list: ['popular', 'seasonal', 'search'] }, initialValue: 'popular' },
    { name: 'seedQuery', title: 'Search Seed Query', type: 'string' },
    { name: 'visible', title: 'Visible', type: 'boolean', initialValue: true },
  ],
};
