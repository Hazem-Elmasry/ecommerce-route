import { customAlphabet } from "nanoid";
import { asyncHandler } from "../../../utils/errorHandling.js";
import { compare, hash } from "../../../utils/hashAndCompare.js";
import {
  generateToken,
  verifyToken,
} from "../../../utils/generateAndVerifyToken.js";
import sendEmail from "../../../utils/email.js";
import userModel from "../../../../DB/model/User.model.js";

//* === signUp ===:-
//1- Receive data
//2- check if email exist? => (stop)
//                         => continue
//3- create token and refresh token and links
//4- send email to verify
//5- hash password
//6- create user
export const signUp = asyncHandler(async (req, res, next) => {
  //1- Receive data:
  const { email } = req.body;

  //2- check if email exist:
  if (await userModel.findOne({ email })) {
    return next(new Error("Email already exists", { cause: 409 }));
  }

  //  3- create token and refresh token and links:
  const token = generateToken({
    payload: { email },
    signature: process.env.SIGNUP_SIGNATURE,
    expiresIn: 60 * 30,
  });
  const rf_token = generateToken({
    payload: { email },
    signature: process.env.SIGNUP_SIGNATURE,
    expiresIn: 60 * 60 * 24 * 30,
  });
  const link = `${req.protocol}://${req.headers.host}/auth/confirmEmail/${token}`;
  const rf_link = `${req.protocol}://${req.headers.host}/auth/refreshToken/${rf_token}`;

  //   4- send email to verify:
  const html = `
  <a href='${link}'>Confirm Eamil</a>
  <br/><br/>
  <a href='${rf_link}'>Refresh Link</a>
  `;
  if (!sendEmail({ to: email, subject: "confirm email", html })) {
    return next(new Error("invalid email", { cause: 404 }));
  }

  //5- hash password:
  req.body.password = hash({ plainText: req.body.password });

  //6- create user
  const newUser = await userModel.create(req.body);
  return res
    .status(201)
    .json({ message: "user created successfully", user: newUser._id });
});

//* === confirm Email ===:-
// 1- get token from params.
// 2- verify token => if !payload.email => redirect to signUp
//                 => if payload.email => email exists => continue
// 3- check if user's email exist => if not => redirect to signUp
//                         => if exists => continue
// 4- if user's isConfirmed true => redirect to login
//                        => continue
// 5- update user's isConfirmed to true. => continue
// 6- redirect to login
export const confirmEmail = asyncHandler(async (req, res, next) => {
  // 1- get token from params.
  const { token } = req.params;
  // 2- verify token:
  const { email } = verifyToken({
    token,
    signature: process.env.SIGNUP_SIGNATURE,
  });
  if (!email) {
    return res.redirect("https://www.filgoal.com/"); // redirect to signUp
  }
  // 3- check if email exist:
  const user = await userModel.findOne({ email });
  if (!user) {
    return res.redirect("https://www.filgoal.com/"); // redirect to signUp
  }
  // 4- if user's isConfirmed true:
  if (user.isConfirmed) {
    return res.redirect("https://www.facebook.com/"); // redirect to login
  }
  // 5- update user's isConfirmed to true
  await userModel.updateOne({ email }, { isConfirmed: true });
  // 6- redirect to login
  return res.redirect("https://www.facebook.com/"); // redirect to login
});

//* === refresh Token ===:-
// 1- get token from params
// 2- verify token
// 3- check if email exist
// 4- check if isConfirmed is true => redirect to login
//                                => continue
// 5- create newToken and newLink to confirmEmail
// 6- send email => redirect to html page 'check email'
export const refreshToken = asyncHandler(async (req, res, next) => {
  // 1- get token from params
  const { token } = req.params;
  // 2- verify token
  const { email } = verifyToken({
    token,
    signature: process.env.SIGNUP_SIGNATURE,
  });
  if (!email) {
    return res.redirect("https://www.filgoal.com/"); // redirect to signUp
  }
  // 3- check if email exist
  const user = await userModel.findOne({ email });
  if (!user) {
    return res.redirect("https://www.filgoal.com/"); // redirect to signUp
  }
  // 4- check if isConfirmed is true
  if (user.isConfirmed) {
    return res.redirect("https://www.facebook.com/"); // redirect to login
  }
  // 5- create token and newLink to confirmEmail
  const newToken = generateToken({
    payload: { email },
    signature: process.env.SIGNUP_SIGNATURE,
    expiresIn: 60 * 10,
  });
  const link = `${req.protocol}://${req.headers.host}/auth/confirmEmail/${newToken}`;
  // 6- send email
  const html = `
  <a href='${link}'>confirm Email</a>
  `;
  if (!sendEmail({ to: email, subject: "confirm email", html })) {
    return next(new Error("invalid email", { cause: 404 }));
  }
  return res.status(200).send("<h1>check email</h1>");
});

//* ==== login ===:-
// 1- recive email and pass.
// 2- check if email exist.
// 3- check if email isConfirmed.
// 4- compare pass.
// 5- generate token and refresh token.
// 6- update status of user and also soft Delete if exist.
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const emailExist = await userModel.findOne({ email });
  if (!emailExist) {
    return next(new Error("Email or password is not valid", { code: 400 }));
  }
  if (!emailExist.isConfirmed) {
    return next(new Error("plz confirm email first", { code: 400 }));
  }
  if (!compare({ plainText: password, hashValue: emailExist.password })) {
    return next(new Error("Email or password is not valid", { code: 400 }));
  }
  const token = generateToken({
    payload: { email, id: emailExist._id },
    signature: process.env.TOKEN_SIGNATURE,
    expiresIn: 60 * 30,
  });

  const rf_token = generateToken({
    payload: { email, id: emailExist._id },
    signature: process.env.TOKEN_SIGNATURE,
    expiresIn: 60 * 60 * 24 * 30,
  });

  await userModel.updateOne({ email }, { status: "Online" });
  return res.status(200).json({ message: "done", token, rf_token });
});

//* ==== send Code for forget password ===:-
// 1- recieve Email
// 2- if Email exist => continue
// 3- if confirmEmail true
// 4- create code (unique) with nanoId
// 5- send code with sendEmail to this user email
// 6- update user with new code
// 7- responce check your email
export const sendCode = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const emailExist = await userModel.findOne({ email });
  if (!emailExist) {
    return next(new Error("Email is not exist", { code: 404 }));
  }
  if (!emailExist.isConfirmed) {
    return next(new Error("plz confirm email", { code: 400 }));
  }
  const nanoId = customAlphabet("012345689", 5);
  const code = nanoId();
  if (
    !sendEmail({
      to: email,
      subject: "Reset Password",
      html: `<p>use this code to reset your password <br><br>.${code}</p>`,
    })
  ) {
    return next(new Error("fail to send email", { cause: 400 }));
  }
  await userModel.updateOne({ email }, { code });
  return res.status(200).json({ message: "check your email" });
});

//* ==== forget password ===:-
// 1- recieve email
// 2- check email exist
// 3- check code
// 4- password ==> hash ==>
// 5- update user with password,code=null, status=offline to get out from other pages
export const forgetPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.params;
  const { code, password } = req.body;
  const user = await userModel.findOne({ email });
  if (!user) {
    return next(new Error("user is not exist", { code: 404 }));
  }
  if (code != user.code) {
    return next(new Error("invalid code ", { code: 404 }));
  }
  const hashPassword = hash({ plainText: password });
  await userModel.updateOne(
    { email },
    { password: hashPassword, code: null, status: "Offline" }
  );
  return res.status(200).json({ message: "done" });
});
