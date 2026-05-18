export default {
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    {
      name: 'featureFlags',
      title: 'Feature Toggles',
      type: 'object',
      fields: [
        { name: 'aiRecommendations', title: 'AI Recommendations', type: 'boolean', initialValue: true },
        { name: 'aiSearchEnhancement', title: 'AI Search Enhancement', type: 'boolean', initialValue: true },
        { name: 'smartTrending', title: 'Smart Trending', type: 'boolean', initialValue: true },
        { name: 'ads', title: 'Advertisements', type: 'boolean', initialValue: false },
        { name: 'trailerSearchFallback', title: 'YouTube Search Fallback', type: 'boolean', initialValue: false },
        { name: 'ottTracker', title: 'OTT Tracker', type: 'boolean', initialValue: true },
      ],
    },
    {
      name: 'providers',
      title: 'API Provider Selection',
      type: 'object',
      fields: [
        { name: 'moviePrimary', title: 'Movie Primary', type: 'string', options: { list: ['omdb', 'tmdb'] }, initialValue: 'omdb' },
        { name: 'movieBackup', title: 'Movie Backup', type: 'string', options: { list: ['tvdb', 'tmdb', 'omdb'] }, initialValue: 'tvdb' },
        { name: 'animePrimary', title: 'Anime Primary', type: 'string', options: { list: ['jikan'] }, initialValue: 'jikan' },
        { name: 'tvPrimary', title: 'TV Primary', type: 'string', options: { list: ['tvmaze'] }, initialValue: 'tvmaze' },
      ],
    },
  ],
};
