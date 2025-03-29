import os
from dotenv import load_dotenv
from app import create_app, db

# Load environment variables from .env file
load_dotenv()

app = create_app()

# Create tables if they don't exist
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    host = os.environ.get('HOST', '0.0.0.0')
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'
    
    app.run(host=host, port=port, debug=debug) 