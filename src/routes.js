import { Router } from 'express';
import User from './app/models/User';

const routes = new Router();

routes.get('/', async (req, res) => {
  const user = await User.create({
    name: 'Rogerio Pavan',
    email: 'rogerio_pavan@hotmail.com',
    password_hash: '1212121211121',
  });

  return res.json(user);
});

export default routes;
