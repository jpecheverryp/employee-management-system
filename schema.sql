-- Database Creation --
DROP DATABASE IF EXISTS EMS_DB;
CREATE DATABASE EMS_DB;

-- DB Selection --
USE EMS_DB;

-- Departments Table --
CREATE TABLE Departments (
	id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(30) NOT NULL,
    PRIMARY KEY (id)
);
-- Roles Table --
CREATE TABLE Roles (
	id INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(30) NOT NULL,
    salary DECIMAL(8,2) NOT NULL,
    department_id INT,
    PRIMARY KEY (id),
    FOREIGN KEY (department_id) REFERENCES Departments(id)
);
-- Employees Table --
CREATE TABLE Employees (
	id INT NOT NULL AUTO_INCREMENT,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    role_id INT,
    manager_id INT,
    PRIMARY KEY (id),
    FOREIGN KEY (role_id) REFERENCES Roles(id)
);