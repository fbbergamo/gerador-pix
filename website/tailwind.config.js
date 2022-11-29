module.exports = {
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
  purge: {
    content: ["../views/**/*", "underline", "flex-col", "text-sm", "inline-flex","items-center","px-4","py-2","border","border-transparent","text-base","leading-6","font-medium","rounded-md","text-white","bg-indigo-600","hover:bg-indigo-500","focus:outline-none","focus:border-indigo-700","focus:shadow-outline-indigo","active:bg-indigo-700","transition","ease-in-out","duration-150"],
    options: {
      safelist: ['hidden', 'flex-col'],
    }
  },
  theme: {
    extend: {
      width: {
        '72': "18rem",
        '84': '21rem',
        '96': '24rem',
        'plaquinha-pix': '32rem'
      },
      screens: {
        'print': {'raw': 'print'},
      }
    },
  },
  variants: {},
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
