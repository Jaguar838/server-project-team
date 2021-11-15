const Categories = require('../repository/categories');

const { HttpCode, ResponseStatus } = require('../config/constants');
const { CustomError } = require('../helpers/customError');

const getCategories = async (req, res) => {
  const data = await Categories.listCategories();

  res.status(HttpCode.OK).json({
    status: ResponseStatus.SUCCESS,
    code: HttpCode.OK,
    data: [...data],
  });
};

module.exports = {
  getCategories,
};
