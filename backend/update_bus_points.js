const mysql = require('mysql2/promise');

const pickupPoints = [
  {"time": "20:45", "name": "AJARA Bus stand"},
  {"time": "20:50", "name": "Sulegaon"},
  {"time": "20:55", "name": "Madilage Bus Stop"},
  {"time": "20:56", "name": "Bhadvan Phata Bus Stop"},
  {"time": "21:00", "name": "Koulage Karmbali"},
  {"time": "21:01", "name": "Atuyal Bus Stop"},
  {"time": "21:05", "name": "Gijawane Bus Stand Opp"},
  {"time": "21:15", "name": "Gadhinglaj Warana Bazar"},
  {"time": "21:45", "name": "Sankeshwar Rukhmini Hospital"},
  {"time": "22:15", "name": "Nipani Bus Stand"},
  {"time": "22:45", "name": "Koganoli Toll Naka"},
  {"time": "22:50", "name": "Kagal Bus Stand"},
  {"time": "23:00", "name": "Gokul Shirgaon"},
  {"time": "23:45", "name": "Kolhapur Panchshil Hotel Near Bus Stand"},
  {"time": "23:50", "name": "Kolhapur Tawde Hotel"}
];

const dropPoints = [
  {"time": "04:15", "name": "Katraj Kinara Hotel"},
  {"time": "04:20", "name": "Padmavati Swami Vivekanand Statue"},
  {"time": "04:30", "name": "Swargate"},
  {"time": "04:40", "name": "Deccan corner"},
  {"time": "04:45", "name": "Kothrud CNG Gas Pump Opp Police Station"},
  {"time": "04:50", "name": "Bhusari Colony"},
  {"time": "05:00", "name": "Pashan Sus Road - Audi Showroom (IND)"},
  {"time": "05:05", "name": "Baner Phata"},
  {"time": "05:10", "name": "Wakad - Bhujbal Chowk"},
  {"time": "05:15", "name": "Jagtap Dairy"},
  {"time": "05:20", "name": "Dange Chowk"},
  {"time": "05:25", "name": "Chinchwad Aditya Birla Hospital"},
  {"time": "05:30", "name": "Nigdi Below Pavle Bridge Surbhi Travels"},
  {"time": "05:40", "name": "Nigdi Thermax Chowk CNG Gas Pump"}
];

async function updateBus() {
    try {
        const db = await mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "",
            database: "busbooking"
        });

        const [result] = await db.query(
            "UPDATE buses SET pickup_points = ?, drop_points = ? WHERE id = 1",
            [JSON.stringify(pickupPoints), JSON.stringify(dropPoints)]
        );

        console.log("Successfully updated bus 1 with new pickup and drop points.", result.info);
        await db.end();
    } catch (e) {
        console.error(e);
    }
}

updateBus();
