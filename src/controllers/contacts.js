const Contact = require('../models/contactModel');
const createError = require('http-errors');
const { saveFileToCloudinary } = require('../utils/saveFileToCloudinary');

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
    if (!req.body) {
      throw new Error(
        'Пустое тело запроса. Убедитесь, что данные переданы корректно.'
      );
    }
    const { name, phoneNumber, email, isFavourite, contactType } = req.body;

    const photoUrl = req.fileUrl || 'default_url';

    // Создаем новый контакт
    const newContact = await Contact.create({
      name,
      phoneNumber,
      email,
      isFavourite,
      contactType,
      photo: photoUrl,
      userId: req.user._id,
    });

    res.status(201).json({
      status: 201,
      message: 'Контакт успешно создан!',
      data: newContact,
    });
  } catch (error) {
    console.error('Ошибка при создании контакта:', error.message);
    next(error);
  }
};

const updateContact = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    let photoUrl;

    // Проверка наличия файла и загрузка на Cloudinary
    if (req.file) {
      photoUrl = await saveFileToCloudinary(req.file);
    }

    // Обновляем контакт по ID, userId и photoUrl
    const updatedContact = await Contact.findOneAndUpdate(
      { _id: contactId, userId: req.user._id },
      { ...req.body, photo: photoUrl || req.body.photo },
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
