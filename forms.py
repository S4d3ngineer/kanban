from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import DataRequired, Length, EqualTo, Regexp


class RegisterForm(FlaskForm):
    username = StringField('username', validators=[DataRequired(), Regexp(
        '^[A-Za-z][A-Za-z0-9_]{3,19}$', message='Username should be 4-20 characters long, '
        'start with alpha character and can contain only alphanumeric characters and "_" symbols.')])
    password = PasswordField('password', validators=[
                             DataRequired(), Length(min=8, max=40)])
    confirm_password = PasswordField('confirm password', validators=[
                                     DataRequired(), EqualTo('password')])
    submit = SubmitField('Register')


class LoginForm(FlaskForm):
    username = StringField('username', validators=[
                           DataRequired(), Length(min=3, max=20)])
    password = PasswordField('password', validators=[DataRequired()])
    submit = SubmitField('Login')
