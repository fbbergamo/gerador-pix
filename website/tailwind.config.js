module.exports = {
  future: {
    // removeDeprecatedGapUtilities: true,
    // purgeLayersByDefault: true,
  },
  purge: ["../public/index.html"],
  theme: {
    extend: {
      width: {
        '72': "18rem",
        '84': '21rem',
        '96': '24rem'
      }
    },
  },
  variants: {},
  plugins: [
     require('@tailwindcss/ui')
  ],
}
