import sys
import json
import base64
import cv2
import re
import torch
import torch.nn.functional as F
from torch_geometric.data import Data
from torch_geometric.nn import GCNConv, global_mean_pool
from sentence_transformers import SentenceTransformer, util
import os

# Add project root to sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)
# ------------------------
# Verhoeff Checksum Tables
# ------------------------

mul_table = [
    [0,1,2,3,4,5,6,7,8,9],
    [1,2,3,4,0,6,7,8,9,5],
    [2,3,4,0,1,7,8,9,5,6],
    [3,4,0,1,2,8,9,5,6,7],
    [4,0,1,2,3,9,5,6,7,8],
    [5,9,8,7,6,0,4,3,2,1],
    [6,5,9,8,7,1,0,4,3,2],
    [7,6,5,9,8,2,1,0,4,3],
    [8,7,6,5,9,3,2,1,0,4],
    [9,8,7,6,5,4,3,2,1,0]
]

perm_table = [
    [0,1,2,3,4,5,6,7,8,9],
    [1,5,7,6,2,8,3,0,9,4],
    [5,8,0,3,7,9,6,1,4,2],
    [8,9,1,6,0,4,3,5,2,7],
    [9,4,5,3,1,2,6,8,7,0],
    [4,2,8,6,5,7,3,9,0,1],
    [2,7,9,3,8,0,6,4,1,5],
    [7,0,4,6,9,1,3,2,5,8]
]

def verhoeff_check(num):
    c = 0
    num = str(num)[::-1]
    for i, item in enumerate(num):
        c = mul_table[c][perm_table[i % 8][int(item)]]
    return c == 0

# ------------------------
# Tampering Detection
# ------------------------

def detect_document_tampering(image_path):
    try:
        image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
        if image is None:
            return False
        image = cv2.GaussianBlur(image, (5, 5), 0)

        # Edge detection with higher threshold to ignore text noise
        edges = cv2.Canny(image, 250, 300)

        # Use contour area instead of just count
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        large_contours = [cnt for cnt in contours if cv2.contourArea(cnt) > 500]

        return len(large_contours) > 10  # Only flag if there are many large, irregular patches
    except Exception:
        return False

# ------------------------
# NLP for Name Similarity
# ------------------------

nlp_model = SentenceTransformer('all-MiniLM-L6-v2')

def normalize_name(name):
    name = name.lower().strip()
    name = re.sub(r'\s+', ' ', name)
    name = re.sub(r'[^\w\s]', '', name)
    return name

def compute_name_similarity(name_from_doc, name_from_user):
    if not name_from_doc or not name_from_user:
        return 0.0

    name_from_doc = normalize_name(name_from_doc)
    name_from_user = normalize_name(name_from_user)

    if name_from_doc == name_from_user:
        return 1.0

    embedding1 = nlp_model.encode(name_from_doc, convert_to_tensor=True)
    embedding2 = nlp_model.encode(name_from_user, convert_to_tensor=True)
    similarity = util.pytorch_cos_sim(embedding1, embedding2).item()

    if similarity > 0.65 and (name_from_doc in name_from_user or name_from_user in name_from_doc):
        return 1.0

    return similarity

# ------------------------
# Document GNN Model
# ------------------------

class DocumentGNN(torch.nn.Module):
    def __init__(self):
        super(DocumentGNN, self).__init__()
        self.conv1 = GCNConv(8, 16)
        self.conv2 = GCNConv(16, 32)
        self.fc = torch.nn.Linear(32, 2)

    def forward(self, data):
        x, edge_index, batch = data.x, data.edge_index, data.batch
        x = F.relu(self.conv1(x, edge_index))
        x = F.relu(self.conv2(x, edge_index))
        x = global_mean_pool(x, batch)
        x = self.fc(x)
        return F.log_softmax(x, dim=1)


# ------------------------
# Import model from package
# ------------------------

from backend.ai.train_gnn import DocumentGNN

# ------------------------
# Load model
# ------------------------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # backend/scripts
AI_DIR = os.path.abspath(os.path.join(BASE_DIR, '..', 'ai'))
MODEL_PATH = os.path.join(AI_DIR, 'trained_gnn_model.pth')

model = DocumentGNN(in_feats=8)
model.load_state_dict(torch.load(MODEL_PATH, map_location=torch.device('cpu')))
model.eval()

# ------------------------
# Build Graph from Document Data
# ------------------------

def build_graph_from_document(data):
    """
    Build graph based on extracted document features.
    Here we encode presence of fields and their length as features.
    Adapt this for your real document structure.
    """
    # Features: [field_presence, normalized_length, dummy_feature]
    def feat(val):
        if val:
            length = min(len(str(val)) / 50.0, 1.0)
            # Example extra dummy features
            return [1.0, length, 0.5, 0.1, 0.2, 0.3, 0.4, 0.6]
        else:
            return [0.0]*8


    features = [
        feat(data.get("name_on_doc", None)),
        feat(data.get("aadhaar_number", None)),
        feat(data.get("pan_number", None)),
        feat(data.get("type", None)),
    ]

    x = torch.tensor(features, dtype=torch.float)

    # Define edges between these nodes (fully connected simple example)
    edge_index = torch.tensor([
        [0, 0, 0, 1, 1, 2, 2, 3, 3, 1, 2, 3],
        [1, 2, 3, 0, 2, 0, 1, 0, 1, 3, 3, 1]
    ], dtype=torch.long)

    return Data(x=x, edge_index=edge_index)

def evaluate_structure_with_gnn(extracted_data):
    data = build_graph_from_document(extracted_data)
    data.batch = torch.zeros(data.x.size(0), dtype=torch.long)  # batch vector (all zero for single graph)
    with torch.no_grad():
        out = model(data)
    prediction = torch.argmax(out, dim=1).item()
    return prediction == 1

# ------------------------
# Fraud Score Calculation
# ------------------------

def calculate_fraud_score(data, doc_type, image_path):
    score = 0
    reasons = []

    # 🔁 1. Duplicate Submission (Major fraud indicator)
    if data.get('is_duplicate'):
        score += 50
        reasons.append("Duplicate submission detected.")

    # 🔐 2. Aadhaar or PAN format validation
    if doc_type == "aadhaar":
        aadhaar = data.get('aadhaar_number', '')
        if not (aadhaar.isdigit() and len(aadhaar) == 12 and verhoeff_check(aadhaar)):
            score += 30
            reasons.append("Invalid Aadhaar checksum.")
    elif doc_type == "pan":
        pan = data.get('pan_number', '')
        pan_pattern = r'^[A-Z]{5}[0-9]{4}[A-Z]$'
        if not re.match(pan_pattern, pan):
            score += 30
            reasons.append("Invalid PAN format.")

    # 🧪 3. Document tampering detection (very high risk)
    if detect_document_tampering(image_path):
        score += 40
        reasons.append("Potential document manipulation detected.")

    # 🧠 4. Layout or structure anomaly via GNN
    if not evaluate_structure_with_gnn(data):
        score += 25
        reasons.append("Anomalies detected in document structure.")

    # 🧍 5. Name mismatch (moderate risk — identity mismatch)
    similarity = compute_name_similarity(data.get("name_on_doc", ""), data.get("name_input", ""))
    if similarity < 0.9:
        if similarity < 0.7:
            score += 20
            reasons.append("Name on document does not closely match user input.")
        else:
            score += 10
            reasons.append("Minor discrepancy in name match.")

    # 🔚 Cap at 100 and assign risk level
    final_score = min(score, 100)
    risk_level = (
        "Low" if final_score <= 30 else
        "Medium" if final_score <= 70 else
        "High"
    )

    return {
        "fraud_score": final_score,
        "risk_level": risk_level,
        "reasons": reasons
    }

def evaluate_tampering_accuracy(test_data):
    """
    test_data: list of dicts like [{ "image_path": "path", "tampered": true }, ...]
    """
    correct = 0
    total = len(test_data)
    for item in test_data:
        path = item.get("image_path")
        expected = item.get("tampered")
        if path is None or expected is None:
            continue
        predicted = detect_document_tampering(path)
        if predicted == expected:
            correct += 1
    accuracy = correct / total if total > 0 else 0.0
    print(f"📄 Tampering Detection Accuracy: {accuracy * 100:.2f}% ({correct}/{total})")
    return accuracy


def evaluate_name_matching_accuracy(test_data, threshold=0.9):
    """
    test_data: list of dicts like [{ "doc_name": "...", "input_name": "...", "match": true }, ...]
    """
    correct = 0
    total = len(test_data)
    for item in test_data:
        doc_name = item.get("doc_name")
        input_name = item.get("input_name")
        expected = item.get("match")
        if doc_name is None or input_name is None or expected is None:
            continue
        similarity = compute_name_similarity(doc_name, input_name)
        predicted = similarity >= threshold
        if predicted == expected:
            correct += 1
    accuracy = correct / total if total > 0 else 0.0
    print(f"🧠 Name Matching Accuracy: {accuracy * 100:.2f}% ({correct}/{total})")
    return accuracy

# ------------------------
# Main Entry Point
# ------------------------

if __name__ == "__main__":
    base64_input = sys.argv[1]
    image_path = sys.argv[2]
    json_str = base64.b64decode(base64_input).decode('utf-8')
    input_data = json.loads(json_str)
    doc_type = input_data.get('type')

    input_data["has_tampering_signs"] = detect_document_tampering(image_path)

    result = calculate_fraud_score(input_data, doc_type, image_path)
    print(json.dumps(result, indent=2))

    # Optional evaluation files
    if len(sys.argv) > 3:
        for arg in sys.argv[3:]:
            if arg.endswith("tampering_test.json"):
                with open(arg, "r") as f:
                    tampering_test_data = json.load(f)
                evaluate_tampering_accuracy(tampering_test_data)

            elif arg.endswith("name_test.json"):
                with open(arg, "r") as f:
                    name_test_data = json.load(f)
                evaluate_name_matching_accuracy(name_test_data)