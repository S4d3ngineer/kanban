from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import DataRequired, Length, EqualTo


class RegisterForm(FlaskForm):
    username = StringField('username', validators=[DataRequired(), Length(min=3, max=20)])
    password = PasswordField('password', validators=[DataRequired()])
    confirm_password = PasswordField('confirm password', validators=[DataRequired(), EqualTo('password')])
    submit = SubmitField('Register')

class LoginForm(FlaskForm):
    username = StringField('username', validators=[DataRequired(), Length(min=3, max=20)])
    password = PasswordField('password', validators=[DataRequired()])
    submit = SubmitField('Login')
