// Generates a 10-digit unique ticket number

const ticketGenerator = (): number => {
    // Get current timestamp (milliseconds since epoch)
    const timestamp = Date.now().toString().slice(-6); // Last 6 digits of the timestamp
    // Generate a random number and append to the timestamp (we use only the last 4 digits of random number to keep it unique)
    const randomDigits = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return Number(`${timestamp}${randomDigits}`);
};

const flightIdGenerator = () => {
    const timestamp = Date.now().toString().slice(-4); // Last 6 digits of the timestamp
    return Number(`${timestamp}`);
}

// Generate a simple unique ID
const generateBagId = () => Math.floor(100000 + Math.random() * 900000);


export {ticketGenerator, flightIdGenerator, generateBagId};


