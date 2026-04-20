// Supabase keys
const SUPABASE_URL = 'https://miifjguqweghtbixabkr.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1paWZqZ3Vxd2VnaHRiaXhhYmtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3MDI4MzUsImV4cCI6MjA5MjI3ODgzNX0.k5dhmqpBXUhaGBDSRxFi7H50Kthyoo0mjgiRnzhQsCw'

// Level data
const LEVELS = {
    1: { name: 'Stereo Madness', stars: 3, length: 1000, speed: 5, required: 0, color: '#ff3f34' },
    2: { name: 'Back On Track', stars: 3, length: 1100, speed: 5.5, required: 3, color: '#ffa502' },
    3: { name: 'Polargeist', stars: 4, length: 1200, speed: 6, required: 6, color: '#0fbcf9' },
    4: { name: 'Dry Out', stars: 4, length: 1300, speed: 6.5, required: 10, color: '#05c46b' },
    5: { name: 'Electrodynamix', stars: 5, length: 1400, speed: 7, required: 14, color: '#ff3838' }
};

// Game settings
const GRAVITY = 0.6;
const JUMP_POWER = -10;
