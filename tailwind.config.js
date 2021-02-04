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
    extend: {},
  },
  plugins: [],
}