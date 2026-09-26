from database.database import engine
from models.ai_detection import AIDetection
from models.redzone import RedZone

AIDetection.__table__.drop(engine)
AIDetection.__table__.create(engine)
print("done")