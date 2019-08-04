import { startOfHour, parseISO, isBefore, format } from 'date-fns';
import pt from 'date-fns/locale';

import User from '../models/User';
import Appointment from '../models/Appointment';

import Notification from '../schemas/Notification';
import ErrorHelper from '../helpers/ErrorHelper';

class CreateAppointmentService {
  async run({ provider_id, user_id, date }) {
    if (provider_id === user_id) {
      throw new ErrorHelper(400, 'User and provider can not be the same');
    }

    const isProvider = await User.findOne({
      where: { id: provider_id, provider: true },
    });

    if (!isProvider) {
      throw new ErrorHelper(
        400,
        'You can only create appointments with providers'
      );
    }

    const hourStart = startOfHour(parseISO(date));

    if (isBefore(hourStart, new Date())) {
      throw new ErrorHelper(400, 'Past dates are not permitted');
    }

    const checkAvailability = await Appointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart,
      },
    });

    if (checkAvailability) {
      throw new ErrorHelper(400, 'Appointment date is not available');
    }

    const appointment = await Appointment.create({
      user_id,
      provider_id,
      date,
    });

    const { name } = await User.findByPk(user_id);
    const formattedDate = format(
      hourStart,
      "'dia' dd 'de' MMMM', as' H:mm'h'",
      { locale: pt }
    );

    await Notification.create({
      content: `Novo agendamento de ${name} para ${formattedDate}`,
      user: provider_id,
    });

    return appointment;
  }
}

export default new CreateAppointmentService();
