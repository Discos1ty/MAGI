import uuid
from types import SimpleNamespace

def create_experiment(db, experiment):
    return SimpleNamespace(id=str(uuid.uuid4())[:8])
