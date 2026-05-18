export default {
  name: 'featuredMovie',
  title: 'Featured Movie',
  type: 'document',
  fields: [
    { name: 'title', title: 'Title', type: 'string', validation: Rule => Rule.required() },
    { name: 'imdbId', title: 'IMDb ID', type: 'string' },
    { name: 'poster', title: 'Poster', type: 'image', options: { hotspot: true } },
    { name: 'trailerYoutubeId', title: 'Stored Trailer YouTube ID', type: 'string' },
    { name: 'priority', title: 'Sort Priority', type: 'number', initialValue: 10 },
    { name: 'visible', title: 'Visible', type: 'boolean', initialValue: true },
  ],
};
