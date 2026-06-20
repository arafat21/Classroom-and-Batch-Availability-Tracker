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
 

 USE classroom_tracker_main;

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
('54',1), -- 1-1
('53',3), -- 2-1
('52',4), -- 2-2
('51',6), -- 3-2
('50',7); -- 4-1

-- =====================================================
-- USERS
-- =====================================================

-- =====================================================
-- TEACHER USERS
-- =====================================================

INSERT INTO users (email,password_hash,role) VALUES

('fazlul.patwary@juniv.edu','$2b$10$cK1.nejc4V0tyTWt4NNSo.7X.pD33yRlytAqGThA0l2CCUx4iYqdG','teacher'),
('mesbah.sarker@juniv.edu','$2b$10$cK1.nejc4V0tyTWt4NNSo.7X.pD33yRlytAqGThA0l2CCUx4iYqdG','teacher'),

(
    'msk@juniv.edu',
    '$2b$10$cK1.nejc4V0tyTWt4NNSo.7X.pD33yRlytAqGThA0l2CCUx4iYqdG',
    'teacher'
),
('risala.khan@juniv.edu','$2b$10$cK1.nejc4V0tyTWt4NNSo.7X.pD33yRlytAqGThA0l2CCUx4iYqdG','teacher'),
('jesmin.akhter@juniv.edu','$2b$10$cK1.nejc4V0tyTWt4NNSo.7X.pD33yRlytAqGThA0l2CCUx4iYqdG','teacher'),
('akkas.ali@juniv.edu','$2b$10$cK1.nejc4V0tyTWt4NNSo.7X.pD33yRlytAqGThA0l2CCUx4iYqdG','teacher'),
('fahima.tabassum@juniv.edu','$2b$10$cK1.nejc4V0tyTWt4NNSo.7X.pD33yRlytAqGThA0l2CCUx4iYqdG','teacher'),
('shamim.almamun@juniv.edu','$2b$10$cK1.nejc4V0tyTWt4NNSo.7X.pD33yRlytAqGThA0l2CCUx4iYqdG','teacher'),
('shahidul.islam@juniv.edu','$2b$10$cK1.nejc4V0tyTWt4NNSo.7X.pD33yRlytAqGThA0l2CCUx4iYqdG','teacher'),
('sazzadur.rahman@juniv.edu','$2b$10$cK1.nejc4V0tyTWt4NNSo.7X.pD33yRlytAqGThA0l2CCUx4iYqdG','teacher'),
('rashed.mazumder@juniv.edu','$2b$10$cK1.nejc4V0tyTWt4NNSo.7X.pD33yRlytAqGThA0l2CCUx4iYqdG','teacher'),
('merina.ananya@juniv.edu','$2b$10$cK1.nejc4V0tyTWt4NNSo.7X.pD33yRlytAqGThA0l2CCUx4iYqdG','teacher'),
('mahmudur.rahman@juniv.edu','$2b$10$cK1.nejc4V0tyTWt4NNSo.7X.pD33yRlytAqGThA0l2CCUx4iYqdG','teacher'),
('jahirul.khondaker@juniv.edu','$2b$10$cK1.nejc4V0tyTWt4NNSo.7X.pD33yRlytAqGThA0l2CCUx4iYqdG','teacher'),
('mahbub.rashid@juniv.edu','$2b$10$cK1.nejc4V0tyTWt4NNSo.7X.pD33yRlytAqGThA0l2CCUx4iYqdG','teacher'),
('asaduzzaman.nur@juniv.edu','$2b$10$cK1.nejc4V0tyTWt4NNSo.7X.pD33yRlytAqGThA0l2CCUx4iYqdG','teacher'),
('shuvo.howaider@juniv.edu','$2b$10$cK1.nejc4V0tyTWt4NNSo.7X.pD33yRlytAqGThA0l2CCUx4iYqdG','teacher'),
('rubaiyat.islam@juniv.edu','$2b$10$cK1.nejc4V0tyTWt4NNSo.7X.pD33yRlytAqGThA0l2CCUx4iYqdG','teacher'),

-- Math Department
('math.mahmudur@juniv.edu','$2b$10$cK1.nejc4V0tyTWt4NNSo.7X.pD33yRlytAqGThA0l2CCUx4iYqdG','teacher'),

-- English Teacher (placeholder)
('english.teacher@juniv.edu','$2b$10$cK1.nejc4V0tyTWt4NNSo.7X.pD33yRlytAqGThA0l2CCUx4iYqdG','teacher');

-- =====================================================
-- TEACHERS
-- =====================================================

INSERT INTO teachers (user_id, teacher_name, department)
SELECT user_id,'Prof. Md. Fazlul Karim Patwary','IIT'
FROM users WHERE email='fazlul.patwary@juniv.edu';

INSERT INTO teachers (user_id, teacher_name, department)
SELECT user_id,'Prof. Dr. M. Mesbahuddin Sarker','IIT'
FROM users WHERE email='mesbah.sarker@juniv.edu';

INSERT INTO teachers (user_id, teacher_name, department)
SELECT
    user_id,
    'Prof. Dr. Md. Shamim Kaiser',
    'IIT'
FROM users
WHERE email = 'msk@juniv.edu';

INSERT INTO teachers (user_id, teacher_name, department)
SELECT user_id,'Prof. Dr. Risala Tasin Khan','IIT'
FROM users WHERE email='risala.khan@juniv.edu';

INSERT INTO teachers (user_id, teacher_name, department)
SELECT user_id,'Prof. Dr. Jesmin Akhter','IIT'
FROM users WHERE email='jesmin.akhter@juniv.edu';

INSERT INTO teachers (user_id, teacher_name, department)
SELECT user_id,'Prof. K.M. Akkas Ali','IIT'
FROM users WHERE email='akkas.ali@juniv.edu';

INSERT INTO teachers (user_id, teacher_name, department)
SELECT user_id,'Prof. Dr. Fahima Tabassum','IIT'
FROM users WHERE email='fahima.tabassum@juniv.edu';

INSERT INTO teachers (user_id, teacher_name, department)
SELECT user_id,'Prof. Dr. Shamim Al Mamun','IIT'
FROM users WHERE email='shamim.almamun@juniv.edu';

INSERT INTO teachers (user_id, teacher_name, department)
SELECT user_id,'Prof. Dr. Mohammad Shahidul Islam','IIT'
FROM users WHERE email='shahidul.islam@juniv.edu';

INSERT INTO teachers (user_id, teacher_name, department)
SELECT user_id,'Prof. Dr. Sazzadur Rahman','IIT'
FROM users WHERE email='sazzadur.rahman@juniv.edu';

INSERT INTO teachers (user_id, teacher_name, department)
SELECT user_id,'Dr. Rashed Mazumder','IIT'
FROM users WHERE email='rashed.mazumder@juniv.edu';

INSERT INTO teachers (user_id, teacher_name, department)
SELECT user_id,'Merina Ananya','IIT'
FROM users WHERE email='merina.ananya@juniv.edu';

INSERT INTO teachers (user_id, teacher_name, department)
SELECT user_id,'Md. Mahmudur Rahman','IIT'
FROM users WHERE email='mahmudur.rahman@juniv.edu';

INSERT INTO teachers (user_id, teacher_name, department)
SELECT user_id,'Prof. Dr. Jahirul Islam Khondaker','IIT'
FROM users WHERE email='jahirul.khondaker@juniv.edu';

INSERT INTO teachers (user_id, teacher_name, department)
SELECT user_id,'Md. Mahbub-Or-Rashid','cse , BUBT'
FROM users WHERE email='mahbub.rashid@juniv.edu';

INSERT INTO teachers (user_id, teacher_name, department)
SELECT user_id,'Asaduzzaman Nur','IIT'
FROM users WHERE email='asaduzzaman.nur@juniv.edu';

INSERT INTO teachers (user_id, teacher_name, department)
SELECT user_id,'Md. Shuvo Howaider','IIT'
FROM users WHERE email='shuvo.howaider@juniv.edu';

INSERT INTO teachers (user_id, teacher_name, department)
SELECT user_id,'Dr. Rubaiyat Islam','IIT'
FROM users WHERE email='rubaiyat.islam@juniv.edu';

-- Engineering Mathematics-I teacher
INSERT INTO teachers (user_id, teacher_name, department)
SELECT user_id,'Md. Mahmudur Rahman','Mathematics'
FROM users WHERE email='math.mahmudur@juniv.edu';

-- Communicative English teacher
INSERT INTO teachers (user_id, teacher_name, department)
SELECT user_id,'Farhana Yasmin','English'
FROM users WHERE email='english.teacher@juniv.edu';

-- =====================================================
-- STUDENT USERS
-- =====================================================

INSERT INTO users (email,password_hash,role) VALUES

('50_001@juniv.edu','$2b$10$cK1.nejc4V0tyTWt4NNSo.7X.pD33yRlytAqGThA0l2CCUx4iYqdG','student'),
('50_002@juniv.edu','$2b$10$cK1.nejc4V0tyTWt4NNSo.7X.pD33yRlytAqGThA0l2CCUx4iYqdG','student'),
('50_003@juniv.edu','$2b$10$cK1.nejc4V0tyTWt4NNSo.7X.pD33yRlytAqGThA0l2CCUx4iYqdG','student'),

('saadahmed10031@gmail.com','$2b$10$cK1.nejc4V0tyTWt4NNSo.7X.pD33yRlytAqGThA0l2CCUx4iYqdG','student'),
('51_002@juniv.edu','$2b$10$cK1.nejc4V0tyTWt4NNSo.7X.pD33yRlytAqGThA0l2CCUx4iYqdG','student'),

('52_001@juniv.edu','$2b$10$cK1.nejc4V0tyTWt4NNSo.7X.pD33yRlytAqGThA0l2CCUx4iYqdG','student'),
('53_001@juniv.edu','$2b$10$cK1.nejc4V0tyTWt4NNSo.7X.pD33yRlytAqGThA0l2CCUx4iYqdG','student'),
('54_001@juniv.edu','$2b$10$cK1.nejc4V0tyTWt4NNSo.7X.pD33yRlytAqGThA0l2CCUx4iYqdG','student');

-- =====================================================
-- STUDENTS
-- =====================================================

INSERT INTO students (user_id,batch_id,student_name,roll_no)
SELECT user_id,5,'Tanvir Hasan','50-001'
FROM users WHERE email='50_001@juniv.edu';

INSERT INTO students (user_id,batch_id,student_name,roll_no)
SELECT user_id,5,'Mahmudul Islam','50-002'
FROM users WHERE email='50_002@juniv.edu';

INSERT INTO students (user_id,batch_id,student_name,roll_no)
SELECT user_id,5,'Siam Ahmed','50-003'
FROM users WHERE email='50_003@juniv.edu';

INSERT INTO students (user_id,batch_id,student_name,roll_no)
SELECT user_id,4,'Saad Ahmed','51-001'
FROM users WHERE email='saadahmed10031@gmail.com';

INSERT INTO students (user_id,batch_id,student_name,roll_no)
SELECT user_id,4,'Fahim Hossain','51-002'
FROM users WHERE email='51_002@juniv.edu';

INSERT INTO students (user_id,batch_id,student_name,roll_no)
SELECT user_id,3,'Rakib Hossain','52-001'
FROM users WHERE email='52_001@juniv.edu';

INSERT INTO students (user_id,batch_id,student_name,roll_no)
SELECT user_id,2,'Shadman Islam','53-001'
FROM users WHERE email='53_001@juniv.edu';

INSERT INTO students (user_id,batch_id,student_name,roll_no)
SELECT user_id,1,'Muntasir Ahmed','54-001'
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

-- =====================================================
-- COURSES
-- =====================================================

INSERT INTO courses
(course_code, course_title, semester_id, teacher_id)
VALUES

-- =====================================================
-- 1-1 (Batch 54)
-- =====================================================

('ICT-1101','Structured Programming Language',1,11),
('ICT-1102','Structured Programming Language Lab',1,7),
('ICT-1103','Electrical Circuits',1,9),
('ICT-1104','Electrical Circuits Lab',1,9),
('ICT-1105','Physics',1,14),
('ICT-1106','Soft Skill Development Lab',1,8),
('ICT-1107','Engineering Mathematics-I',1,19),
('ICT-1109','Communicative English',1,20),

-- =====================================================
-- 2-1 (Batch 53)
-- =====================================================

('ICT-2101','Data Structures',3,13),
('ICT-2102','Data Structures Lab',3,13),
('ICT-2103','Digital Logic Design',3,10),
('ICT-2104','Digital Logic Design Lab',3,10),
('ICT-2105','Data Communication and Computer Networks',3,6),
('ICT-2106','Data Communication and Computer Networks Lab',3,10),
('ICT-2107','Numerical Analysis for Engineers',3,1),
('ICT-2109','Statistics and Probability for Engineers',3,2),

-- =====================================================
-- 2-2 (Batch 52)
-- =====================================================

('ICT-2201','Algorithm Analysis and Design',4,6),
('ICT-2202','Algorithm Analysis and Design Lab',4,7),
('ICT-2203','Database Management System',4,12),
('ICT-2204','Database Management System Lab',4,12),
('ICT-2205','Analog and Digital Communication',4,3),
('ICT-2206','Analog and Digital Communication Lab',4,3),
('ICT-2207','Microprocessor and Interfacing',4,2),
('ICT-2209','Financial & Managerial Accounting',4,12),


-- =====================================================
-- 3-2 (Batch 51)
-- =====================================================

('ICT-3201','Software Engineering',6,7),
('ICT-3202','Software Engineering Lab',6,10),
('ICT-3203','Computer Architecture and Microprocessor',6,11),
('ICT-3204','Computer Architecture and Microprocessor Lab',6,10),
('ICT-3205','Signals and Systems',6,15),
('ICT-3207','Server Administration and Management',6,16),
('ICT-3209','Smart Sensors and Internet of Things',6,10);

-- =====================================================
-- FUTURE SCHEDULES
-- =====================================================

INSERT INTO schedules (course_id,classroom_id,timeslot_id,schedule_date,status,schedule_type) VALUES

((SELECT course_id FROM courses WHERE course_code='ICT-1107'),4,2,'2026-06-21','scheduled','class'),
((SELECT course_id FROM courses WHERE course_code='ICT-2209'),1,2,'2026-06-21','scheduled','class'),
((SELECT course_id FROM courses WHERE course_code='ICT-3207'),3,2,'2026-06-21','scheduled','class'),

((SELECT course_id FROM courses WHERE course_code='ICT-2103'),2,3,'2026-06-21','scheduled','class'),
((SELECT course_id FROM courses WHERE course_code='ICT-3201'),3,3,'2026-06-21','scheduled','class'),

((SELECT course_id FROM courses WHERE course_code='ICT-1106'),1,4,'2026-06-21','scheduled','class');


INSERT INTO schedules (course_id,classroom_id,timeslot_id,schedule_date,status,schedule_type) VALUES

((SELECT course_id FROM courses WHERE course_code='ICT-2109'),2,2,'2026-06-22','scheduled','class'),
((SELECT course_id FROM courses WHERE course_code='ICT-3203'),3,2,'2026-06-22','scheduled','class'),

((SELECT course_id FROM courses WHERE course_code='ICT-1103'),5,3,'2026-06-22','scheduled','class'),
((SELECT course_id FROM courses WHERE course_code='ICT-2107'),2,3,'2026-06-22','scheduled','class'),
((SELECT course_id FROM courses WHERE course_code='ICT-2201'),1,3,'2026-06-22','scheduled','class'),
((SELECT course_id FROM courses WHERE course_code='ICT-3209'),3,3,'2026-06-22','scheduled','class'),

((SELECT course_id FROM courses WHERE course_code='ICT-2105'),2,4,'2026-06-22','scheduled','class'),
((SELECT course_id FROM courses WHERE course_code='ICT-2205'),1,4,'2026-06-22','scheduled','class'),
((SELECT course_id FROM courses WHERE course_code='ICT-3205'),3,4,'2026-06-22','scheduled','class');


INSERT INTO schedules (course_id,classroom_id,timeslot_id,schedule_date,status,schedule_type) VALUES

((SELECT course_id FROM courses WHERE course_code='ICT-1101'),2,2,'2026-06-23','scheduled','class'),
((SELECT course_id FROM courses WHERE course_code='ICT-1103'),2,2,'2026-06-23','scheduled','class'),
((SELECT course_id FROM courses WHERE course_code='ICT-2101'),1,2,'2026-06-23','scheduled','class'),
((SELECT course_id FROM courses WHERE course_code='ICT-2201'),1,2,'2026-06-23','scheduled','class'),

((SELECT course_id FROM courses WHERE course_code='ICT-1107'),4,3,'2026-06-23','scheduled','class'),
((SELECT course_id FROM courses WHERE course_code='ICT-2105'),1,3,'2026-06-23','scheduled','class'),
((SELECT course_id FROM courses WHERE course_code='ICT-2203'),3,3,'2026-06-23','scheduled','class'),
((SELECT course_id FROM courses WHERE course_code='ICT-3201'),2,3,'2026-06-23','scheduled','class'),

((SELECT course_id FROM courses WHERE course_code='ICT-1105'),4,4,'2026-06-23','scheduled','class'),
((SELECT course_id FROM courses WHERE course_code='ICT-3202'),2,4,'2026-06-23','scheduled','class');

INSERT INTO schedules (course_id,classroom_id,timeslot_id,schedule_date,status,schedule_type) VALUES

((SELECT course_id FROM courses WHERE course_code='ICT-1101'),2,2,'2026-06-24','scheduled','class'),
((SELECT course_id FROM courses WHERE course_code='ICT-2203'),1,2,'2026-06-24','scheduled','class'),
((SELECT course_id FROM courses WHERE course_code='ICT-3209'),3,2,'2026-06-24','scheduled','class'),

((SELECT course_id FROM courses WHERE course_code='ICT-2107'),2,3,'2026-06-24','scheduled','class'),
((SELECT course_id FROM courses WHERE course_code='ICT-3203'),3,3,'2026-06-24','scheduled','class'),
((SELECT course_id FROM courses WHERE course_code='ICT-1109'),4,4,'2026-06-24','scheduled','class'),

((SELECT course_id FROM courses WHERE course_code='ICT-2104'),4,4,'2026-06-24','scheduled','class'),
((SELECT course_id FROM courses WHERE course_code='ICT-2204'),4,4,'2026-06-24','scheduled','class'),
((SELECT course_id FROM courses WHERE course_code='ICT-3204'),3,4,'2026-06-24','scheduled','class'),

((SELECT course_id FROM courses WHERE course_code='ICT-1106'),1,1,'2026-06-24','scheduled','class');

INSERT INTO schedules (course_id,classroom_id,timeslot_id,schedule_date,status,schedule_type) VALUES

((SELECT course_id FROM courses WHERE course_code='ICT-2101'),3,2,'2026-06-25','scheduled','class'),
((SELECT course_id FROM courses WHERE course_code='ICT-2103'),3,3,'2026-06-25','scheduled','class'),

((SELECT course_id FROM courses WHERE course_code='ICT-2106'),3,4,'2026-06-25','scheduled','class'),
((SELECT course_id FROM courses WHERE course_code='ICT-2206'),1,4,'2026-06-25','scheduled','class'),
((SELECT course_id FROM courses WHERE course_code='ICT-3207'),3,4,'2026-06-25','scheduled','class');



INSERT INTO schedules (course_id,classroom_id,timeslot_id,schedule_date,status,schedule_type) VALUES

((SELECT course_id FROM courses WHERE course_code='ICT-1107'),4,2,'2026-06-28','scheduled','class'),
((SELECT course_id FROM courses WHERE course_code='ICT-2209'),1,2,'2026-06-28','scheduled','class'),
((SELECT course_id FROM courses WHERE course_code='ICT-3207'),3,2,'2026-06-28','scheduled','class'),

((SELECT course_id FROM courses WHERE course_code='ICT-2103'),2,3,'2026-06-28','scheduled','class'),
((SELECT course_id FROM courses WHERE course_code='ICT-3201'),3,3,'2026-06-28','scheduled','class'),

((SELECT course_id FROM courses WHERE course_code='ICT-1106'),1,4,'2026-06-28','scheduled','class');

INSERT INTO schedules (course_id,classroom_id,timeslot_id,schedule_date,status,schedule_type) VALUES

((SELECT course_id FROM courses WHERE course_code='ICT-2109'),2,2,'2026-06-29','scheduled','class'),
((SELECT course_id FROM courses WHERE course_code='ICT-3203'),3,2,'2026-06-29','scheduled','class'),

((SELECT course_id FROM courses WHERE course_code='ICT-1103'),5,3,'2026-06-29','scheduled','class'),
((SELECT course_id FROM courses WHERE course_code='ICT-2107'),2,3,'2026-06-29','scheduled','class'),
((SELECT course_id FROM courses WHERE course_code='ICT-2201'),1,3,'2026-06-29','scheduled','class'),
((SELECT course_id FROM courses WHERE course_code='ICT-3209'),3,3,'2026-06-29','scheduled','class'),

((SELECT course_id FROM courses WHERE course_code='ICT-2105'),2,4,'2026-06-29','scheduled','class'),
((SELECT course_id FROM courses WHERE course_code='ICT-2205'),1,4,'2026-06-29','scheduled','class'),
((SELECT course_id FROM courses WHERE course_code='ICT-3205'),3,4,'2026-06-29','scheduled','class');

INSERT INTO schedules (course_id,classroom_id,timeslot_id,schedule_date,status,schedule_type) VALUES

((SELECT course_id FROM courses WHERE course_code='ICT-1101'),2,2,'2026-06-30','scheduled','class'),
((SELECT course_id FROM courses WHERE course_code='ICT-1103'),2,2,'2026-06-30','scheduled','class'),
((SELECT course_id FROM courses WHERE course_code='ICT-2101'),1,2,'2026-06-30','scheduled','class'),
((SELECT course_id FROM courses WHERE course_code='ICT-2201'),1,2,'2026-06-30','scheduled','class'),

((SELECT course_id FROM courses WHERE course_code='ICT-1107'),4,3,'2026-06-30','scheduled','class'),
((SELECT course_id FROM courses WHERE course_code='ICT-2105'),1,3,'2026-06-30','scheduled','class'),
((SELECT course_id FROM courses WHERE course_code='ICT-2203'),3,3,'2026-06-30','scheduled','class'),
((SELECT course_id FROM courses WHERE course_code='ICT-3201'),2,3,'2026-06-30','scheduled','class'),

((SELECT course_id FROM courses WHERE course_code='ICT-1105'),4,4,'2026-06-30','scheduled','class'),
((SELECT course_id FROM courses WHERE course_code='ICT-3202'),2,4,'2026-06-30','scheduled','class');

INSERT INTO schedules (course_id,classroom_id,timeslot_id,schedule_date,status,schedule_type) VALUES

((SELECT course_id FROM courses WHERE course_code='ICT-1101'),2,2,'2026-07-01','scheduled','class'),
((SELECT course_id FROM courses WHERE course_code='ICT-2203'),1,2,'2026-07-01','scheduled','class'),
((SELECT course_id FROM courses WHERE course_code='ICT-3209'),3,2,'2026-07-01','scheduled','class'),

((SELECT course_id FROM courses WHERE course_code='ICT-2107'),2,3,'2026-07-01','scheduled','class'),
((SELECT course_id FROM courses WHERE course_code='ICT-3203'),3,3,'2026-07-01','scheduled','class'),
((SELECT course_id FROM courses WHERE course_code='ICT-1109'),4,4,'2026-07-01','scheduled','class'),

((SELECT course_id FROM courses WHERE course_code='ICT-2104'),4,4,'2026-07-01','scheduled','class'),
((SELECT course_id FROM courses WHERE course_code='ICT-2204'),4,4,'2026-07-01','scheduled','class'),
((SELECT course_id FROM courses WHERE course_code='ICT-3204'),3,4,'2026-07-01','scheduled','class'),

((SELECT course_id FROM courses WHERE course_code='ICT-1106'),1,1,'2026-07-01','scheduled','class');

INSERT INTO schedules (course_id,classroom_id,timeslot_id,schedule_date,status,schedule_type) VALUES

((SELECT course_id FROM courses WHERE course_code='ICT-2101'),3,2,'2026-07-02','scheduled','class'),
((SELECT course_id FROM courses WHERE course_code='ICT-2103'),3,3,'2026-07-02','scheduled','class'),

((SELECT course_id FROM courses WHERE course_code='ICT-2106'),3,4,'2026-07-02','scheduled','class'),
((SELECT course_id FROM courses WHERE course_code='ICT-2206'),1,4,'2026-07-02','scheduled','class'),
((SELECT course_id FROM courses WHERE course_code='ICT-3207'),3,4,'2026-07-02','scheduled','class');

