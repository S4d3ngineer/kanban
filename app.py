from flask import Flask, flash, render_template, redirect, url_for, request, jsonify
from flask_login import login_user, LoginManager, current_user, logout_user
from database import db_session
from models import User, Table, Task
from forms import RegisterForm, LoginForm
from werkzeug.security import generate_password_hash, check_password_hash
from logger import logger
from datetime import timedelta
import os

# Base configuration
app = Flask(__name__)
app.secret_key = os.environ.get('FLASK_SECRET_KEY')
app.config["REMEMBER_COOKIE_DURATION"] = timedelta(days=1)
login_manager = LoginManager()
login_manager.init_app(app)


@login_manager.user_loader
def load_user(user_id):
    return db_session.query(User).filter_by(id=user_id).first()


# Automatically removing database connection after request ends
@app.teardown_appcontext
def shutdown_session(exception=None):
    db_session.remove()


@app.route('/')
def index():
    if not current_user.is_authenticated:
        return redirect(url_for('register'))
    return render_template('index.html', title='Homepage')


@app.route('/get_user_data')
def get_user_data():
    # Fetching user data from database
    tables = db_session.query(Table).filter_by(
        user_id=current_user.id).order_by(Table.position).all()
    logger.debug(f'Getting user table objects: {tables}')

    # If no tables exists return empty list
    if not tables:
        return jsonify([])

    # Getting rid of orm object data from table dictionaries
    tables_list = []
    for table in tables:
        table_dict = table.__dict__
        table_dict.pop('_sa_instance_state')
        tables_list.append(table_dict)

    # Iterating through cleaned list of table dictionaries
    for table in tables_list:
        tasks = db_session.query(Task).filter_by(
            table_id=table['id']).order_by(Task.position).all()
        # Cleaning table data of unnecessary data
        table.pop('user_id')
        table.pop('position')
        table.pop('id')
        # Getting rid of orm object data from task dictionaries
        tasks_list = []
        for task in tasks:
            task_dict = task.__dict__
            task_dict.pop('_sa_instance_state')
            tasks_list.append(task_dict)
        # Cleaning task data of unnecessary data
        for task in tasks_list:
            task.pop('id')
            task.pop('table_id')
            task.pop('position')
        table['tasks'] = tasks_list

    logger.debug(f'Tables dictionaries: {tables_list}')

    data = jsonify(tables_list)

    return data


@app.route('/update_user_data', methods=['PUT'])
def update_user_data():
    data = request.get_json()
    logger.info(f'update_user_data: {data}')

    # Creating list of all tables and tasks to figure which ones were deleted on client side
    tables_registry = db_session.query(
        Table).filter_by(user_id=current_user.id).all()
    tasks_registry = []
    for table in tables_registry:
        table_tasks = db_session.query(Task).filter_by(table_id=table.id).all()
        tasks_registry = [*tasks_registry, *table_tasks]

    # Update/add tables/tasks
    for table_index, table_data in enumerate(data):
        table = db_session.query(Table).filter_by(
            client_side_id=table_data['client_side_id'],
            user_id=current_user.id
        ).first()

        # If table already exists in database update its data, else insert new row to tables table
        if table:
            tables_registry.remove(table)
            table.title = table_data['title']
            table.position = table_index + 1
            db_session.commit()
        else:
            new_table = Table(
                client_side_id=table_data['client_side_id'],
                title=table_data['title'],
                user_id=current_user.id,
                position=table_index + 1
            )
            db_session.add(new_table)
            db_session.commit()
            db_session.refresh(new_table)

        for task_index, task_data in enumerate(table_data['tasks']):

            task = db_session.query(Task).filter_by(
                client_side_id=task_data['client_side_id'],
                table_id=table_data['client_side_id']
            ).first()

            # If task already exists in database update its data, else insert new row to tasks table
            if task:
                tasks_registry.remove(task)
                task.content = task_data['content']
                task.position = task_index + 1
                db_session.commit()
            else:
                new_task = Task(
                    client_side_id=task_data['client_side_id'],
                    content=task_data['content'],
                    table_id=table.id if table else new_table.id,  
                    position=task_index + 1
                )
                db_session.add(new_task)
                db_session.commit()

    # Deleting rows from tasks_registry and tables_registry that are no longer present on the client side
    for task in tasks_registry:
        db_session.delete(task)
        db_session.commit()
    for table in tables_registry:
        db_session.delete(table)
        db_session.commit()


    return jsonify(data)


@app.route('/register', methods=['GET', 'POST'])
def register():

    form = RegisterForm()

    if form.validate_on_submit():

        username = form.username.data
        password = form.password.data

        # Encrypt password before storing it in the database
        encrypted_password = generate_password_hash(
            password, method='pbkdf2:sha256', salt_length=8)

        if db_session.query(User).filter_by(username=username).first():
            flash('This username is already taken')
        else:
            new_user = User(
                username=username,
                password=encrypted_password
            )

            db_session.add(new_user)
            db_session.commit()

            logger.info(
                f'Username: {username}, password: {password}')

            login_user(new_user, remember=True)
            return redirect(url_for('index'))

    return render_template('register.html', title='Registration Form', form=form)


@app.route('/login', methods=['GET', 'POST'])
def login():

    form = LoginForm()

    if form.validate_on_submit():
        username = form.username.data
        password = form.password.data

        user = db_session.query(User).filter_by(username=username).first()

        if user and check_password_hash(user.password, password):
            login_user(user, remember=True)
            return redirect(url_for('index'))
        else:
            flash('Username or password is incorrect.')

    return render_template('login.html', title='login', form=form)


@app.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('index'))


if __name__ == '__main__':
    app.run()
