const
    google = require('../../config/Google'),
    x = require('colors')

// [Search]
async function search(args) {
    return google.AuthenticatedSearch(args)
}
const categorySearch = function (args) {
    return google.AuthenticatedCategorySearch(args)
}

module.exports = {
    search,
    categorySearch
}