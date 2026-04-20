// Level Data
const LEVELS = {
    1: {
        id: 1,
        name: 'Stereo Madness',
        difficulty: 'Easy',
        stars: 3,
        coins: 3,
        song: 'Stereo Madness',
        length: 800,
        requiredStars: 0,
        obstacles: [
            { x: 200, type: 'spike', y: 500 },
            { x: 400, type: 'spike', y: 500 },
            { x: 550, type: 'block', y: 460, width: 40, height: 40 },
            { x: 700, type: 'spike', y: 500 },
            { x: 850, type: 'double', y: 500, width: 60 },
            { x: 1000, type: 'spike', y: 500 },
            { x: 1150, type: 'block', y: 460, width: 40, height: 40 },
            { x: 1300, type: 'spike', y: 500 }
        ]
    },
    2: {
        id: 2,
        name: 'Back On Track',
        difficulty: 'Easy',
        stars: 3,
        coins: 3,
        song: 'Back On Track',
        length: 900,
        requiredStars: 3,
        obstacles: [
            { x: 150, type: 'spike', y: 500 },
            { x: 300, type: 'block', y: 460, width: 40, height: 40 },
            { x: 450, type: 'spike', y: 500 },
            { x: 600, type: 'double', y: 500, width: 60 },
            { x: 750, type: 'spike', y: 500 },
            { x: 900, type: 'block', y: 460, width: 40, height: 40 },
            { x: 1050, type: 'spike', y: 500 },
            { x: 1200, type: 'double', y: 500, width: 60 }
        ]
    },
    3: {
        id: 3,
        name: 'Polargeist',
        difficulty: 'Normal',
        stars: 4,
        coins: 3,
        song: 'Polargeist',
        length: 1000,
        requiredStars: 6,
        obstacles: [
            { x: 100, type: 'spike', y: 500 },
            { x: 250, type: 'spike', y: 500 },
            { x: 400, type: 'block', y: 460, width: 40, height: 40 },
            { x: 500, type: 'double', y: 500, width: 60 },
            { x: 650, type: 'spike', y: 500 },
            { x: 800, type: 'spike', y: 500 },
            { x: 950, type: 'block', y: 460, width: 40, height: 40 },
            { x: 1100, type: 'double', y: 500, width: 60 },
            { x: 1250, type: 'spike', y: 500 }
        ]
    },
    4: {
        id: 4,
        name: 'Dry Out',
        difficulty: 'Normal',
        stars: 4,
        coins: 3,
        song: 'Dry Out',
        length: 1100,
        requiredStars: 10,
        obstacles: [
            { x: 120, type: 'spike', y: 500 },
            { x: 280, type: 'double', y: 500, width: 60 },
            { x: 420, type: 'spike', y: 500 },
            { x: 560, type: 'block', y: 460, width: 40, height: 40 },
            { x: 700, type: 'spike', y: 500 },
            { x: 840, type: 'double', y: 500, width: 60 },
            { x: 980, type: 'spike', y: 500 },
            { x: 1120, type: 'block', y: 460, width: 40, height: 40 }
        ]
    },
    5: {
        id: 5,
        name: 'Electrodynamix',
        difficulty: 'Hard',
        stars: 5,
        coins: 3,
        song: 'Electrodynamix',
        length: 1200,
        requiredStars: 14,
        obstacles: [
            { x: 80, type: 'spike', y: 500 },
            { x: 200, type: 'spike', y: 500 },
            { x: 320, type: 'double', y: 500, width: 60 },
            { x: 440, type: 'spike', y: 500 },
            { x: 560, type: 'block', y: 460, width: 40, height: 40 },
            { x: 680, type: 'double', y: 500, width: 60 },
            { x: 800, type: 'spike', y: 500 },
            { x: 920, type: 'spike', y: 500 },
            { x: 1040, type: 'block', y: 460, width: 40, height: 40 },
            { x: 1160, type: 'double', y: 500, width: 60 },
            { x: 1280, type: 'spike', y: 500 }
        ]
    }
};
