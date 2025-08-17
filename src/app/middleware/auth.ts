/* eslint-disable @typescript-eslint/no-unused-vars */
// import httpStatus from 'http-status';
// import jwt, { JwtPayload } from 'jsonwebtoken';
// import config from '../config/index';
// import AppError from '../error/AppError';
// import User from '../modules/user/user.model';
// import catchAsync from '../utils/catchAsync';

// const auth = (...userRoles: string[]) => {
//   return catchAsync(async (req, res, next) => {
//     const token = req?.headers?.authorization?.split(' ')[1];

//     if (!token) {
//       throw new AppError(httpStatus.UNAUTHORIZED, 'you are not authorized!');
//     }
//     let decode;
//     try {
//       decode = jwt.verify(
//         token,
//         config.jwt_access_secret as string,
//       ) as JwtPayload;
//       console.log('Token Decode:', decode);
//     } catch (err) {
//       throw new AppError(httpStatus.UNAUTHORIZED, 'unauthorized');
//     }
//     const { role, userId } = decode as JwtPayload;
//     console.log('JWT Decode:', decode);
//     const isUserExist = await User.IsUserExistbyId(userId);
//     if (!isUserExist) {
//       throw new AppError(httpStatus.NOT_FOUND, 'user not found');
//     }
//     if (userRoles && !userRoles.includes(role)) {
//       throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized');
//     }
//     req.user = decode;
//     next();
//   });
// };
// export default auth;
/* eslint-disable @typescript-eslint/no-unused-vars */
// import httpStatus from 'http-status';
// import jwt, { JwtPayload } from 'jsonwebtoken';
// import config from '../config/index';
// import AppError from '../error/AppError';
// import User from '../modules/user/user.model';
// import catchAsync from '../utils/catchAsync';

// const auth = (...userRoles: string[]) => {
//   return catchAsync(async (req, res, next) => {
//     const token = req?.headers?.authorization?.split(' ')[1];

//     if (!token) {
//       throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
//     }

//     let decode;
//     try {
//       decode = jwt.verify(
//         token,
//         config.jwt_access_secret as string,
//       ) as JwtPayload;
//       console.log('Token Decode:', decode);
//     } catch (err) {
//       throw new AppError(
//         httpStatus.UNAUTHORIZED,
//         'Unauthorized! Invalid token',
//       );
//     }

//     // ✅ Fix: Handle both id and userId from token payload
//     const id = (decode as any).userId || decode?.id; // fallback if either exists
//     const role = (decode as any).role;

//     if (!id) {
//       throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid token payload');
//     }

//     // ✅ User existence check
//     const isUserExist = await User.IsUserExistbyId(id);
//     if (!isUserExist) {
//       throw new AppError(httpStatus.NOT_FOUND, 'User not found');
//     }

//     // ✅ Role check if required
//     if (userRoles.length && !userRoles.includes(role)) {
//       throw new AppError(
//         httpStatus.UNAUTHORIZED,
//         'You are not authorized for this role',
//       );
//     }

//     // ✅ Attach user info to request
//     req.user = { id, role }; // only assign required info
//     next();
//   });
// };

// export default auth;

// const auth = (...userRoles: string[]) => {
//   return catchAsync(async (req, res, next) => {
//     const token = req?.headers?.authorization?.split(' ')[1];

//     if (!token) {
//       throw new AppError(httpStatus.UNAUTHORIZED, 'you are not authorized!');
//     }

//     let decode;
//     try {
//       decode = jwt.verify(
//         token,
//         config.jwt_access_secret as string,
//       ) as JwtPayload;
//       console.log('Token Decode:', decode);
//     } catch (err) {
//       throw new AppError(httpStatus.UNAUTHORIZED, 'unauthorized');
//     }

//     const id = decode.id || decode.userId;
//     const role = decode.role;

//     console.log('JWT Decode:', decode);
//     const isUserExist = await User.IsUserExistbyId(id);
//     if (!isUserExist) {
//       throw new AppError(httpStatus.NOT_FOUND, 'user not found');
//     }

//     if (userRoles && !userRoles.includes(role)) {
//       throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized');
//     }

//     req.user = { id, role };
//     next();
//   });
// };
// export default auth;
// import { Request, Response, NextFunction } from 'express';
// import jwt, { JwtPayload } from 'jsonwebtoken';
// import httpStatus from 'http-status';
// import config from '../config';
// import AppError from '../error/AppError';
// import catchAsync from '../utils/catchAsync';
// import User from '../modules/user/user.model';

// const auth = (...userRoles: string[]) => {
//   return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
//     const token = req?.headers?.authorization?.split(' ')[1];

//     if (!token) {
//       throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
//     }

//     let decode: JwtPayload;
//     try {
//       decode = jwt.verify(
//         token,
//         config.jwt_access_secret as string,
//       ) as JwtPayload;
//     } catch (err) {
//       throw new AppError(httpStatus.UNAUTHORIZED, 'Unauthorized');
//     }

//     const id = decode.id || decode.userId;
//     const role = decode.role;

//     const isUserExist = await User.IsUserExistbyId(id);
//     if (!isUserExist) {
//       throw new AppError(httpStatus.NOT_FOUND, 'User not found');
//     }

//     if (userRoles.length && !userRoles.includes(role)) {
//       throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized');
//     }

//     req.user = { userId: id, role }; // ✅ Use userId to match controller
//     next();
//   });
// };

// export default auth;

// import { Request, Response, NextFunction } from 'express';
// import jwt, { JwtPayload } from 'jsonwebtoken';
// import httpStatus from 'http-status';
// import config from '../config';
// import AppError from '../error/AppError';
// import catchAsync from '../utils/catchAsync';
// import User from '../modules/user/user.model';
// import { Admin } from '../modules/Dashboard/admin/admin.model'; // অ্যাডমিন মডেল ইমপোর্ট

// const auth = (...userRoles: string[]) => {
//   return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
//     const token = req?.headers?.authorization?.split(' ')[1];

//     if (!token) {
//       throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
//     }

//     let decode: JwtPayload;
//     try {
//       decode = jwt.verify(
//         token,
//         config.jwt_access_secret as string,
//       ) as JwtPayload;
//     } catch (err) {
//       throw new AppError(httpStatus.UNAUTHORIZED, 'Unauthorized');
//     }

//     const id = decode.id || decode.userId;
//     const role = decode.role;

//     let isExist = null;
//     if (role === 'admin' || role === 'super_admin') {
//       isExist = await Admin.findById(id).select('+password');
//     } else {
//       isExist = await User.IsUserExistbyId(id);
//     }

//     if (!isExist) {
//       throw new AppError(httpStatus.NOT_FOUND, `${role} not found`);
//     }

//     if (userRoles.length && !userRoles.includes(role)) {
//       throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized');
//     }

//     req.user = { id, role };
//     next();
//   });
// };

// export default auth;
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import httpStatus from 'http-status';
import config from '../config';
import AppError from '../error/AppError';
import catchAsync from '../utils/catchAsync';
import User from '../modules/user/user.model';
import { Admin } from '../modules/Dashboard/admin/admin.model';

const auth = (...userRoles: string[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(
        token,
        config.jwt_access_secret as string,
      ) as JwtPayload;
    } catch (err) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'Unauthorized');
    }

    const id = decoded.id || decoded.userId;
    const role = decoded.role;

    let isExist = null;
    if (role === 'admin' || role === 'super_admin') {
      isExist = await Admin.findById(id).select('+password');
    } else {
      isExist = await User.IsUserExistbyId(id);
    }

    if (!isExist) {
      throw new AppError(httpStatus.NOT_FOUND, `${role} not found`);
    }

    if (userRoles.length && !userRoles.includes(role)) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized');
    }

    // ✅ Attach full user data (id + email)
    // req.user = {
    //   _id: isExist._id,
    //   email: isExist.email,
    //   role: isExist.role,
    // };

    req.user = {
      id: isExist._id,
      userId: isExist._id,
      _id: isExist._id, // 👈 Keeps backward compatibility
      email: isExist.email,
      role: isExist.role,
    };
    next();
  });
};

export default auth;
