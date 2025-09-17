
// // src/modules/contact/contact.controller.ts
// import { Request, Response } from 'express';
// import catchAsync from '../../utils/catchAsync';
// import sendResponse from '../../utils/sendResponse';
// import User from '../user/user.model';
// import Contact from './contact.model';
// import httpStatus from 'http-status';

// // Import Contacts (আপনার আগের কোড)
// const importContacts = catchAsync(async (req: Request, res: Response) => {
//   const contacts = req.body.contacts;
//   const ownerId = req.user?.id;

//   if (!contacts || !Array.isArray(contacts)) {
//     return sendResponse(res, {
//       statusCode: httpStatus.BAD_REQUEST,
//       success: false,
//       message: 'Contacts are required',
//       data: null,
//     });
//   }

//   const phoneNumbers = contacts
//     .filter(c => c.phone)
//     .map(c => c.phone!.replace(/\D/g, ''));
//   const emails = contacts.filter(c => c.email).map(c => c.email);

//   // find app users
//   const appUsers = await User.find({
//     $or: [{ phone: { $in: phoneNumbers } }, { email: { $in: emails } }],
//   }).select('phone email fullName role categories');

//   const mappedContacts = [];

//   for (const contact of contacts) {
//     const user = appUsers.find(
//       u =>
//         (contact.phone && u.phone === contact.phone.replace(/\D/g, '')) ||
//         (contact.email && u.email === contact.email)
//     );

//     const newContact = {
//       name: contact.name,
//       phone: contact.phone || null,
//       email: contact.email || null,
//       isAppUser: !!user,
//       userId: user?._id,
//       categories: user?.categories || [],
//       ownerId,
//     };

//     // Save to DB
//     await Contact.create(newContact);

//     mappedContacts.push(newContact);
//   }

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'Contacts imported successfully',
//     data: mappedContacts,
//   });
// });

// // Get all contacts for logged-in user
// const getAllContacts = catchAsync(async (req: Request, res: Response) => {
//   const ownerId = req.user?.id;
//   const contacts = await Contact.find({ ownerId }).sort({ createdAt: -1 });

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'Contacts fetched successfully',
//     data: contacts,
//   });
// });


// export const contactController = {
//     importContacts, 
//     getAllContacts,
 
// };

// src/modules/contact/contact.controller.ts
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import User from '../user/user.model';
import Contact from './contact.model';
import httpStatus from 'http-status';

// Import Contacts (আপনার আগের কোড)
const importContacts = catchAsync(async (req: Request, res: Response) => {
  const contacts = req.body.contacts;
  const ownerId = req.user?.id;

  if (!contacts || !Array.isArray(contacts)) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: 'Contacts are required',
      data: null,
    });
  }

  const phoneNumbers = contacts
    .filter(c => c.phone)
    .map(c => c.phone!.replace(/\D/g, ''));
  const emails = contacts.filter(c => c.email).map(c => c.email);

  // find app users
  const appUsers = await User.find({
    $or: [{ phone: { $in: phoneNumbers } }, { email: { $in: emails } }],
  }).select('phone email fullName role categories');

  const mappedContacts = [];

  for (const contact of contacts) {
    const user = appUsers.find(
      u =>
        (contact.phone && u.phone === contact.phone.replace(/\D/g, '')) ||
        (contact.email && u.email === contact.email)
    );

    const newContact = {
      name: contact.name,
      phone: contact.phone || null,
      email: contact.email || null,
      isAppUser: !!user,
      userId: user?._id,
      categories: user?.categories || [],
      ownerId,
    };

    // Save to DB
    await Contact.create(newContact);

    mappedContacts.push(newContact);
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Contacts imported successfully',
    data: mappedContacts,
  });
});

export const contactController = {
    importContacts, 
};

 