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
      return next(BadRequest('Invalid pagination parameters'));
    }

    const sortOptions = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const skip = (pageNumber - 1) * perPageNumber;
    const contacts = await Contact.find()
      .skip(skip)
      .limit(perPageNumber)
      .sort(sortOptions);

    const totalItems = await Contact.countDocuments();

    res.status(200).json({
      status: 200,
      message: 'Successfully found contacts!',
      data: {
        contacts,
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

module.exports = {
  getAllContacts,
};

const getContactById = async (req, res, next) => {
  try {
    const contact = await Contact.findById(req.params.contactId);
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
    const newContact = await Contact.create({
      name,
      phoneNumber,
      email,
      isFavourite,
      contactType,
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
    const updatedContact = await Contact.findByIdAndUpdate(
      contactId,
      req.body,
      {
        new: true,
      }
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
    const deletedContact = await Contact.findByIdAndDelete(contactId);

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
