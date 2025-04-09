import torch
from mini_fastnet import MiniFASNetV2
from collections import OrderedDict


# === Load your model checkpoint ===
model_path = "./api/modules/models/2.7_80x80_MiniFASNetV2.pth"
onnx_output_path = "./api/modules/models/MiniFASNetV2.onnx"

# === Initialize model and load weights ===
model = MiniFASNetV2(num_classes=2, img_size=80)
# model.load_state_dict(torch.load(model_path, map_location=torch.device("cpu")))
# Load original state dict
state_dict = torch.load(model_path, map_location=torch.device("cpu"))

# Remove 'module.' prefix
new_state_dict = OrderedDict()
for k, v in state_dict.items():
    new_key = k.replace("module.", "")  # Hapus prefix 'module.'
    new_state_dict[new_key] = v

# Load ke model
model.load_state_dict(new_state_dict)
# model.eval()

# === Dummy input for export (batch_size=1, 3x80x80 image) ===
dummy_input = torch.randn(1, 3, 80, 80)

# === Export to ONNX ===
torch.onnx.export(
    model, 
    dummy_input, 
    onnx_output_path,
    input_names=["input"],
    output_names=["output"],
    opset_version=11,
    dynamic_axes={"input": {0: "batch_size"}, "output": {0: "batch_size"}}
)

print(f"[✅] Exported to {onnx_output_path}")
