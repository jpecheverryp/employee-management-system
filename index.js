// Modules
const inquirer = require("inquirer");
const cTable = require("console.table");
const connection = require('./config/connection');


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
                    "View all Roles",
                    "View all Departments",
                    "Add a Department",
                    "Add a Role",
                    "Add an Employee",
                    "Update an Employee's role",
                    "Exit"
                ]
            }
        ])
        .then(response => {
            switch (response.action) {
                case "View all Employees":
                    viewAllEmployees();
                    break;
                case "View all Roles":
                    viewAllRoles();
                    break;
                case "View all Departments":
                    viewAllDepartments();
                    break;
                case "Add a Department":
                    addDepartment();
                    break;
                case "Add a Role":
                    addRole();
                    break;
                case "Add an Employee":
                    addEmployee();
                    break;
                case "Update an Employee's role":
                    updateRole();
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
function viewAllDepartments() {
    connection.query(`
    SELECT * from Departments`,
        (err, data) => {
            if (err) throw err;
            console.table(data);
            start();
        })
};

function viewAllRoles() {
    connection.query(`
        SELECT id, title, salary FROM Roles`,
        (err, data) => {
            if (err) throw err;
            console.table(data);
            start();
        })
};

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
};

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
                    (err) => {
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
};
// Add an Employee
function addEmployee() {
    // Getting list of employees to ask for a manager
    connection.query(`
        select id, concat(first_name, ' ', last_name) as e
        from 
        employees;`,
        (err, employeesList) => {
            if (err) throw err;
            connection.query(`
            select id, title from roles;`,
                (err, rolesList) => {
                    if (err) throw err;
                    inquirer
                        .prompt([
                            {
                                name: "firstName",
                                type: "input",
                                message: "Insert the first name of the employee: "
                            },
                            {
                                name: "lastName",
                                type: "input",
                                message: "Insert the last name of the employee: "
                            },
                            {
                                name: "role",
                                type: "list",
                                message: "What role would you like to assign to this employee?",
                                choices: rolesList.map(role => role.title)
                            },
                            {
                                name: "manager",
                                type: "list",
                                message: "Who would you like to assign as manager?",
                                choices: ['None'].concat(employeesList.map(employee => employee.e))
                            }
                        ])
                        .then(answers => {
                            const newEmployee = {
                                first_name: answers.firstName,
                                last_name: answers.lastName,
                                role_id: rolesList.find(role => role.title === answers.role).id
                            }
                            if (answers.manager !== 'None') {
                                newEmployee.manager_id = employeesList.find(employee => employee.e === answers.manager).id
                            } else {
                                newEmployee.manager_id = null;
                            }
                            connection.query(`
                                INSERT INTO Employees SET ?`,
                                newEmployee,
                                (err) => {
                                    if (err) throw err;
                                    console.log("The employee has been registered!");
                                    start();
                                })
                        })
                        .catch((err) => {
                            connection.end();
                            if (err) throw err;
                        });
                });
        });
};

// ------------------------- Updating Data ------------------------- //

function updateRole() {
    connection.query(`
        select id, concat(first_name, ' ', last_name) as full_name 
        from employees;`, (err, employeesList) => {
        if (err) throw err;
        connection.query(`
            select id, title from Roles`, (err, rolesList) => {
            if (err) throw err;
            inquirer.prompt([
                {
                    name: 'employee',
                    type: 'list',
                    choices: employeesList.map(employee => employee.full_name),
                    message: 'What employee would you like to update?'
                },
                {
                    name: 'role',
                    type: 'list',
                    message: 'What role would you like to assign to the employee?',
                    choices: rolesList.map(role => role.title)
                }
            ])
                .then(
                    answers => {
                        const newInfo = {
                            employeeId: employeesList.find(employee => employee.full_name === answers.employee).id,
                            roleId: rolesList.find(role => role.title === answers.role).id
                        }
                        connection.query(`
                            UPDATE employees SET ? where ?`,
                            [
                                {
                                    role_id: newInfo.roleId,
                                },
                                {
                                    id: newInfo.employeeId,
                                }
                            ],
                            (err, res) => {
                                if (err) throw err;
                                console.log('Employee succesfully updated!');
                                start();
                            })
                    }
                )
                .catch(
                    (err) => {
                        connection.end();
                        if (err) throw err;
                    }
                );
        })
    })
}