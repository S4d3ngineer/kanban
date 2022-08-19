import logging

# Disabling flask logger so only logs of my choosing wil be logged into the file
# logging.getLogger('werkzeug').disabled = True

LOG_FORMAT = '%(levelname)s %(asctime)s - %(message)s'
logging.basicConfig(filename='kanban_app.log',
                    level=logging.DEBUG,
                    format=LOG_FORMAT,
                    filemode='w')

logger = logging.getLogger()
