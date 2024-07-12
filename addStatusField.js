require('dotenv').config();
const mongoose = require('mongoose');
const Vacancy = require('./models/vacancy'); // Подключение модели Vacancy

const MONGODB_URI = process.env.MONGODB_URI;

// Определение статусов с состоянием true/false
const statusOptions = [
  'Preparation',
  'ReadyToApply',
  'Applied',
  'TestTask',
  'Interview',
  'AwaitingResponse',
  'Offered',
  'Signed',
  'Trash',
  'Rejected'
];

const initialStatus = statusOptions.reduce((acc, status) => {
  acc[status] = false;
  return acc;
}, {});

initialStatus['Preparation'] = true;

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected...');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err.message);
    process.exit(1);
  }
}

async function addStatusField() {
  await connectDB();

  try {
    const vacancies = await Vacancy.find({});

    for (const vacancy of vacancies) {
      console.log(`Updating vacancy: ${vacancy._id}`);
      vacancy.status = { ...initialStatus };
      await vacancy.save();
      console.log(`Vacancy ${vacancy._id} updated: added status field.`);
    }

    console.log('All vacancies updated with the new status field.');
  } catch (error) {
    console.error('Error updating vacancies:', error);
  } finally {
    mongoose.connection.close();
  }
}

addStatusField();
