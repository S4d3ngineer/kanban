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


@app.teardown_appcontext
def shutdown_session(exception=None):
    db_session.remove()


@app.route('/')
def index():
    if not current_user.is_authenticated:
        return redirect(url_for('register'))
    return render_template('index.html', title='Homepage')

############################################################################


@app.route('/get_user_data')
def get_user_data():
    tables = db_session.query(Table).filter_by(
        user_id=current_user.id).order_by(Table.position).all()
    logger.debug(f'Getting user table objects: {tables}')

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
    logger.debug(f'tables_registry: {tables_registry}')
    tasks_registry = []
    for table in tables_registry:
        table_tasks = db_session.query(Task).filter_by(table_id=table.id).all()
        # TODO get rid of unnecessary loggers
        logger.debug(f'table_tasks: {table_tasks}')
        tasks_registry = [*tasks_registry, *table_tasks]
    logger.debug(f'tasks_registry: {tasks_registry}')

    for table_index, table_data in enumerate(data):
        # Update/add tables
        # TODO also you can encapsulate it into funcitons to make it look tidy
        table = db_session.query(Table).filter_by(
            client_side_id=table_data['client_side_id'],
            user_id=current_user.id
        ).first()
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
            # parent_table = db_session.query(Table).filter_by(
            #     client_side_id=table_data['client_side_id'],
            #     user_id=current_user.id
            #     ).first()
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

############################################################################

# @app.route('/get_tables') ## TODO login requierd to access?
# def get_tables():
#     tables = db_session.query(Table).filter_by(user_id=current_user.id).all()
#     tables_list = []
#     for table in tables:
#         dictionary = table.__dict__
#         dictionary.pop('_sa_instance_state')
#         tables_list.append(dictionary)

#     logger.info(f'get_tables: {tables_list}')

#     # sample_json = {
#     #     "data": {
#     #         "tasks": [
#     #         {
#     #             "content": "fdas",
#     #             "id": 933584848
#     #         }
#     #         ],
#     #         "title": "New Table"
#     #     },
#     #     "id": 125404797
#     #     }

#     data = jsonify(tables_list)

#     return data

# @app.route('/get_table_tasks')
# def get_table_tasks():

#     data = request.get_json()
#     tasks = db_session.query(Task).filter_by(table_id=data.id)
#     tasks_list = []
#     for task in tasks:
#         dictionary = task.__dict__
#         dictionary.pop('_sa_instance_state')
#         tasks_list.append(dictionary)

#     logger.info(f'tasks_list: {tasks_list}')
#     data = jsonify(tasks_list)

#     return data

# # TODO make it return new_data
# @app.route('/insert_table', methods=['POST'])
# def insert_table():

#     user_id = current_user.id
#     data = request.get_json()
#     logger.info(f'insert_table: {data}')

#     new_table = Table(
#         title='New Table',
#         user_id=user_id,
#         position=data
#     )

#     db_session.add(new_table)
#     db_session.commit()
#     DbSession.remove()

#     tables = db_session.query(Table).filter_by(user_id=current_user.id).all()
#     updated_list = []
#     for table in tables:
#         dictionary = table.__dict__
#         dictionary.pop('_sa_instance_state')
#         updated_list.append(dictionary)

#     logger.info(f'after table insert: {updated_list}')

#     return jsonify(updated_list)

# @app.route('/put_task', methods=['PUT'])
# def put_task():
#     data = request.json()
#     logger.info(f'put_task: {data}')

#     task = Task(

#     )

# # TODO make it return updated data
# @app.route('/delete_table', methods=['DELETE'])
# def delete_table():
#     data = request.get_json()
#     logger.info(f'delete_table: {data}')

#     table_id = data
#     table_to_delete = db_session.query(Table).filter_by(id=table_id).first()
#     db_session.delete(table_to_delete)
#     db_session.commit()
#     DbSession.remove()

#     tables = db_session.query(Table).filter_by(user_id=current_user.id).all()
#     updated_list = []
#     for table in tables:
#         dictionary = table.__dict__
#         dictionary.pop('_sa_instance_state')
#         updated_list.append(dictionary)

#     logger.info(f'list after deleting table: {updated_list}')

#     return jsonify(updated_list)

# # TODO consider throwing this shit out of the windooow! through the wall!
# @app.route('/update_data', methods=['PUT'])
# def update_user_data():
#     data = json.loads(request.data)
#     logger.info('put', data)

#     return jsonify(data)


@app.route('/register', methods=['GET', 'POST'])
def register():

    form = RegisterForm()

    if form.validate_on_submit():

        username = form.username.data
        password = form.password.data
        # email = form.email.data

        # Encrypt password before storing it in the database
        encrypted_password = generate_password_hash(
            password, method='pbkdf2:sha256', salt_length=8)

        # if db_session.query(User).filter_by(email=email).first():
        #     flash('This email has been already registered.')
        #     flash('Try logging in instead!')
        #     return redirect(url_for('login'))
        if db_session.query(User).filter_by(username=username).first():
            flash('This username is already taken')
        else:
            new_user = User(
                username=username,
                # email=email,
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
            flash('Username or password are incorrect.')

    return render_template('login.html', title='login', form=form)


@app.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('index'))


if __name__ == '__main__':
    app.run()
