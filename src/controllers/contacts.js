const Contact = require('../models/contactModel');
const createError = require('http-errors');

const getAllContacts = async (req, res, next) => {
  try {
    const {
      page = 1,
      perPage = 10,
      sortBy = 'name',
      sortOrder = 'asc',
    } = req.query;

    const pageNumber = Number(page);
    const perPageNumber = Number(perPage);

    if (
      isNaN(pageNumber) ||
      isNaN(perPageNumber) ||
      pageNumber <= 0 ||
      perPageNumber <= 0
    ) {
      return next(createError(400, 'Invalid pagination parameters'));
    }

    const sortOptions = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    const skip = (pageNumber - 1) * perPageNumber;

    // Находим контакты только текущего пользователя
    const contacts = await Contact.find({ userId: req.user._id })
      .skip(skip)
      .limit(perPageNumber)
      .sort(sortOptions);

    const totalItems = await Contact.countDocuments({ userId: req.user._id });

    res.status(200).json({
      status: 200,
      message: 'Successfully found contacts!',
      data: {
        data: contacts,
        page: pageNumber,
        perPage: perPageNumber,
        totalItems,
        totalPages: Math.ceil(totalItems / perPageNumber),
        hasPreviousPage: pageNumber > 1,
        hasNextPage: pageNumber < Math.ceil(totalItems / perPageNumber),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getContactById = async (req, res, next) => {
  try {
    // Находим контакт по ID и userId текущего пользователя
    const contact = await Contact.findOne({
      _id: req.params.contactId,
      userId: req.user._id,
    });
    if (!contact) {
      return next(
        createError(404, `Contact with id ${req.params.contactId} not found`)
      );
    }
    res.status(200).json({
      status: 200,
      message: `Successfully found contact with id ${req.params.contactId}`,
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

const createContact = async (req, res, next) => {
  try {
    const {
      name,
      phoneNumber,
      email,
      isFavourite = false,
      contactType,
    } = req.body;

    // Добавляем userId текущего пользователя к новому контакту
    const newContact = await Contact.create({
      name,
      phoneNumber,
      email,
      isFavourite,
      contactType,
      userId: req.user._id,
    });

    res.status(201).json({
      status: 201,
      message: 'Contact created!',
      data: newContact,
    });
  } catch (error) {
    next(error);
  }
};

const updateContact = async (req, res, next) => {
  try {
    const { contactId } = req.params;

    // Обновляем контакт по ID и userId
    const updatedContact = await Contact.findOneAndUpdate(
      { _id: contactId, userId: req.user._id },
      req.body,
      { new: true }
    );

    if (!updatedContact) {
      throw createError(404, `Contact with id ${contactId} not found`);
    }

    res.status(200).json({
      status: 200,
      message: 'Contact updated!',
      data: updatedContact,
    });
  } catch (error) {
    next(error);
  }
};

const deleteContact = async (req, res, next) => {
  try {
    const { contactId } = req.params;

    // Удаляем контакт по ID и userId
    const deletedContact = await Contact.findOneAndDelete({
      _id: contactId,
      userId: req.user._id,
    });

    if (!deletedContact) {
      throw createError(404, `Contact with id ${contactId} not found`);
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
};
