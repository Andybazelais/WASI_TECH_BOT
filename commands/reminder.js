const { cmd } = require('../lib');
const schedule = require('node-schedule');

// Create a map to store user-specific reminders
const userReminders = new Map();

// Command for setting reminders
cmd({
    pattern: "setreminder",
    desc: 'Set a reminder for a task or event.',
    category: 'utility',
}, async (Void, citel, match) => {
    const reminderText = match[1].trim(); // Get the reminder text from the matched pattern.
    const timeInput = match[2].trim(); // Get the time input.

    // Schedule the reminder using node-schedule
    const job = schedule.scheduleJob(timeInput, () => {
        // When the scheduled time arrives, send the reminder message
        citel.reply(`Reminder: "${reminderText}"`);
    });

    // Store the reminder job for later use (e.g., for canceling)
    const userId = citel.sender;
    if (!userReminders.has(userId)) {
        userReminders.set(userId, []);
    }
    userReminders.get(userId).push(job);


    await citel.reply(`Reminder set: "${reminderText}" at ${timeInput}`);
});

// Command for canceling reminders
cmd({
    pattern: "cancelreminder",
    desc: "Cancel your scheduled reminders.",
    category: "utility",
}, async (Void, citel) => {
    const userId = citel.sender;

    if (userReminders.has(userId)) {
        const userJobs = userReminders.get(userId);
        userJobs.forEach((job) => {
            job.cancel(); // Cancel the scheduled reminder
        });
        userReminders.delete(userId); // Remove the user's reminders
        await citel.reply("All your scheduled reminders have been canceled.");
    } else {
        await citel.reply("You don't have any scheduled reminders.");
    }
});
