import jwtPkg from 'jsonwebtoken'; // used to create, sign, and verify tokens
import bcrypt from 'bcryptjs';

const { verify, sign } = jwtPkg;
const secret = 'WeJapaProject';

export default function verifyToken(req, res, next) {
  // check header or url parameters or post parameters for token
  const token = req.headers['x-access-token'];
  if (!token) { return res.status(403).json({ status: res.statusCode, error: 'No token provided.' }); }

  // verifies secret and checks exp
  verify(token, secret, (err, decoded) => {
    if (err) { return res.status(500).json({ status: res.statusCode, error: 'Failed to authenticate token.' }); }

    // if everything is good, save to request for use in other routes
    req.userId = decoded.id;
    console.log(decoded.id);
    next();
  });
}

export function checkPassword(submittedPass, hashedPass) {
  return bcrypt.compareSync(submittedPass, hashedPass);
}

export function hashPassword(submittedPass) {
  return bcrypt.hashSync(submittedPass);
}

export function signToken(userId) {
  const token = sign({ id: userId }, secret, {
    expiresIn: 86400, // expires in 24 hours
  });
  return token;
}
