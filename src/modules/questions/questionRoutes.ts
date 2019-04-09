import { Server } from 'typesafe-hapi';
import {
  GetQuestionsRequestSchema,
  GetQuestionsResponseSchema,
  CreateQuestionRequestSchema,
  CreateQuestionResponseSchema,
} from './questionSchemas';
import { Question } from '../../models/Question';
import { QUESTION_STATUS } from '../../models-consts';

export const questionsRoutes = {
  async init(server: Server) {
    await server.route({
      method: 'GET',
      path: '/questions',
      options: {
        tags: ['api', 'questions'],
        validate: GetQuestionsRequestSchema,
        description: 'Returns questions',
        response: {
          schema: GetQuestionsResponseSchema,
        },
      },
      async handler(request) {
        const { category, level } = request.query;

        const questions = await Question.findAll({
          where: {
            ...(category && { _categoryId: category }),
            ...(level && { _levelId: level }),
            // ...(status && { _statusId: status }),
            _statusId: QUESTION_STATUS.ACCEPTED,
          },
        });

        return questions.map(q => {
          return {
            id: q.id,
            question: q.question,
            _categoryId: q._categoryId,
            _levelId: q._levelId,
            _statusId: q._statusId,
            acceptedAt: q.acceptedAt,
          };
        });
      },
    });

    await server.route({
      method: 'POST',
      path: '/questions',
      options: {
        tags: ['api', 'questions'],
        validate: CreateQuestionRequestSchema,
        description: 'Creates a question',
        notes: `When user is not an admin, it won't publish the question`,
        response: {
          schema: CreateQuestionResponseSchema,
        },
      },
      async handler(request) {
        const { question, level, category } = request.payload;

        const newQuestion = await Question.create({
          question,
          _levelId: level,
          _categoryId: category,
          _statusId: QUESTION_STATUS.PENDING,
        });

        return {
          id: newQuestion.id,
          question: newQuestion.question,
          _categoryId: newQuestion._categoryId,
          _levelId: newQuestion._levelId,
          _statusId: newQuestion._statusId,
          acceptedAt: newQuestion.acceptedAt,
        };
      },
    });
  },
};