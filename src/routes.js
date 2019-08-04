import { Router } from 'express';
import multer from 'multer';
import Brute from 'express-brute';
import BruteRedis from 'express-brute-redis';
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import authMiddleware from './app/middlewares/auth';
import multerConfig from './config/multer';
import FileController from './app/controllers/FileController';
import ProviderController from './app/controllers/ProviderController';
import AppointmentController from './app/controllers/AppointmentController';
import ScheduleController from './app/controllers/ScheduleController';
import NotificationController from './app/controllers/NotificationController';
import AvailableController from './app/controllers/AvailableController';

import validadeUserStore from './app/validators/UserStore';
import validadeUserUpdate from './app/validators/UserUpdate';
import validadeSessionStore from './app/validators/SessionStore';
import validadeAppointmentStore from './app/validators/AppointmentStore';

const routes = new Router();
const upload = multer(multerConfig);

const bruteStore = new BruteRedis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});

const bruteForce = new Brute(bruteStore);

routes.post('/users', validadeUserStore, UserController.store);
routes.post(
  '/sessions',
  bruteForce.prevent,
  validadeSessionStore,
  SessionController.store
);

routes.use(authMiddleware);

routes.put('/users', validadeUserUpdate, UserController.update);
routes.post('/files', upload.single('file'), FileController.store);

routes.get('/providers', ProviderController.index);
routes.get('/providers/:providerId/available', AvailableController.index);

routes.post(
  '/appointments',
  validadeAppointmentStore,
  AppointmentController.store
);

routes.delete('/appointments/:id', AppointmentController.delete);
routes.get('/appointments', AppointmentController.index);

routes.get('/schedule', ScheduleController.index);

routes.get('/notifications', NotificationController.index);
routes.put('/notifications/:id', NotificationController.update);

export default routes;
