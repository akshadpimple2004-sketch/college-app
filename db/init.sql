CREATE DATABASE IF NOT EXISTS college_db;
USE college_db;

-- 1. Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Students Table
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    gpa DECIMAL(3,2) DEFAULT 0.00,
    enrollment_date DATE NOT NULL,
    department_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 3. Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(15) NOT NULL UNIQUE,
    credits INT NOT NULL DEFAULT 3,
    department_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Seed Data
INSERT INTO departments (id, name, code) VALUES
(1, 'Computer Science & Engineering', 'CSE'),
(2, 'Electronics & Communication', 'ECE'),
(3, 'Mechanical Engineering', 'ME'),
(4, 'Civil Engineering', 'CE')
ON DUPLICATE KEY UPDATE code = code;

-- Inserting Students
INSERT INTO students (id, first_name, last_name, email, gpa, enrollment_date, department_id) VALUES
(1, 'John', 'Doe', 'john.doe@college.edu', 3.85, '2023-09-01', 1),
(2, 'Jane', 'Smith', 'jane.smith@college.edu', 3.92, '2023-09-01', 1),
(3, 'Alice', 'Johnson', 'alice.j@college.edu', 3.50, '2024-01-15', 2),
(4, 'Bob', 'Williams', 'bob.w@college.edu', 2.95, '2023-09-01', 3),
(5, 'Charlie', 'Brown', 'charlie.b@college.edu', 3.10, '2024-01-15', 4),
(6, 'Emily', 'Davis', 'emily.d@college.edu', 3.75, '2023-09-01', 1),
(7, 'Michael', 'Wilson', 'michael.w@college.edu', 3.40, '2023-09-01', 2),
(8, 'Sarah', 'Miller', 'sarah.m@college.edu', 3.65, '2024-01-15', 3)
ON DUPLICATE KEY UPDATE email = email;

-- Inserting Courses
INSERT INTO courses (id, name, code, credits, department_id) VALUES
(1, 'Introduction to Computer Science', 'CS-101', 4, 1),
(2, 'Data Structures and Algorithms', 'CS-201', 4, 1),
(3, 'Digital Logic Design', 'EC-101', 3, 2),
(4, 'Signals and Systems', 'EC-201', 4, 2),
(5, 'Thermodynamics', 'ME-101', 3, 3),
(6, 'Fluid Mechanics', 'ME-201', 4, 3),
(7, 'Engineering Surveying', 'CE-101', 3, 4),
(8, 'Structural Analysis', 'CE-201', 4, 4)
ON DUPLICATE KEY UPDATE code = code;
