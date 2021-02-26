const plugin = require('tailwindcss/plugin')

module.exports = {
  purge: {
    enabled: true,
    content: [
      './public/*.html',
      './public/*.js',
      './public/js/*.js',
      './src/*.css'
    ],
  },
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
      },
      ringWidth: {
        'lg': '64px'
      },
      transitionProperty: {
        'bg': 'backgroundColor, borderColor'
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
      flexShrink: ['compact'],
      objectFit: ['compact'],
      borderRadius: ['compact'],
      display: ['compact'],
      fontWeight: ['compact']
    },
  },
  plugins: [plugin(function({ addVariant, e }) {
    addVariant('compact', ({ modifySelectors, separator }) => {
      modifySelectors(({ className }) => {
        return `.${e(`compact`)} .compact${e(separator)}${e(className)}:not(.ignore-compact *)`
      })
    })
  })],
}