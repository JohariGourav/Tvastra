const User = require("../models/user-model");
const Schedule = require("../models/slot-model").schedule;
const Slot = require("../models/slot-model").slot;


async function generateSlots (req, res) {
    slots = [
        {
          date: new Date("09-09-2020"),
          startTime: new Date(2020, 8, 9, 10),
          endTime: new Date(2020, 8, 9, 10, 30),
          interval: 30,
          hospital: 'Apollo',
          doctor: {
            id: res.locals.currentUser._id,
            username: res.locals.currentUser.username
          }
        },
        {
          date: new Date("09-09-2020"),
          startTime: new Date(2020, 8, 09, 11),
          endTime: new Date(2020, 8, 09, 11, 30),
          interval: 30,
          hospital: 'Apollo',
          doctor: {
            id: res.locals.currentUser._id,
            username: res.locals.currentUser.username
          }
        },
      ];
    //   let db = mongoose.connection;
    //   console.log("db: ", db);
      // (await db.startSession()).startTransaction();
      const session = await Slot.startSession();
      var returnedSlots, newSchedule;
      await session.withTransaction(async _ => {
        returnedSlots = await Slot.insertMany(slots, {session: session});
        newSchedule = await Schedule.create([{
          date: new Date("09-09-2020"),
          day: 'Sat',
          dayStartTime: new Date(2020, 8, 09, 9),
          dayEndTime: new Date(2020, 8, 09, 18),
          doctor: res.locals.currentUser._id,
          slots: [returnedSlots[0], returnedSlots[1]]
        }], { 
          session: session
        });
        return newSchedule;
      });
      session.endSession();
      res.send({
        returnedSlots: returnedSlots,
        newSchedule: newSchedule
      });
      console.log("jsno: ",JSON.stringify({
        returnedSlots: returnedSlots,
        newSchedule: newSchedule
      }));
      console.log("-------jsno:------ ",{
        returnedSlots: returnedSlots,
        newSchedule: newSchedule
      });
}

module.exports = {
    generateSlots: generateSlots
}