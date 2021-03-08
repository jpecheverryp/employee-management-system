-- DB Selection --
USE EMS_DB;
-- Departments Seed --
INSERT INTO Departments
(name)
VALUES
("Legal"),
("Engineering"),
("Accounting");

-- Roles Seed --
INSERT INTO Roles
(title, salary, department_id)
VALUES
("Software Engineer", 80000, 2),
("Accountant", 75000, 3),
("Lawyer", 85000, 1),
("DevOps", 90000, 2),
("Legal Team Lead", 95000, 1);

-- Employees Seed --
INSERT INTO Employees
(first_name, last_name, role_id, manager_id)
VALUES
("Juan", "Echeverry", 1, NULL),
("Diego", "Smith", 2, NULL),
("John", "Doe", 3, 2),
("Kevin", "Graham", 4, 1);