import torch
import torch.nn as nn
import torch.nn.functional as F

class PoseClassifier(nn.Module):
    def __init__(self):
        super(PoseClassifier, self).__init__()
        
        self.fc1 = nn.Linear(510, 128)  # 510 input features -> 128 features in hidden layer 1
        self.bn1 = nn.BatchNorm1d(128)  # Batch normalization for hidden layer 1

        self.fc2 = nn.Linear(128, 64)   # 128 features in hidden layer 1 -> 64 features in hidden layer 2
        self.bn2 = nn.BatchNorm1d(64)   # Batch normalization for hidden layer 2

        self.fc3 = nn.Linear(64, 32)    # 64 features in hidden layer 2 -> 32 features in hidden layer 3
        self.bn3 = nn.BatchNorm1d(32)   # Batch normalization for hidden layer 3

        self.fc4 = nn.Linear(32, 3)

    def forward(self, x):
        # Flatten the input tensor from [batch_size, 10, 34] to [batch_size, 340]
        x = x.reshape(x.size(0), -1)
        print(x.shape)

        # Hidden layer 1 with BatchNorm and ReLU activation
        x = F.relu(self.bn1(self.fc1(x)))
        # x = F.relu(self.fc1(x))

        # Hidden layer 2 with BatchNorm and ReLU activation
        x = F.relu(self.bn2(self.fc2(x)))
        # x = F.relu(self.fc2(x))

        # Hidden layer 3 with BatchNorm and ReLU activation
        x = F.relu(self.bn3(self.fc3(x)))
        # x = F.relu(self.fc3(x))

        # Output layer
        x = self.fc4(x)
        return x