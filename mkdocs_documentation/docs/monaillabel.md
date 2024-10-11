# MonaiLabel
```bash
docker compose exec -it monailabel bash
monailabel start_server --app apps/monaibundle --studies datastore --conf bundles IntegrationBundle,SegformerBundle,MedSamBundle --conf zoo_source ngc
```

Initialize MedSAM Bundle's model from huggingface:
```bash
docker compose exec -it monailabel bash
python
```
```python
from transformers import SamModel, SamProcessor
import torch
```
```python
model = SamModel.from_pretrained("flaviagiammarino/medsam-vit-base", local_files_only=False)
torch.save(model.state_dict(), '/monailabel/apps/monaibundle/model/MedSamBundle/models/model.pt')
torch.save(model.state_dict(), '/monailabel/apps/monaibundle/model/MedSamBundle/models/model_best.pt')
# loaded_weights = torch.load('/monailabel/apps/monaibundle/model/MedSamBundle/models/model.pt', weights_only=True)
# model.load_state_dict(loaded_weights)
```