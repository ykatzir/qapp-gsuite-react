from flask import render_template
from app import app


@app.route('/')
@app.route('/index')
def index():
    return render_template('config.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')
