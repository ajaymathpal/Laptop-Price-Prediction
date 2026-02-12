from flask import Flask, render_template, request, jsonify
import pickle
import numpy as np
import pandas as pd

app = Flask(__name__)

# Load model & dataframe
pipe = pickle.load(open('pipe.pkl', 'rb'))
df = pickle.load(open('df.pkl', 'rb'))


@app.route('/')
def home():
    return render_template('index.html')


# 🔹 Send valid options to frontend (VERY IMPORTANT)
@app.route('/options')
def options():
    return jsonify({
        'company': sorted(df['Company'].unique().tolist()),
        'type': sorted(df['TypeName'].unique().tolist()),
        'cpu': sorted(df['Cpu brand'].unique().tolist()),
        'gpu': sorted(df['Gpu brand'].unique().tolist()),
        'os': sorted(df['os'].unique().tolist()),
        'ram': sorted(df['Ram'].unique().tolist())
    })


# 🔹 Prediction API
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json

        # Convert Yes/No
        touchscreen = 1 if data['touchscreen'] == 'Yes' else 0
        ips = 1 if data['ips'] == 'Yes' else 0

        # PPI calculation
        x_res, y_res = map(int, data['resolution'].split('x'))
        ppi = ((x_res ** 2 + y_res ** 2) ** 0.5) / float(data['screen_size'])

        query = pd.DataFrame({
            'Company': [data['company']],
            'TypeName': [data['type']],
            'Ram': [int(data['ram'])],
            'Weight': [float(data['weight'])],
            'Touchscreen': [touchscreen],
            'Ips': [ips],
            'ppi': [ppi],
            'Cpu brand': [data['cpu']],
            'HDD': [int(data['hdd'])],
            'SSD': [int(data['ssd'])],
            'Gpu brand': [data['gpu']],
            'os': [data['os']]
        })

        price = int(np.exp(pipe.predict(query)[0]))

        return jsonify({'price': price})

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
