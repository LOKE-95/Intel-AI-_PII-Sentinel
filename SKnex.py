import pandas as pd
import numpy as np
from sklearnex import patch_sklearn
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns

patch_sklearn()

file_path = r'C:\Users\Lokghesh VAK\OneDrive\Desktop\TEST_FILES\Data_Mana.xlsx'
data = pd.read_excel(file_path)

if data['label'].dtype == 'object':
    data['label'] = pd.Categorical(data['label']).codes

numeric_vars = data.select_dtypes(include=[np.number]).columns.tolist()
X_numeric = data[numeric_vars]

Y = data['label']
X = X_numeric

X_train, X_test, Y_train, Y_test = train_test_split(X, Y, test_size=0.2)

tree_model = DecisionTreeClassifier()
tree_model.fit(X_train, Y_train)

Y_pred = tree_model.predict(X_test)

accuracy = accuracy_score(Y_test, Y_pred)
print(f'Accuracy: {accuracy * 100:.2f}%')

pii_pred_count = (Y_pred == 1).sum()
non_pii_pred_count = (Y_pred == 0).sum()

print(f'Total test data: {len(Y_test)}')
print(f'Classified as PII: {pii_pred_count} ({pii_pred_count/len(Y_test) * 100:.2f}%)')
print(f'Classified as Non-PII: {non_pii_pred_count} ({non_pii_pred_count/len(Y_test) * 100:.2f}%)')

if len(np.unique(Y_test)) > 1 and len(np.unique(Y_pred)) > 1:
    conf_matrix = confusion_matrix(Y_test, Y_pred)
    plt.figure(figsize=(8, 6))
    sns.heatmap(conf_matrix, annot=True, fmt='d', cmap='Blues', xticklabels=['Non-PII', 'PII'], yticklabels=['Non-PII', 'PII'])
    plt.ylabel('Actual')
    plt.xlabel('Predicted')
    plt.title('Confusion Matrix')
    plt.show()
else:
    print("Warning: Unable to create confusion matrix, only one class detected.")
