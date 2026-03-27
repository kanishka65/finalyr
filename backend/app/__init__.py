from flask import Flask, jsonify
from flask_cors import CORS

from app.config import Config
from app.extensions import bcrypt, jwt, mongo


def create_app(test_config=None):
    app = Flask(__name__)
    app.config.from_object(Config)
    if test_config:
        app.config.update(test_config)

    app.debug = not app.config.get("TESTING", False)
    CORS(app)

    try:
        mongo.init_app(app)
        if not app.config.get("SKIP_MONGO_PING", False):
            with app.app_context():
                mongo.db.command("ping")
    except Exception as exc:
        app.logger.warning("MongoDB initialization failed: %s", exc)

    from app.routes.auth import auth_bp
    from app.routes.email import email_bp
    from app.routes.insights import insights_bp
    from app.routes.prices import price_bp
    from app.routes.purchases import purchase_bp

    jwt.init_app(app)
    bcrypt.init_app(app)

    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(purchase_bp, url_prefix="/purchases")
    app.register_blueprint(insights_bp, url_prefix="/insights")
    app.register_blueprint(email_bp, url_prefix="/email")
    app.register_blueprint(price_bp, url_prefix="/prices")

    @app.route("/")
    def hello():
        return jsonify({"message": "Q-Commerce Backend is running!"})

    return app


app = create_app()
