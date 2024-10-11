# MonaiLabel

## Download Models
Initialize MedSAM Bundle's model from huggingface:
```bash
docker compose exec -it monailabel bash
python # start a python interpreter in monailabel container
```

```python
from transformers import SamModel, SamProcessor
import torch
```

MonaiLabel requires `model.pt` and `model_best.pt` in the bundle:
```python
model = SamModel.from_pretrained("flaviagiammarino/medsam-vit-base", local_files_only=False)
torch.save(model.state_dict(), '/monailabel/apps/monaibundle/model/MedSamBundle/models/model.pt')
torch.save(model.state_dict(), '/monailabel/apps/monaibundle/model/MedSamBundle/models/model_best.pt')
```

Loading weights if needed for custom models:
```python
# loaded_weights = torch.load('/monailabel/apps/monaibundle/model/MedSamBundle/models/model.pt', weights_only=True)
# model.load_state_dict(loaded_weights)
```

## Restart MonaiLabel