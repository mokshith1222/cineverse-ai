export default {
  name: 'trailer',
  title: 'Trailer',
  type: 'document',
  fields: [
    { name: 'title', title: 'Title', type: 'string', validation: Rule => Rule.required() },
    { name: 'youtubeId', title: 'YouTube Video ID', type: 'string', validation: Rule => Rule.required() },
    { name: 'thumbnail', title: 'Thumbnail', type: 'image', options: { hotspot: true } },
    { name: 'type', title: 'Type', type: 'string', options: { list: ['Movie', 'Anime', 'Series'] }, initialValue: 'Movie' },
    { name: 'releaseDate', title: 'Release Date Label', type: 'string' },
    { name: 'views', title: 'Views Label', type: 'string', initialValue: 'Official' },
    { name: 'priority', title: 'Sort Priority', type: 'number', initialValue: 10 },
    { name: 'visible', title: 'Visible', type: 'boolean', initialValue: true },
  ],
};
