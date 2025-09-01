// birthdayNotifier.js
import cron from 'node-cron';
import User from './models/userModel.js';
import { sendBirthdayEmail } from './utils/mailer.js'; // you'd define this

cron.schedule('0 8 * * *', async () => {
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  const users = await User.find();

  const birthdayUsers = users.filter(user => {
    if (!user.dateOfBirth) return false;
    const dob = new Date(user.dateOfBirth);
    return dob.getMonth() + 1 === month && dob.getDate() === day;
  });

  for (const user of birthdayUsers) {
    await sendBirthdayEmail(user.email, user.firstName);
  }

  console.log(`🎉 Birthday alerts sent to ${birthdayUsers.length} users`);
});
