# mini_fasnet.py
import torch
import torch.nn as nn

class Flatten(nn.Module):
    def forward(self, x):
        return x.view(x.size(0), -1)

class DepthWiseSeparableConv(nn.Module):
    def __init__(self, in_channels, out_channels, stride):
        super().__init__()
        self.depthwise = nn.Conv2d(in_channels, in_channels, kernel_size=3,
                                   stride=stride, padding=1, groups=in_channels, bias=False)
        self.pointwise = nn.Conv2d(in_channels, out_channels, kernel_size=1,
                                   stride=1, padding=0, bias=False)
        self.bn = nn.BatchNorm2d(out_channels)
        self.prelu = nn.PReLU(out_channels)

    def forward(self, x):
        x = self.depthwise(x)
        x = self.pointwise(x)
        x = self.bn(x)
        x = self.prelu(x)
        return x

class MiniFASNetV2(nn.Module):
    def __init__(self, num_classes=2, img_size=80):
        super().__init__()
        self.conv1 = DepthWiseSeparableConv(3, 16, stride=1)
        self.conv2 = DepthWiseSeparableConv(16, 32, stride=2)
        self.conv3 = DepthWiseSeparableConv(32, 64, stride=2)
        self.conv4 = DepthWiseSeparableConv(64, 128, stride=2)
        self.pool = nn.AdaptiveAvgPool2d((1, 1))
        self.flatten = Flatten()
        self.fc = nn.Linear(128, num_classes)

    def forward(self, x):
        x = self.conv1(x)
        x = self.conv2(x)
        x = self.conv3(x)
        x = self.conv4(x)
        x = self.pool(x)
        x = self.flatten(x)
        x = self.fc(x)
        return x
