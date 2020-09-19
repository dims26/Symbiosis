/* eslint-disable no-underscore-dangle */
/* eslint-disable import/extensions */
import mongoPkg from 'mongodb';
import postRouter from './posts-routes.js';
import collPromise from '../models/comment.js';
import verifyToken from '../middleware/auth.js';

const { ObjectId } = mongoPkg;
let router;

(async () => {
  router = await postRouter();
})();

function addComment(expressRouter, collection) {
  expressRouter.post('/:postId/comments', verifyToken, (req, res) => {
    const isValidComment = (typeof req.body.comment === 'string' && req.body.comment.length > 0);
    if (!isValidComment) {
      return res.status(400).json({
        status: res.statusCode,
        error: 'Invalid comment payload',
      });
    }
    return collection.insertOne({
      post_id: ObjectId(req.params.postId),
      owner_id: ObjectId(req.userId),
      date_time: new Date(),
      body: req.body.comment,
    }, (err, insertResult) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          status: res.statusCode,
          error: 'There was a problem posting comment.',
        });
      }
      return res.status(200).json({
        status: res.statusCode,
        message: 'Comment posted successfully',
        data: {
          id: insertResult.insertedId,
        },
      });
    });
  });
}

function getComments(expressRouter, collection) {
  expressRouter.get('/:postId/comments', verifyToken, (req, res) => {
    const pageSize = 10;
    let page = (parseInt(req.query.from, 10) || 1);
    if (page < 1) page = 1;
    collection.find({
      post_id: ObjectId(req.params.postId),
    }, {
      limit: pageSize + 1,
      skip: (page - 1) * pageSize,
    }).toArray((err, users) => {
      if (err) {
        return res.status(500).json({
          status: res.statusCode,
          error: 'There was a problem getting the information from the database',
        });
      }
      const hasNext = users.length > pageSize;
      const result = users.slice(0, pageSize).map((comment) => ({
        id: comment._id,
        authorId: comment.owner_id,
        postId: comment.post_id,
        timestamp: new Date(comment.date_time).getTime(),
        body: comment.body,
      }));
      return res.status(200).json({
        status: res.statusCode,
        message: 'Request successful',
        data: {
          result,
          hasNext,
        },
      });
    });
  });
}

function markInappropriateComment(expressRouter, collection) {
  expressRouter.post('/:postId/comments/:commentId/inappropriate', verifyToken, (req, res) => {
    collection.updateOne({ _id: ObjectId(req.params.commentId) },
      {
        $addToSet: {
          inappropriate_by: req.userId,
        },
      }, (updateErr, result) => {
        if (updateErr) {
          return res.status(500).json({
            status: res.statusCode,
            error: 'Server error',
          });
        }
        if (result.matchedCount < 1) {
          return res.status(404).json({
            status: res.statusCode,
            error: 'Post not found',
          });
        }
        return res.status(200).json({
          status: res.statusCode,
          message: (result.modifiedCount > 0) ? 'Marked as inappropriate' : 'Already marked previously',
          data: {
            id: req.params.id,
          },
        });
      });
  });
}

export default async function getRouter() {
  const commentCollection = await collPromise();

  addComment(router, commentCollection);
  getComments(router, commentCollection);
  markInappropriateComment(router, commentCollection);

  return router;
}
