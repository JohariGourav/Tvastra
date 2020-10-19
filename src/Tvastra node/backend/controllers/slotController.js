const User = require("../models/user-model");
const slotModel = require("../models/slot-model");
const Schedule = require("../models/slot-model").schedule;
const Slot = require("../models/slot-model").slot;
const validate7days = require("../util/userUtil").validate7days;
const createNextXDays = require("../util/userUtil").createNextXDays;

// show create/Edit schedule page to Doctor on dashboard
function showSchedule (req, res) {
    Schedule.find({
        doctor: res.locals.currentUser._id
    },{}, {
        sort: {date: 1}
    }).
	populate('slots').
	sort({date: -1}).
    exec( (err, schedules) => {
        // console.log("err: ", err);
        // console.log("schedule: ", schedules);
        if (err) {
            console.log("show shcedule queryErr: ", err);
            req.flash("error", "Server Error!");
            return res.redirect("back");
        } else if (!schedules) {
            console.log("not schedule queryErr: ", schedules);
            req.flash("error", "Server Error!");
            return res.redirect("back");
        } else {
            let schedules1 = [];
            let schedule1 = {};
            schedules1.push(schedule1);
            schedules.forEach( schedule => {
            //     let options = {month: 'long'};
            //     let formatter = new Intl.DateTimeFormat('default', options);
                // console.log("sche date: ",schedule);
                // console.log("sche date: ",schedule.dayEndTime);
                
            });
            let dates = createNextXDays(7);
            // console.log("final dates: ", dates);
            res.render("schedule", {schedules: schedules, dates: dates});
        }
        
    });
}

async function generateSlots(req, res) {
	// slots = [
	// 	{
	// 		date: new Date("09-09-2020"),
	// 		startTime: new Date(2020, 8, 9, 10),
	// 		endTime: new Date(2020, 8, 9, 10, 30),
	// 		interval: 30,
	// 		hospital: 'Apollo',
	// 		doctor: {
	// 			id: res.locals.currentUser._id,
	// 			username: res.locals.currentUser.username
	// 		}
	// 	},
	// 	{
	// 		date: new Date("09-09-2020"),
	// 		startTime: new Date(2020, 8, 09, 11),
	// 		endTime: new Date(2020, 8, 09, 11, 30),
	// 		interval: 30,
	// 		hospital: 'Apollo',
	// 		doctor: {
	// 			id: res.locals.currentUser._id,
	// 			username: res.locals.currentUser.username
	// 		}
	// 	},
	// ];
	// 
	// const session = await Slot.startSession();
	// var returnedSlots, newSchedule;
	// let transactionResult = await session.withTransaction(async _ => {
	// 	try {
	// 		returnedSlots = await Slot.insertMany(slots, { session: session });
	// 		newSchedule = await Schedule.create([{
	// 			date: new Date(2020, 8, 12, 0, 0, 0, 0),
	// 			day: 'Sat',
	// 			dayStartTime: new Date(2020, 8, 09, 9),
	// 			dayEndTime: new Date(2020, 8, 09, 18),
	// 			doctor: res.locals.currentUser._id,
	// 			slots: returnedSlots
	// 		}], {
	// 			session: session
	// 		});
	// 	} catch (error) {
	// 		console.log("session withTransaction Error: ", error);
	// 		session.abortTransaction();
	// 	}
	// 	return Promise.all([returnedSlots, newSchedule]);
	// });
	// session.endSession();
	// res.send({
	// 	returnedSlots: returnedSlots,
	// 	newSchedule: newSchedule
	// });
	// // console.log("jsno: ", JSON.stringify({
	// // 	returnedSlots: returnedSlots,
	// // 	newSchedule: newSchedule
	// // }));
	// console.log("-------jsno:------ ", {
	// 	returnedSlots: returnedSlots,
	// 	newSchedule: newSchedule
	// });
	// // console.log("-------Transaction:------ ", transactionResult);
}

// Receives create schedule request from doctor and  schedule and slots from dashboard
async function slotGenerator(req, res) {
	console.log("body: ", req.body);

	// fields entry check
	if (!(req.body.days.length > 0 && req.body.hospital.length > 0
		&& req.body['day-start-time'].length == 5 && req.body['day-end-time'].length == 5
		&& req.body.interval.length > 0)) {

		req.flash("error", "Please fill all required fields");
		return res.redirect("back");
	}

	let dayStartArr = req.body['day-start-time'].split(':');
	let dayEndArr = req.body['day-end-time'].split(':');
	let dayStartTotalMinutes = (parseInt(dayStartArr[0]) * 60) + parseInt(dayStartArr[1]);
	let dayEndTotalMinutes = (parseInt(dayEndArr[0]) * 60) + parseInt(dayEndArr[1]);
	let interval = parseInt(req.body.interval);
	let days = [];

	// Time and Interval conditions check
	if (interval < 10) {
		console.log("interval: ", interval);
		req.flash("error", "Interval must be minimum 10 minutes");
		return res.redirect("back");
	}
	else if (!(dayStartTotalMinutes > 0 && dayStartTotalMinutes < (23 * 60 + 50)
		&& dayEndTotalMinutes > 10 && dayEndTotalMinutes < (23 * 60 + 60))) {

		console.log(dayStartTotalMinutes, dayEndTotalMinutes);
		req.flash("error", "Invalid Day Start or Day End time!");
		return res.redirect("back");
	}
	else if (!(dayEndTotalMinutes >= dayStartTotalMinutes + interval)) {
		console.log(dayStartTotalMinutes, dayEndTotalMinutes, interval);
		req.flash("error", "Day End should be greater than Day Start + Interval");
		return res.redirect("back");
	}

	req.body.days.forEach(date => {
		days.push(parseInt(date));
	});
	console.log("days: ", days);
	if (!validate7days(days)) {
		req.flash("error", "Days must be within a week from today!");
		return res.redirect("back");
	}
	else if (! await checkScheduleExists(days, res.locals.currentUser._id || '5f3ab729f84cd91e487a27cc')) {
		req.flash("error", "Schedule already exists for 1 or more selected days.");
		return res.redirect("back");
	}

	let totalSlots = (dayEndTotalMinutes - dayStartTotalMinutes) / interval;
	console.log("date: ", new Date(parseInt(req.body.days[0])));
	console.log("slots: ", parseInt(totalSlots));

	let flag = false;
	for (let i = 0; i < days.length; i++) {
		let slotStartMinutes = dayStartTotalMinutes
		let slotEnd = slotStartMinutes + interval;
		let slots = [], slot = {};
		while (slotEnd <= dayEndTotalMinutes) {

			// format slot start Time
			let startTimeHour = parseInt(slotStartMinutes / 60);
			console.log("startTimeHour: ", startTimeHour);
			startTimeHour = startTimeHour / 10 >= 1 ? startTimeHour : '0' + startTimeHour;
			console.log("startTimeHour: ", startTimeHour / 10 >= 1);
			let startTimeMinutes = parseInt(slotStartMinutes % 60);
			startTimeMinutes = startTimeMinutes / 10 >= 1 ? startTimeMinutes : '0' + startTimeMinutes;

			// format slot end Time
			let endTimeHour = parseInt((slotStartMinutes + interval) / 60);
			endTimeHour = endTimeHour / 10 >= 1 ? endTimeHour : '0' + endTimeHour;
			let endTimeMinutes = parseInt((slotStartMinutes + interval) % 60);
			endTimeMinutes = endTimeMinutes / 10 >= 1 ? endTimeMinutes : '0' + endTimeMinutes;

			// slot Object create
			slot.date = days[i];
			slot.startTime = startTimeHour + ':' + startTimeMinutes;
			slot.endTime = endTimeHour + ':' + endTimeMinutes;
			slot.interval = interval;
			slot.hospital = req.body.hospital;
			slot.doctor = {
				id: res.locals.currentUser._id || '5f3ab729f84cd91e487a27cc',
				username: res.locals.currentUser.username || 'abcd'
			};

			slots.push(slot);
			slot = {};
			slotStartMinutes = slotEnd;
			slotEnd = slotStartMinutes + interval;
			// console.log("slot start: ", slotStartMinutes);
			// console.log("slot end: ", slotEnd);
		}
		let options = { weekday: 'short' };
		let schedule = {
			date: days[i],
			day: (new Intl.DateTimeFormat('default', options)).format(days[i]),
			dayStartTime: req.body['day-start-time'],
			dayEndTime: req.body['day-end-time'],
			doctor: res.locals.currentUser._id || '5f3ab729f84cd91e487a27cc',
		};
		console.log("slots: ", slots);
		console.log("schecule: ", schedule);
		flag = await createSlotsAndSchedule(slots, schedule);
	}
	console.log("flag: ", flag);
	flag ? req.flash("success", "Schedule(s) created.") : req.flash("error", "Schedule(s) creation failed!");

	res.redirect("/schedule");
}

async function removeSchedule (req, res) {
	console.log("id body: ", req.body);

	let deletedSchedule, deletedSlots;

	const session = await Slot.startSession();
	let transactionResult = await session.withTransaction(async _ => { 
		try {
			deletedSchedule = await Schedule.findOneAndDelete({
				_id: req.body.id
			},{ session: session });

			deletedSlots = await Slot.deleteMany({
				_id: { $in: deletedSchedule.slots }
			},{ session: session });	

		} catch (error) {
			console.log("schedule delete Error: ", error);
			req.flash("error", "Delete request failed");
			session.abortTransaction();
			return res.status(500).send(false);
		}
		return Promise.all([deletedSchedule, deletedSlots]);
	});
	session.endSession();

	console.log("deletedSchedule: ", deletedSchedule);	
	console.log("deleted slots: ", deletedSlots.deletedCount);	

	if(deletedSchedule && deletedSlots.deletedCount > 0)
		req.flash("success", "Schedule Removed");
	else
		req.flash("success", "No Schedule/Slots present at this date");
	return res.send(true);
}

// Changes the status of Slot for doctor
async function changeSlotStatus (req, res) {
	console.log("id body: ", req.body);
		try {
			let slot = await Slot.findById({
				_id: req.body.id
			});
			console.log("slot retrieved: ", slot);
			if(slot && slot.status == 'Available') {
				slot.status = 'Busy';
				slot.save();
			}
			else if(slot && slot.status == 'Busy') {
				slot.status = 'Available';
				slot.save();
			}
			console.log("slot final: ", slot);
			return res.send({status: slot.status});

		} catch (error) {
			console.log("slot update Error: ", error);
			// req.flash("error", "Delete request failed");
			return res.status(500).send(false);
		}
}

// Create 1 Schedule and Slots in DB 
async function createSlotsAndSchedule(slots, schedule) {
	const session = await Slot.startSession();
	var returnedSlots, newSchedule, queryFlag = true;
	let transactionResult = await session.withTransaction(async _ => {
		try {
			returnedSlots = await Slot.insertMany(slots, { session: session });
			newSchedule = await Schedule.create([{
				date: schedule.date,
				day: schedule.day,
				dayStartTime: schedule.dayStartTime,
				dayEndTime: schedule.dayEndTime,
				doctor: schedule.doctor,
				slots: returnedSlots
			}], {
				session: session
			});
		} catch (error) {
			console.log("session withTransaction Error: ", error);
			queryFlag = false;
			session.abortTransaction();
		}
		return Promise.all([returnedSlots, newSchedule]);
	});
	session.endSession();
	console.log("-------jsno:------ ", {
		returnedSlots: returnedSlots,
		newSchedule: newSchedule
	});
	return queryFlag;
	// console.log("-------Transaction:------ ", transactionResult);
}

// Checks if the new schedule to be created already exists or not
async function checkScheduleExists(days, _id) {
	try {
		let result = await Schedule.find({
			$and: [
				{ doctor: _id },
				{ date: { $in: days } },
			]
		});
		console.log("check scheduleExist result: ", result);
		if (result && result.length > 0) {
			return false;
		}
		else
			return true;
	} catch (error) {
		console.log("check scheduleExist queryErr: ", error);
		return false;
	}
}

module.exports = {
	showSchedule: showSchedule,
	slotGenerator: slotGenerator,
	removeSchedule: removeSchedule,
	changeSlotStatus: changeSlotStatus
}

//   let db = mongoose.connection;
//   console.log("db: ", db);
// (await db.startSession()).startTransaction();