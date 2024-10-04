import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
import xgboost as xgb
from sklearn.metrics import accuracy_score, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.feature_extraction.text import TfidfVectorizer
file_path = r'C:\Users\Lokghesh VAK\OneDrive\Desktop\TEST_FILES\Data_Mana.xlsx'
data = pd.read_excel(file_path)

if data['label'].dtype == 'object':
    data['label'] = pd.Categorical(data['label']).codes  
print("Columns in the DataFrame:", data.columns)
X = data.drop(columns=['label', 'Type of PII'], axis=1)
Y = data['label']
vectorizer = TfidfVectorizer()
X_text_features = vectorizer.fit_transform(X['text'])
X_text_features_df = pd.DataFrame(X_text_features.toarray(), columns=vectorizer.get_feature_names_out())
X_train, X_test, Y_train, Y_test = train_test_split(X_text_features_df, Y, test_size=0.2)
dtrain = xgb.DMatrix(X_train, label=Y_train)
dtest = xgb.DMatrix(X_test, label=Y_test)

params = {
    'objective': 'binary:logistic',
    'max_depth': 5,
    'eta': 0.1,
    'eval_metric': 'logloss'
}
num_boost_round = 100
model = xgb.train(params, dtrain, num_boost_round)
Y_pred = model.predict(dtest)
Y_pred_binary = [1 if x > 0.5 else 0 for x in Y_pred]
accuracy = accuracy_score(Y_test, Y_pred_binary)
print(f'Accuracy: {accuracy * 100:.2f}%')
conf_matrix = confusion_matrix(Y_test, Y_pred_binary)
plt.figure(figsize=(8, 6))
sns.heatmap(conf_matrix, annot=True, fmt='d', cmap='Blues', xticklabels=['Non-PII', 'PII'], yticklabels=['Non-PII', 'PII'])
plt.ylabel('Actual')
plt.xlabel('Predicted')
plt.title('Confusion Matrix')
plt.show()
