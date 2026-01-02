import os
import random
import numpy as np
import torch
import torch.nn.functional as F
from torch_geometric.data import Data, Dataset
from torch_geometric.loader import DataLoader
from torch_geometric.nn import GCNConv, global_mean_pool
from torch_geometric.utils import to_networkx
from pymongo import MongoClient
from dotenv import load_dotenv
from sklearn.metrics import classification_report
import networkx as nx
import matplotlib.pyplot as plt

# ------------------------
# Load environment variables
# ------------------------
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB = os.getenv("MONGO_DB")
MONGO_COLLECTION = os.getenv("MONGO_COLLECTION")

# ------------------------
# Set random seed
# ------------------------
def set_seed(seed=42):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)

set_seed()

# ------------------------
# MongoDB Connector
# ------------------------
def get_mongo_collection(uri=MONGO_URI, db_name=MONGO_DB, collection_name=MONGO_COLLECTION):
    client = MongoClient(uri)
    db = client[db_name]
    return db[collection_name]

def test_mongo_connection():
    collection = get_mongo_collection()
    print(f"Using collection: {collection.full_name}")
    count = collection.count_documents({})
    print(f"Documents count: {count}")
    sample = collection.find_one()
    print(f"Sample document:\n{sample}")

# ------------------------
# Convert hash string to features
# ------------------------
def hash_to_features(hash_str, dims=8):
    nums = []
    hash_str = hash_str or ""
    for i in range(dims):
        chunk = hash_str[i*4:(i+1)*4]
        if len(chunk) == 0:
            nums.append(0)
        else:
            try:
                nums.append(int(chunk, 16) % 1000 / 1000.0)
            except:
                nums.append(0)
    return nums

# ------------------------
# Custom Dataset
# ------------------------
class FraudGraphDataset(Dataset):
    def __init__(self, collection, root=None):
        super().__init__(root)
        self.records = list(collection.find({
            "aadhaarHash": {"$exists": True, "$ne": None},
            "panHash": {"$exists": True, "$ne": None}
        }))
        print(f"📦 Loaded {len(self.records)} records from MongoDB.")

    def __len__(self):
        return len(self.records)

    def __getitem__(self, idx):
        record = self.records[idx]
        aadhaar_hash = record.get("aadhaarHash", "")
        pan_hash = record.get("panHash", "")
        user_feats = [0.5] * 8
        aadhaar_feats = hash_to_features(aadhaar_hash)
        pan_feats = hash_to_features(pan_hash)

        x = torch.tensor([user_feats, aadhaar_feats, pan_feats], dtype=torch.float)
        edge_index = torch.tensor([[0, 0, 1], [1, 2, 0]], dtype=torch.long)
        is_fraud = 1 if record.get("fraudInfo") and len(record["fraudInfo"]) > 0 else 0
        y = torch.tensor([is_fraud], dtype=torch.long)
        return Data(x=x, edge_index=edge_index, y=y)

# ------------------------
# Visualize graph
# ------------------------
def visualize_graph(data):
    G = to_networkx(data, to_undirected=True)
    labels = {i: f"{i}" for i in range(data.num_nodes)}  # simple node labels
    
    plt.figure(figsize=(5, 5))
    nx.draw(G, labels=labels, with_labels=True, node_color='skyblue', node_size=800, font_size=16, font_weight='bold')
    plt.title("Sample Graph Visualization")
    plt.show()

# ------------------------
# GNN Model
# ------------------------
class DocumentGNN(torch.nn.Module):
    def __init__(self, in_feats=3, hidden1=16, hidden2=32, num_classes=2):
        super().__init__()
        self.conv1 = GCNConv(in_feats, hidden1)
        self.conv2 = GCNConv(hidden1, hidden2)
        self.fc = torch.nn.Linear(hidden2, num_classes)

    def forward(self, data):
        x, edge_index, batch = data.x, data.edge_index, data.batch
        x = F.relu(self.conv1(x, edge_index))
        x = F.relu(self.conv2(x, edge_index))
        x = global_mean_pool(x, batch)
        return F.log_softmax(self.fc(x), dim=1)

# ------------------------
# Evaluation Function
# ------------------------
def evaluate(model, loader, device):
    model.eval()
    correct = 0
    total = 0
    all_preds = []
    all_labels = []

    with torch.no_grad():
        for batch in loader:
            batch = batch.to(device)
            out = model(batch)
            pred = out.argmax(dim=1)
            correct += (pred == batch.y).sum().item()
            total += batch.y.size(0)
            all_preds.extend(pred.cpu().numpy())
            all_labels.extend(batch.y.cpu().numpy())

    accuracy = correct / total if total > 0 else 0
    print(f"✅ Evaluation Accuracy: {accuracy * 100:.2f}%")

    unique = np.unique(all_labels + all_preds)
    label_names = ["Not Fraud", "Fraud"]
    used_names = [label_names[i] for i in unique]

    print("\n📊 Classification Report:")
    print(classification_report(all_labels, all_preds, labels=unique, target_names=used_names))
    return accuracy


# ------------------------
# Training Function
# ------------------------
def train():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    collection = get_mongo_collection()
    dataset = FraudGraphDataset(collection)

    if len(dataset) == 0:
        print("⚠️ No data found in MongoDB collection.")
        return

    # Visualize the first graph sample
    visualize_graph(dataset[0])

    from torch.utils.data import random_split
    train_size = int(0.8 * len(dataset))
    test_size = len(dataset) - train_size
    train_dataset, test_dataset = random_split(dataset, [train_size, test_size])

    train_loader = DataLoader(train_dataset, batch_size=16, shuffle=True)
    test_loader = DataLoader(test_dataset, batch_size=16)

    model = DocumentGNN(in_feats=dataset[0].x.shape[1]).to(device)
    optimizer = torch.optim.Adam(model.parameters(), lr=0.01)
    criterion = torch.nn.NLLLoss()

    model.train()
    for epoch in range(1, 51):
        total_loss = 0
        for batch in train_loader:
            batch = batch.to(device)
            optimizer.zero_grad()
            out = model(batch)
            loss = criterion(out, batch.y)
            loss.backward()
            optimizer.step()
            total_loss += loss.item()
        avg_loss = total_loss / len(train_loader)
        print(f"Epoch {epoch}/50 - Loss: {avg_loss:.4f}")

    # Get path to current file (train_gnn.py inside backend/ai/)
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    MODEL_PATH = os.path.join(BASE_DIR, "trained_gnn_model.pth")

    torch.save(model.state_dict(), MODEL_PATH)
    print(f"✅ Model trained and saved at: {MODEL_PATH}")

    # Evaluate model
    evaluate(model, test_loader, device)

# ------------------------
# Entry Point
# ------------------------
if __name__ == "__main__":
    test_mongo_connection()
    train()
