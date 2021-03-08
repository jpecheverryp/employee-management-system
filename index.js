// Modules
const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require("console.table");

// Creating connection to database
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Delphinet2000",
    database: "EMS_DB"
})

//  Connecting to DB
connection.connect((err) => {
    if (err) throw err;
    console.log(`Connected as id ${connection.threadId}`);
    console.log("WELCOME TO YOUR EMPLOYEE MANAGER!");
    // Starting functionality
    start();
})

/* This function prompts the user for an action and calls a function to execute the action, 
then it calls itself until the user hits the Exit option then it kills the onnection to the database */
function start() {
    inquirer
        .prompt([
            {
                name: "action",
                message: "What would you like to do?",
                type: "list",
                choices: [
                    "View all Employees",
                    "Add a Department",
                    "Exit"
                ]
            }
        ])
        .then(response => {
            switch (response.action) {
                case "View all Employees":
                    viewAllEmployees();
                    break;
                case "Add a Department":
                    addDepartment();
                    break;
                case "Exit":
                    console.log("Terminating Program");
                    connection.end();
                    break;
                default:
                    break;
            }
        })
        .catch(err => {
            if (err) throw err;
            connection.end();
        })
}

// ------------------------  Views  ------------------------- //
// View All Employees
function viewAllEmployees() {
    connection.query(`
    SELECT
        e.id,
        e.first_name, e.last_name, 
        r.title,
        d.name,
        r.salary,
        CONCAT(m.first_name, ' ', m.last_name) as manager
    FROM (
        Employees AS e,
        Roles AS r,
        Departments AS d
        )
    LEFT JOIN Employees AS m
    ON e.manager_id = m.id
    WHERE e.role_id = r.id AND r.department_id = d.id;
    `, (err, data) => {
        if (err) throw err;
        console.table(data);
        start();
    })
}
// ------------------------  Adding Data  ------------------------- //
// Add Department
function addDepartment() {
    inquirer
        .prompt([
            {
                name: "departmentName",
                type: "input",
                message: "How would you like to call this Department?"
            }
        ])
        .then(response => {
            connection.query(`
            INSERT INTO Departments SET ?`, 
            {
                name: [response.departmentName]
            },
            (err, res) => {
                if (err) throw err;
                console.log(`The Department ${response.departmentName} has been Inserted!`);
                start();
            })
        })
        .catch((err) => {
            if (err) throw err;
            connection.end();
        });
}