const plugin = require('tailwindcss/plugin')

module.exports = {
  purge: [],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    extend: {
      zIndex: {
        'behind': '-100',
        '60': '60',
        '70': '70'
      },
      spacing: {
        '144': '36rem'
      }
    }
  },
  variants: {
    extend: {
      margin: ['compact'],
      height: ['compact'],
      width: ['compact'],
      flexDirection: ['compact'],
      justifyContent: ['compact'],
      objectFit: ['compact'],
      borderRadius: ['compact'],
      display: ['compact']
    },
  },
  plugins: [plugin(function({ addVariant, e }) {
    addVariant('compact', ({ modifySelectors, separator }) => {
      modifySelectors(({ className }) => {
        return `.${e(`compact`)} .compact${e(separator)}${e(className)}`
      })
    })
  })],
}