-- Seed data for Classroom Tracker (optional)

-- USE classroom_tracker;

-- INSERT IGNORE INTO users (email, password_hash, role)
-- VALUES 
-- ('admin@example.com', '$2b$10$cK1.nejc4V0tyTWt4NNSo.7X.pD33yRlytAqGThA0l2CCUx4iYqdG', 'admin'),
-- ('prof.wilson@university.com', '$2b$10$cK1.nejc4V0tyTWt4NNSo.7X.pD33yRlytAqGThA0l2CCUx4iYqdG', 'teacher'),
-- ('john@university.com', '$2b$10$cK1.nejc4V0tyTWt4NNSo.7X.pD33yRlytAqGThA0l2CCUx4iYqdG', 'student')
--  ;

-- INSERT IGNORE INTO semesters (semester_no) VALUES ('2026-1');
-- -- Example semester and batch
-- INSERT IGNORE INTO batches (batch_name, semester_id)
-- SELECT 'Batch A', semester_id FROM semesters WHERE semester_no = '2026-1' LIMIT 1;

-- -- Insert Classrooms (only room_number field exists in schema)
-- INSERT IGNORE INTO classrooms (room_number) VALUES
-- ('R401'),
-- ('R402'),
-- ('B203'),
-- ('C105'),
-- ('A312'),
-- ('N108'),
-- ('G404'),
-- ('D210');
 

 USE classroom_tracker;

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE schedules;
TRUNCATE TABLE courses;
TRUNCATE TABLE students;
TRUNCATE TABLE teachers;
TRUNCATE TABLE classrooms;
TRUNCATE TABLE batches;
TRUNCATE TABLE semesters;
TRUNCATE TABLE users;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- SEMESTERS
-- =====================================================

INSERT INTO semesters (semester_no) VALUES
('1-1'),
('1-2'),
('2-1'),
('2-2'),
('3-1'),
('3-2'),
('4-1'),
('4-2');

-- =====================================================
-- BATCHES
-- (required by current schema)
-- =====================================================

INSERT INTO batches (batch_name, semester_id) VALUES
('50',1),
('51',2),
('52',3),
('53',4),
('54',5);

-- =====================================================
-- USERS
-- =====================================================

INSERT INTO users (email,password_hash,role) VALUES

('admin@juniv.edu',
'$2b$10$cK1.nejc4V0tyTWt4NNSo.7X.pD33yRlytAqGThA0l2CCUx4iYqdG',
'admin'),

('patwary@juniv.edu',
'$2b$10$cK1.nejc4V0tyTWt4NNSo.7X.pD33yRlytAqGThA0l2CCUx4iYqdG',
'teacher'),

('mesbah@juniv.edu',
'$2b$10$cK1.nejc4V0tyTWt4NNSo.7X.pD33yRlytAqGThA0l2CCUx4iYqdG',
'teacher'),

('shamim@juniv.edu',
'$2b$10$cK1.nejc4V0tyTWt4NNSo.7X.pD33yRlytAqGThA0l2CCUx4iYqdG',
'teacher'),

('yousuf@juniv.edu',
'$2b$10$cK1.nejc4V0tyTWt4NNSo.7X.pD33yRlytAqGThA0l2CCUx4iYqdG',
'teacher'),

('risala@juniv.edu',
'$2b$10$cK1.nejc4V0tyTWt4NNSo.7X.pD33yRlytAqGThA0l2CCUx4iYqdG',
'teacher');

-- =====================================================
-- TEACHERS
-- =====================================================

INSERT INTO teachers (user_id,teacher_name,department)
SELECT user_id,'Md. Fazlul Karim Patwary','IIT'
FROM users
WHERE email='patwary@juniv.edu';

INSERT INTO teachers (user_id,teacher_name,department)
SELECT user_id,'M. Mesbahuddin Sarker','IIT'
FROM users
WHERE email='mesbah@juniv.edu';

INSERT INTO teachers (user_id,teacher_name,department)
SELECT user_id,'M. Shamim Kaiser','IIT'
FROM users
WHERE email='shamim@juniv.edu';

INSERT INTO teachers (user_id,teacher_name,department)
SELECT user_id,'Mohammad Abu Yousuf','IIT'
FROM users
WHERE email='yousuf@juniv.edu';

INSERT INTO teachers (user_id,teacher_name,department)
SELECT user_id,'Risala Tasin Khan','IIT'
FROM users
WHERE email='risala@juniv.edu';

-- =====================================================
-- STUDENT USERS
-- =====================================================

INSERT INTO users (email,password_hash,role) VALUES

('50_001@juniv.edu','$2b$10$cK1.nejc4V0tyTWt4NNSo.7X.pD33yRlytAqGThA0l2CCUx4iYqdG','student'),
('50_002@juniv.edu','$2b$10$cK1.nejc4V0tyTWt4NNSo.7X.pD33yRlytAqGThA0l2CCUx4iYqdG','student'),
('50_003@juniv.edu','$2b$10$cK1.nejc4V0tyTWt4NNSo.7X.pD33yRlytAqGThA0l2CCUx4iYqdG','student'),

('51_001@juniv.edu','$2b$10$cK1.nejc4V0tyTWt4NNSo.7X.pD33yRlytAqGThA0l2CCUx4iYqdG','student'),
('51_002@juniv.edu','$2b$10$cK1.nejc4V0tyTWt4NNSo.7X.pD33yRlytAqGThA0l2CCUx4iYqdG','student'),

('52_001@juniv.edu','$2b$10$cK1.nejc4V0tyTWt4NNSo.7X.pD33yRlytAqGThA0l2CCUx4iYqdG','student'),
('53_001@juniv.edu','$2b$10$cK1.nejc4V0tyTWt4NNSo.7X.pD33yRlytAqGThA0l2CCUx4iYqdG','student'),
('54_001@juniv.edu','$2b$10$cK1.nejc4V0tyTWt4NNSo.7X.pD33yRlytAqGThA0l2CCUx4iYqdG','student');

-- =====================================================
-- STUDENTS
-- =====================================================

INSERT INTO students (user_id,batch_id,student_name,roll_no)
SELECT user_id,1,'Tanvir Hasan','50-001'
FROM users WHERE email='50_001@juniv.edu';

INSERT INTO students (user_id,batch_id,student_name,roll_no)
SELECT user_id,1,'Mahmudul Islam','50-002'
FROM users WHERE email='50_002@juniv.edu';

INSERT INTO students (user_id,batch_id,student_name,roll_no)
SELECT user_id,1,'Siam Ahmed','50-003'
FROM users WHERE email='50_003@juniv.edu';

INSERT INTO students (user_id,batch_id,student_name,roll_no)
SELECT user_id,2,'Nafis Rahman','51-001'
FROM users WHERE email='51_001@juniv.edu';

INSERT INTO students (user_id,batch_id,student_name,roll_no)
SELECT user_id,2,'Fahim Hossain','51-002'
FROM users WHERE email='51_002@juniv.edu';

INSERT INTO students (user_id,batch_id,student_name,roll_no)
SELECT user_id,3,'Rakib Hossain','52-001'
FROM users WHERE email='52_001@juniv.edu';

INSERT INTO students (user_id,batch_id,student_name,roll_no)
SELECT user_id,4,'Shadman Islam','53-001'
FROM users WHERE email='53_001@juniv.edu';

INSERT INTO students (user_id,batch_id,student_name,roll_no)
SELECT user_id,5,'Muntasir Ahmed','54-001'
FROM users WHERE email='54_001@juniv.edu';

-- =====================================================
-- CLASSROOMS
-- =====================================================

INSERT INTO classrooms (room_number) VALUES
('Lab-1'),
('Lab-2'),
('Lab-3'),
('Lab-4'),
('Lab-D');

-- =====================================================
-- COURSES
-- =====================================================

INSERT INTO courses
(course_code,course_title,semester_id,teacher_id)
VALUES

('ICT-1101','Introduction to ICT',1,1),
('ICT-1102','Programming Fundamentals',1,2),

('ICT-1201','Discrete Mathematics',2,3),
('ICT-1203','Structured Programming',2,1),

('ICT-2101','Data Structures',3,2),
('ICT-2201','Database Systems',4,4),

('ICT-3101','Operating Systems',5,3),
('ICT-3201','Software Engineering',6,5),

('ICT-4101','Computer Networks',7,4),
('ICT-4201','Artificial Intelligence',8,5);

-- =====================================================
-- FUTURE SCHEDULES
-- =====================================================

INSERT INTO schedules
(course_id,classroom_id,timeslot_id,schedule_date,status,schedule_type)
VALUES

(1,1,1,'2026-07-06','scheduled','class'),
(2,2,2,'2026-07-06','scheduled','class'),
(3,3,3,'2026-07-06','scheduled','class'),

(4,1,1,'2026-07-07','scheduled','class'),
(5,2,2,'2026-07-07','scheduled','class'),
(6,3,3,'2026-07-07','scheduled','class'),

(7,1,1,'2026-07-08','scheduled','class'),
(8,2,2,'2026-07-08','scheduled','class'),
(9,3,3,'2026-07-08','scheduled','class'),

(10,1,1,'2026-07-09','scheduled','exam'),

(1,2,2,'2026-08-03','scheduled','class'),
(2,3,3,'2026-08-03','scheduled','class'),
(3,1,1,'2026-08-04','scheduled','class'),
(4,2,2,'2026-08-04','scheduled','class'),
(5,3,3,'2026-08-05','scheduled','class');