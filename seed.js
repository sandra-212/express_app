const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const User = require('./models/user');
const Profile = require('./models/profile');
const Project = require('./models/project');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/express-devdb';

async function seedDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected for seeding');

    // Clear old data
    await User.deleteMany();
    await Profile.deleteMany();
    await Project.deleteMany();
    
    const users = JSON.parse(await fs.promises.readFile(path.join(__dirname, 'seed-data/users.json')));
    const profiles = JSON.parse(await fs.promises.readFile(path.join(__dirname, 'seed-data/profiles.json')));
    const projects = JSON.parse(await fs.promises.readFile(path.join(__dirname, 'seed-data/projects.json')));

    const hashedUsers = await Promise.all(
      users.map(async (user) => {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        return user;
      })
    );

    const createdUsers = await User.insertMany(hashedUsers);
    console.log(`Inserted ${createdUsers.length} users`);

    const createdProfiles = await Profile.insertMany(profiles);
    console.log(`Inserted ${createdProfiles.length} profiles`);

    const createdProjects = await Project.insertMany(projects);
    console.log(`Inserted ${createdProjects.length} projects`);

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
}

seedDatabase();