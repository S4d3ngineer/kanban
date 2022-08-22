import logging

LOG_FORMAT = '%(levelname)s %(asctime)s - %(message)s'
logging.basicConfig(filename='kanban_app.log',
                    level=logging.DEBUG,
                    format=LOG_FORMAT,
                    filemode='w')

logger = logging.getLogger()
