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
                    "Add a Role",
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
                case "Add a Role":
                    addRole();
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
            connection.end();
            if (err) throw err;
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
            connection.end();
            if (err) throw err;
        });
}
// Add Role
function addRole() {
    connection.query("Select * from Departments", (err, data) => {
        if (err) throw err;
        const departmentsNames = data.map(element => element.name);
        inquirer
            .prompt([
                {
                    name: "roleTitle",
                    message: "What would you like to name the Role?",
                    type: "input"
                },
                {
                    name: "salary",
                    message: "What would you like the salary for this role to be?",
                    type: "number"
                },
                {
                    name: "department",
                    message: "What Department would you like to assign to this role?",
                    type: "list",
                    choices: departmentsNames
                }
            ])
            .then(response => {
                // dbInfo is the object that will go to mysql
                const dbInfo = {
                    title: response.roleTitle,
                    salary: response.salary,
                    // Get Id of the department where the name of the department is the same than the selected department
                    department_id: data.find(element => element.name === response.department).id
                }
                connection.query(`
                INSERT INTO Roles SET ?`, 
                dbInfo, 
                (err, res) => {
                    if (err) throw err;
                    console.log(`The Role ${response.roleTitle} Has been inserted`);
                    start();
                })
            })
            .catch((err) => {
                connection.end();
                if (err) throw err;
            })
    });
}