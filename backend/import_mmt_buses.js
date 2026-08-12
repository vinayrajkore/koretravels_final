const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const sourceDir = "C:/Users/Vinayraj Kore/Downloads/mmt_photos";
const textFile = path.join(sourceDir, "mmt_buses (1).txt");
const uploadsDir = path.join(__dirname, "uploads");

// Ensure uploads dir exists
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Database Connection
const dbConfig = {
    host: "localhost",
    user: "root",
    password: "",
    database: "busbooking"
};

function determineLayout(typeStr) {
    typeStr = typeStr.toUpperCase();
    if (typeStr.includes('2+1') && typeStr.includes('SLEEPER') && typeStr.includes('A/C')) {
        if (typeStr.includes('SEATER')) return 'A/C Seater / Sleeper (2+1)';
        return '2+1 AC Sleeper';
    }
    if (typeStr.includes('2+1') && typeStr.includes('SLEEPER') && typeStr.includes('NON A/C')) {
        return 'Non A/C Seater / Sleeper (2+1)';
    }
    if (typeStr.includes('2+1') && typeStr.includes('SEMI-SLEEPER')) {
        return 'Semi-Sleeper (2+1)';
    }
    if (typeStr.includes('2+2') && typeStr.includes('NON A/C')) {
        return 'NON A/C Seater (2+2)';
    }
    if (typeStr.includes('2+2')) return '2+2 Seater';
    if (typeStr.includes('2+1')) return '2+1 Seater';
    if (typeStr.includes('SLEEPER')) return 'Full Sleeper';
    return '2+2 Seater';
}

function determineType(typeStr) {
    typeStr = typeStr.toUpperCase();
    if (typeStr.includes('NON A/C')) return 'Non-AC';
    if (typeStr.includes('A/C') || typeStr.includes('AC')) return 'AC';
    return 'Non-AC'; // default
}

async function run() {
    console.log("Starting Migration...");
    
    // 1. Parse Text
    const content = fs.readFileSync(textFile, 'utf8');
    const blocks = content.split('================================================================');
    
    const parsedBuses = [];
    
    let currentBus = null;
    
    for (let block of blocks) {
        block = block.trim();
        if (!block) continue;
        
        if (block.startsWith('Bus ')) {
            // Bus 1: Anand Bus Pune
            currentBus = {
                name: block.split(':')[1].trim()
            };
        } else if (block.startsWith('Type:')) {
            // Info block
            const lines = block.split('\n');
            let mode = null;
            
            for (let line of lines) {
                line = line.trim();
                if (!line) continue;
                
                if (line.startsWith('Type:')) currentBus.typeRaw = line.substring(5).trim();
                else if (line.startsWith('Depart:')) {
                    const parts = line.substring(7).trim().split(' ');
                    currentBus.depart = parts[0]; 
                }
                else if (line.startsWith('Arrive:')) {
                    const parts = line.substring(7).trim().split(' ');
                    currentBus.arrive = parts[0];
                }
                else if (line.startsWith('Duration:')) currentBus.duration = line.substring(9).trim();
                else if (line.startsWith('Price:')) currentBus.price = line.substring(6).trim().replace(/[^0-9.]/g, '');
                else if (line.startsWith('Rating:')) {
                    const ratingStr = line.substring(7).trim().split(' ')[0];
                    currentBus.rating = isNaN(parseFloat(ratingStr)) ? 0.0 : parseFloat(ratingStr);
                }
                else if (line.startsWith('Pickup points:')) { mode = 'pickup'; currentBus.pickupPoints = []; }
                else if (line.startsWith('Drop points:')) { mode = 'drop'; currentBus.dropPoints = []; }
                else if (line.startsWith('- [')) {
                    // - [20:45] AJARA Bus stand
                    const timeMatch = line.match(/\[(.*?)\] (.*)/);
                    if (timeMatch) {
                        const pt = { time: timeMatch[1], name: timeMatch[2] };
                        if (mode === 'pickup') currentBus.pickupPoints.push(pt);
                        else if (mode === 'drop') currentBus.dropPoints.push(pt);
                    }
                }
            }
            parsedBuses.push(currentBus);
        }
    }
    
    console.log(`Parsed ${parsedBuses.length} buses from text file.`);

    const connection = await mysql.createConnection(dbConfig);
    
    let busCounter = 100; // For unique IDs (MMT-101, etc.)
    
    // To match directories, let's read the source dir
    const allDirs = fs.readdirSync(sourceDir, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => d.name);

    for (let bus of parsedBuses) {
        busCounter++;
        const busNumber = `MMT-${busCounter}`;
        
        // Find matching directory by name approximation (ignoring spaces/special chars)
        const sanitize = str => String(str).toLowerCase().replace(/[^a-z0-9]/g, '');
        const targetSanitized = sanitize(bus.name);
        
        let matchedDir = null;
        for (const dir of allDirs) {
            if (sanitize(dir) === targetSanitized) {
                matchedDir = dir;
                break;
            }
        }
        
        let copiedPhotos = [];
        if (matchedDir) {
            const dirPath = path.join(sourceDir, matchedDir);
            const files = fs.readdirSync(dirPath);
            for (let i=0; i<files.length; i++) {
                const file = files[i];
                if (file.match(/\.(jpg|jpeg|png)$/i)) {
                    const ext = path.extname(file);
                    const newName = `${busNumber}_photo_${i+1}${ext}`;
                    fs.copyFileSync(path.join(dirPath, file), path.join(uploadsDir, newName));
                    copiedPhotos.push(newName);
                }
            }
        } else {
            console.warn(`Warning: Could not find image folder for bus "${bus.name}"`);
        }
        
        // Defaults requested by user
        const fromCity = 'Kolhapur';
        const toCity = 'Pune';
        const travelDate = '2026-08-27';
        const amenities = 'WiFi,Water Bottle,Charging Point';
        const totalSeats = 40;
        
        const seatLayout = determineLayout(bus.typeRaw);
        const finalType = determineType(bus.typeRaw);
        const finalPrice = bus.price || 500;
        
        console.log(`Inserting: ${bus.name} | Layout: ${seatLayout} | Photos: ${copiedPhotos.length}`);
        
        const sql = `
            INSERT INTO buses (
                bus_name, bus_number, from_city, to_city,
                pickup_points, drop_points, depart, arrive, duration,
                travel_date, total_seats, seats_left, price, type, rating,
                photos, seat_layout, amenities
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        await connection.execute(sql, [
            bus.name, busNumber, fromCity, toCity,
            JSON.stringify(bus.pickupPoints || []), JSON.stringify(bus.dropPoints || []),
            bus.depart || '00:00', bus.arrive || '00:00', bus.duration || '00h 00m',
            travelDate, totalSeats, totalSeats, finalPrice, finalType, bus.rating || 0,
            JSON.stringify(copiedPhotos), seatLayout, amenities
        ]);
    }
    
    await connection.end();
    console.log("Migration Complete!");
}

run().catch(err => {
    console.error("Migration Failed:", err);
});
