import { isBefore, subHours } from 'date-fns';

import Appointment from '../models/Appointment';
import User from '../models/User';

import ErrorHelper from '../helpers/ErrorHelper';
import CancellationEmail from '../jobs/CancellationMail';
import Queue from '../../lib/Queue';

class CancelAppointmentService {
  async run({ appointment_id, user_id }) {
    const appointment = await Appointment.findByPk(appointment_id, {
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['name', 'email'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['name'],
        },
      ],
    });

    if (!appointment) {
      throw new ErrorHelper(400, 'Appointment does not exist');
    }

    if (appointment.user_id !== user_id) {
      throw new ErrorHelper(
        401,
        "You don't have permission to cancel this appointment"
      );
    }

    const dateWithSub = subHours(appointment.date, 2);

    if (isBefore(dateWithSub, new Date())) {
      throw new ErrorHelper(
        401,
        'You can only cancel appointments 2 hours in advance'
      );
    }

    appointment.canceled_at = new Date();
    await appointment.save();

    await Queue.add(CancellationEmail.key, {
      appointment,
    });

    return appointment;
  }
}

export default new CancelAppointmentService();
