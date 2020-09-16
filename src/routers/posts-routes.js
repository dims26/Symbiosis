/* eslint-disable no-underscore-dangle */
/* eslint-disable import/extensions */
import mongoPkg from 'mongodb';
import collPromise, { urlRegex } from '../models/post.js';
import verifyToken from '../middleware/auth.js';
import baseRouter from './base-routes.js';

const { ObjectId } = mongoPkg;
const router = baseRouter();

function addNewPost(expressRouter, collection) {
  expressRouter.post('/', verifyToken, (req, res) => {
    const isGif = (typeof req.body.gifLink === 'string' && req.body.gifLink.match(urlRegex));
    const isArticle = (typeof req.body.article === 'string' && req.body.article.length > 0);
    const postType = isGif ? 'gif' : 'article';
    const insert = {
      owner_id: ObjectId(req.userId),
      date_time: new Date(),
      tags: [...new Set(req.body.tags)],
      type: postType,
    };
    if (isGif) insert.gif_link = req.body.gifLink;
    else if (isArticle) insert.body = req.body.article;
    else {
      return res.status(400).json({
        status: res.statusCode,
        error: 'Invalid request',
      });
    }
    return collection.insertOne(insert, (err, insertResult) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          status: res.statusCode,
          error: `There was a problem posting ${postType}.`,
        });
      }
      return res.status(200).json({
        status: res.statusCode,
        message: `${postType} posted successfully`,
        data: {
          id: insertResult.insertedId,
        },
      });
    });
  });
}

function editArticlePost(expressRouter, collection) {
  expressRouter.put('/:id', verifyToken, (req, res) => {
    collection.findOne({ _id: ObjectId(req.params.id) }, (err, post) => {
      if (err) {
        return res.status(500).json({
          status: res.statusCode,
          error: 'Server Error',
        });
      }
      if (!post) {
        return res.status(404).json({
          status: res.statusCode,
          error: 'Post not found',
        });
      }
      if (post.owner_id.toString() !== req.userId) {
        return res.status(403).json({
          status: res.statusCode,
          error: 'Unauthorized operation',
        });
      }
      if (typeof req.body.article !== 'string') {
        return res.status(400).json({
          status: res.statusCode,
          error: 'Invalid request body',
        });
      }
      return collection.updateOne({ _id: ObjectId(req.params.id) },
        {
          $set: {
            body: req.body.article,
          },
        // eslint-disable-next-line no-unused-vars
        }, (updateErr, result) => {
          if (updateErr) {
            return res.status(500).json({
              status: res.statusCode,
              error: 'Server error',
            });
          }
          return res.status(200).json({
            status: res.statusCode,
            message: 'Article updated successfully',
            data: {
              id: req.params.id,
            },
          });
        });
    });
  });
}

function deletePost(expressRouter, collection) {
  expressRouter.delete('/:id', verifyToken, (req, res) => {
    collection.deleteOne({ _id: ObjectId(req.params.id) }, (error, result) => {
      if (error) {
        return res.status(500).json({
          status: res.statusCode,
          error: 'Server error',
        });
      }
      if (result.result.n === 0) {
        return res.status(404).json({
          status: res.statusCode,
          error: 'Post not found',
        });
      }
      return res.status(200).json({
        status: res.statusCode,
        message: 'Post deleted succesfully',
        data: {
          count: result.deletedCount,
        },
      });
    });
  });
}

function getPosts(expressRouter, collection) {
  expressRouter.get('/', verifyToken, (req, res) => {
    const pageSize = 10;
    let page = (parseInt(req.query.from, 10) || 1);
    if (page < 1) page = 1;
    collection.find({}, {
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
      const result = users.slice(0, pageSize).map((post) => ({
        id: post._id,
        authorId: post.owner_id,
        timestamp: new Date(post.date_time).getTime(),
        content: {
          article: post.body,
          gifLink: post.gif_link,
        },
        comments: post.comment_ids,
        tags: post.tags,
        post_type: post.type,
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

function getSpecificPost(expressRouter, collection) {
  expressRouter.get('/:id', verifyToken, (req, res) => {
    collection.findOne({ _id: ObjectId(req.params.id) }, (err, post) => {
      if (err) {
        return res.status(500).json({
          status: res.statusCode,
          error: 'Server Error',
        });
      }
      if (!post) {
        return res.status(404).json({
          status: res.statusCode,
          error: 'Post not found',
        });
      }
      const result = {
        id: post._id,
        authorId: post.owner_id,
        timestamp: new Date(post.date_time).getTime(),
        content: {
          article: post.body,
          gifLink: post.gif_link,
        },
        comments: post.comment_ids,
        tags: post.tags,
        post_type: post.type,
      };
      console.log(post);
      return res.status(200).json({
        status: res.statusCode,
        message: 'Request successful',
        data: result,
      });
    });
  });
}

function markInappropriatePost(expressRouter, collection) {
  expressRouter.post('/:id/inappropriate', verifyToken, (req, res) => {
    collection.updateOne({ _id: ObjectId(req.params.id) },
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
  const postCollection = await collPromise();

  addNewPost(router, postCollection);
  editArticlePost(router, postCollection);
  deletePost(router, postCollection);
  getPosts(router, postCollection);
  getSpecificPost(router, postCollection);
  markInappropriatePost(router, postCollection);

  return router;
}
