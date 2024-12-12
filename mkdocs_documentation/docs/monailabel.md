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

```bash
docker compose restart monailabel
```

## Changes to MonaiLabel and GIT

If you make some edits to monailabel you need to check it into git first.
```
cd monailabel
git branch add-changes
git add <file>
git commit -m "Your commit message for submodule changes"

git checkout main
git merge add-changes
git push origin main
git branch -d add-changes

cd ..
git add monailabel
git commit -m "commit message"
git push
```

