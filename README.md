# Kanban
### Description
This app is my final project for [CS50: Introduction to Computer Science course](https://pll.harvard.edu/course/cs50-introduction-computer-science?delta=0).
It's purpose is to allow user to organize work by creating tables and adding tasks to the tables. User can move tasks using included drag & drop functionality inside the table and also between tables.

I used vanilla JavaScript in order to learn it, beacuse I had no previous experience in JavaScript (only Python and C).

Backend uses Flask framework  and PostgreSQL (integration is managed by SQLAlchemy).

**For now Kanban is designated for desktop usage!**

### VideoDemo
----------- placeholder for cs50 required video --------


## Table of contents
1. [How to use the app?](#how-to-use-the-app)
2. [How to run app locally in dev mode?](#how-to-run-app-locally-in-dev-mode)
3. [Project structure](#project-structure)
4. [Notes](#notes)

## How to use the app?
### Create an account
App is accessible after logging in. You first need to register by providing username and password. 
**For the time being it is not possible to reset the password so better keep it safe!**

<img src="https://i.imgur.com/AqmdR0P.gif" width="500"/><br>

### Create table
You can now use the app. Start by adding table and populatin it with tasks.

<img src="https://i.imgur.com/4khwnh4.gif" width="500"/><br>

### Saving data
Whenever user make changes, timer is started to save them to database which is indicated by orange toast notification. 5 seconds after performing last change data will be saved, and it will be indicated by green notification. It is save to close page then. 

<img src="https://i.imgur.com/E4BxZUo.giff" width="400"/><br>

### Drag & drop functionality
Tasks can be moved freely inside and between the tables.

<img src="https://i.imgur.com/SmCAmMQ.gif" width="600"/><br>

### Deleting content
To delete task or table move mouse over task/table title in order to display delete button and then click it.

<img src="https://i.imgur.com/lYaPP2Y.gif" width="700"/><br>

## How to run app locally in dev mode?
First fork and then clon the repo. Then you need to setup some environmental variables. You have to use terminal and make sure you are inside the project's directory.
### Set up Flask secret key
```
export FLASK_SECRET_KEY="<YOUR_OWN_SECRET_KEY>"
```
[Here](https://flask.palletsprojects.com/en/2.1.x/config/#SECRET_KEY) is the Flask documentation on secret key.

### Set up PostreSQL
You need to have PostgreSQL installed and then you need to create a database. Then you can type inside your terminal:
```
export SQLALCHEMY_DATABASE_URL="<DATABASE_URL>"
```

 This is the correct format for the database URL:
```
postgresql://username:password@host:port/database
```

### Set up Flask debug mode (optional)
Debug mode allows to use Werkzeug debugger and also gets rid of the need to reload server every time the change in application code is made.
```
export FLASK_DEBUG=1
```

### Installing required dependencies
Project folder contains all dependencies required by application to run. To install them all at once type following from your terminal:
```
pip install -r requirements.txt
```

### Running application on localhost
Finally we can run app from terminal.
```
python app.py
```

App should be available under http://localhost:5000

## Project structure
- Main backend files:
    - is app.py which contains Flask app
    - database.py contains SQLalchemy setup with PostgreSQL
    - models.py has database table classes
    - forms.py contains classes used with WTForms to manage login/register forms
    - Project folder contains also: 
        - logger.py which contains logger configuration for debugging purposes
        - alembic folder and alembic.ini files associated with database migrations
        - Procfile file for production server configuration

Frontend files are stored inside static and templates folders due to Flask structure convention.
- Main frontend files:
    - main.js is main file containing redux-like store which is central piece of this app's frontend design. main.js also initializes whole frontend
    - reducer.js and action.js are related to store logic
    - Table.js contains table web component
    - Toast.js contains toast web component used for notificating user about saving data to the database

Everthing outside of web components uses Bootstrap for CSS

## Notes
During project development few major code refactorizations took place. To facialte development at the time frontend logic was changed so that every time user makes action that results in data alteration, such as adding, moving, editing or deleting tasks/tables, all of the tables are reloaded (removed and created a new). I know this is not a perfect solution which introduces many restrictions and problems, but I wanted to finish working on this project for now and in its current form app is functional so I left it that way. This is, of course, main subject to change if I ever decide to come back to this project.