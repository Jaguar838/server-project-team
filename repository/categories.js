const Category = require('../model/category');

const listCategories = async () => {
  const results = await Category.find({});
  return results;
};

const getCategoryById = async categoryId => {
  const result = await Category.findById(categoryId);

  return result;
};

module.exports = {
  listCategories,
  getCategoryById,
};
