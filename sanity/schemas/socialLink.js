export default {
  name: 'socialLink',
  title: 'Social Link',
  type: 'object',
  fields: [
    { name: 'label', title: 'Label', type: 'string', validation: Rule => Rule.required() },
    { name: 'href', title: 'URL', type: 'url', validation: Rule => Rule.required() },
  ],
};
