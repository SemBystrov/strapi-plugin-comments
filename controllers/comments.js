'use strict';

/**
 * comments.js controller
 *
 * @description: A set of functions called "actions" of the `comments` plugin.
 */

 const parseParams = params => Object.keys(params).reduce((prev, curr) => {
   const value = params[curr];
   const parsedValue = isNaN(parseInt(params[curr], 10)) ? value : parseInt(params[curr], 10);
   return {
    ...prev,
    [curr]: parsedValue,
  };
 }, {});

const throwError = (ctx, e) => ctx.throw(e.status, e.getData ? e.getData() : e.message);

module.exports = {

  /**
   * Default action.
   *
   * @return {Object}
   */


  findAll: async (ctx) => {
    const { params = {} } = ctx;
    const { page } = parseParams(params);
    return await strapi.plugins.comments.services.comments.findAll(ctx.query, page)
  },

  findAllFlat: async (ctx) => {
    const { params = {} } = ctx;
    const { relation } = parseParams(params);
    try {
      return await strapi.plugins.comments.services.comments.findAllFlat(relation);
    }
    catch (e) {
      throwError(ctx, e);
    }
  },

  findAllInHierarchy: async (ctx) => {
    const { params = {} } = ctx;
    const { relation } = parseParams(params);
    try {
      return await strapi.plugins.comments.services.comments.findAllInHierarchy(relation, null, true);
    }
    catch (e) {
      throwError(ctx, e);
    }
  },

  post: async (ctx) => {
    const user = ctx.state.user
    const { params = {} } = ctx;
    const { relation } = parseParams(params);
    const { body = {} }  = ctx.request;

    const workspace = body.workspace
    console.log(workspace)
    delete body.workspace

    try {
      const entity = await strapi.plugins.comments.services.comments.create({
        authorUser: user.id,
        ...body
      }, relation);

      if (entity) {
        strapi.io.to(workspace).emit('new_comment', entity)

        return entity;
      }
    }
    catch (e) {
      throwError(ctx, e);
    }
  },

  put: async (ctx) => {
    const { request, params = {} } = ctx;
    const { body = {} }  = request;
    const { relation, commentId } = parseParams(params);

    const workspace = body.workspace
    delete body.workspace

    try {
      const entity = await strapi.plugins.comments.services.comments.update(commentId, relation, body);
      strapi.io.to(workspace).emit('update_comment', entity)
    }
    catch (e) {
      throwError(ctx, e);
    }
  },

  pointsUp: async (ctx) => {
    const { request, params = {} } = ctx;
    const { body = {} }  = request;
    const { relation, commentId } = parseParams(params);

    const workspace = body.workspace
    delete body.workspace

    try {
      const entity = await strapi.plugins.comments.services.comments.pointsUp(commentId, relation);
      strapi.io.to(workspace).emit('like_comment', entity)
      return entity
    }
    catch (e) {
      throwError(ctx, e);
    }
  },
  
  reportAbuse: async (ctx) => {
    const { request, params = {} } = ctx;
    const { body = {} }  = request;
    const { relation, commentId } = parseParams(params);
    try {
      return await strapi.plugins.comments.services.comments.reportAbuse(commentId, relation, body);
    }
    catch (e) {
      throwError(ctx, e);
    }
  }, 

  //
  // Moderation
  //

  findOne: async (ctx) => {
    const { params = {} } = ctx;
    const { id } = parseParams(params);
    try {
      return await strapi.plugins.comments.services.comments.findOneAndThread(id);
    }
    catch (e) {
      throwError(ctx, e);
    }
  },

  blockComment: async (ctx) => {
    const { params = {} } = ctx;
    const { id } = parseParams(params);
    try {
      return await strapi.plugins.comments.services.comments.blockComment(id);
    }
    catch (e) {
      throwError(ctx, e);
    }
  },

  blockCommentThread: async (ctx) => {
    const { params = {} } = ctx;
    const { id } = parseParams(params);
    try {
      return await strapi.plugins.comments.services.comments.blockCommentThread(id);
    }
    catch (e) {
      throwError(ctx, e);
    }
  },
  
  resolveAbuseReport: async (ctx) => {
    const { params = {} } = ctx;
    const { id, commentId } = parseParams(params);
    try {
      return await strapi.plugins.comments.services.comments.resolveAbuseReport(id, commentId);
    }
    catch (e) {
      throwError(ctx, e);
    }
  }, 
};
