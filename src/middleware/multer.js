/* eslint-disable import/extensions */
import multer from 'multer';
import path from 'path';
import DataUriParser from 'datauri/parser.js';

const storage = multer.memoryStorage();
const multerUploads = multer({ storage }).single('gif');
const uriParser = new DataUriParser();

/**
* @description This function converts the buffer to data url
* @param {Object} req containing the field object
* @returns {String} The data url from the string buffer
*/
export const dataUri = (req) => uriParser
  .format(path.extname(req.file.originalname).toString(), req.file.buffer);

export default multerUploads;
