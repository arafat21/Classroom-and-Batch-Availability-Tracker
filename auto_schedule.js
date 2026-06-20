require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true
};

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

async function run() {
  const db = await mysql.createConnection(dbConfig);

  const startDate = new Date('2026-06-21'); // base week start
  const weeks = 4; // how many weeks to generate

  // ===== YOUR WEEK TEMPLATE (exact structure of your schedule) =====
  const template = [
    { offset: 0, course: 'ICT-1107', room: 4, slot: 2 },
    { offset: 0, course: 'ICT-2209', room: 1, slot: 2 },
    { offset: 0, course: 'ICT-3207', room: 3, slot: 2 },
    { offset: 0, course: 'ICT-2103', room: 2, slot: 3 },
    { offset: 0, course: 'ICT-3201', room: 3, slot: 3 },
    { offset: 0, course: 'ICT-1106', room: 1, slot: 4 },

    { offset: 1, course: 'ICT-2109', room: 2, slot: 2 },
    { offset: 1, course: 'ICT-3203', room: 3, slot: 2 },
    { offset: 1, course: 'ICT-1103', room: 5, slot: 3 },
    { offset: 1, course: 'ICT-2107', room: 2, slot: 3 },
    { offset: 1, course: 'ICT-2201', room: 1, slot: 3 },
    { offset: 1, course: 'ICT-3209', room: 3, slot: 3 },
    { offset: 1, course: 'ICT-2105', room: 2, slot: 4 },
    { offset: 1, course: 'ICT-2205', room: 1, slot: 4 },
    { offset: 1, course: 'ICT-3205', room: 3, slot: 4 },

    { offset: 2, course: 'ICT-1101', room: 2, slot: 2 },
    { offset: 2, course: 'ICT-1103', room: 2, slot: 2 },
    { offset: 2, course: 'ICT-2101', room: 1, slot: 2 },
    { offset: 2, course: 'ICT-2201', room: 1, slot: 2 },
    { offset: 2, course: 'ICT-1107', room: 4, slot: 3 },
    { offset: 2, course: 'ICT-2105', room: 1, slot: 3 },
    { offset: 2, course: 'ICT-2203', room: 3, slot: 3 },
    { offset: 2, course: 'ICT-3201', room: 2, slot: 3 },
    { offset: 2, course: 'ICT-1105', room: 4, slot: 4 },
    { offset: 2, course: 'ICT-3202', room: 2, slot: 4 },

    { offset: 3, course: 'ICT-1101', room: 2, slot: 2 },
    { offset: 3, course: 'ICT-2203', room: 1, slot: 2 },
    { offset: 3, course: 'ICT-3209', room: 3, slot: 2 },
    { offset: 3, course: 'ICT-2107', room: 2, slot: 3 },
    { offset: 3, course: 'ICT-3203', room: 3, slot: 3 },
    { offset: 3, course: 'ICT-1109', room: 4, slot: 4 },
    { offset: 3, course: 'ICT-2104', room: 4, slot: 4 },
    { offset: 3, course: 'ICT-2204', room: 4, slot: 4 },
    { offset: 3, course: 'ICT-3204', room: 3, slot: 4 },
    { offset: 3, course: 'ICT-1106', room: 1, slot: 1 },

    { offset: 4, course: 'ICT-2101', room: 3, slot: 2 },
    { offset: 4, course: 'ICT-2103', room: 3, slot: 3 },
    { offset: 4, course: 'ICT-2106', room: 3, slot: 4 },
    { offset: 4, course: 'ICT-2206', room: 1, slot: 4 },
    { offset: 4, course: 'ICT-3207', room: 3, slot: 4 }
  ];

  const getCourseId = async (code) => {
    const [rows] = await db.query(
      'SELECT course_id FROM courses WHERE course_code = ?',
      [code]
    );
    return rows[0]?.course_id;
  };

  const inserts = [];

  for (let w = 0; w < weeks; w++) {
    for (const item of template) {
      const date = addDays(startDate, w * 7 + item.offset);
      const courseId = await getCourseId(item.course);

      if (!courseId) continue;

      inserts.push([
        courseId,
        item.room,
        item.slot,
        date,
        'scheduled',
        'class'
      ]);
    }
  }

  const sql = `
    INSERT INTO schedules
    (course_id, classroom_id, timeslot_id, schedule_date, status, schedule_type)
    VALUES ?
  `;

  await db.query(sql, [inserts]);

  console.log(`Inserted ${inserts.length} schedule rows`);
  await db.end();
}

run().catch(console.error);