import csv
from flask import Flask, render_template, request, jsonify, send_file
import numpy as np
from utils.direct_stiffness import main_ds
import pandas as pd
import numpy as np

app = Flask(__name__)

# Global variables to store node and member data
nodes = []
members = []

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/add_node', methods=['POST'])
def add_node():
    data = request.json
    x = data['x']
    y = data['y']
    nodes.append({'x': x, 'y': y, 'Fx': None, 'Fy': None, 'Mz': None, 'settlement': False})
    return jsonify(success=True)

@app.route('/add_member', methods=['POST'])
def add_member():
    data = request.json
    node_idx1 = data['node_idx1']
    node_idx2 = data['node_idx2']
    members.append({'node1': node_idx1, 'node2': node_idx2, 'concentrated_load': None, 'uniform_load': None, 'trapezoidal_load': None})
    return jsonify(success=True)

@app.route('/add_load', methods=['POST'])
def add_load():
    data = request.json
    member_idx = data['member_idx']
    load_type = data['load_type']
    magnitude = data['magnitude']
    members[member_idx][load_type] = magnitude
    return jsonify(success=True)

@app.route('/save_data', methods=['POST'])  # Change method to POST
def save_data():
    data = request.json
    nodes = data.get('nodeData', [])
    members = data.get('memberData',[])
    properties = data.get('propertiesData', {})
    with open('node_data.csv', 'w', newline='') as node_file:
        node_writer = csv.DictWriter(node_file, fieldnames=['x', 'y', 'Fx', 'Fy', 'Mz', 'Sx', 'Sy', 'supportType'])
        node_writer.writeheader()
        for node in nodes:
            node_writer.writerow(node)

    with open('member_data.csv', 'w', newline='') as member_file:
        member_writer = csv.DictWriter(member_file, fieldnames=['node1', 'node2','loadType', 'w1', 'w2', 'a1', 'a2'])
        member_writer.writeheader()
        for member in members:
            member_writer.writerow(member)
    
    with open('properties_data.csv', 'w', newline='') as properties_file:
        properties_writer = csv.DictWriter(properties_file, fieldnames=['A', 'E', 'I'])
        properties_writer.writeheader()
        properties_writer.writerow(properties)

    node_df = pd.read_csv('node_data.csv')
    member_df = pd.read_csv('member_data.csv')
    node_df['supportType'] = node_df['supportType'].str.capitalize()
    member_df['loadType'] = member_df['loadType'].str.capitalize()
    node_json = node_df.to_dict(orient='records')
    member_json = member_df.to_dict(orient='records')

    return jsonify({"success":True, "nodeData":node_json, "memberData":member_json})

@app.route('/compute_data', methods=['POST'])
def compute_data():
    x = main_ds()
    with open("./output.csv", 'r', newline='') as file:
        reader = csv.reader(file)
        data = list(reader)

    output = [data[0], data[1]]

    # Extract column names and node numbers from output
    column_names = []
    node_numbers = []
    for key in output[0]:
        column = key[:-1]  # Extracting column name (excluding the last character)
        node = key[-1]     # Extracting node number (last character)
        column_names.append(column.capitalize())  # Capitalizing column names
        node_numbers.append(int(node))

    # Read the node_data.csv file
    with open("./node_data.csv", 'r', newline='') as file:
        reader = csv.reader(file)
        node_data = list(reader)

    columns = node_data[0]
    rows = node_data[1:]


    df = pd.DataFrame(rows, columns=columns)
    new_columns = ['X', 'Y', 'H', 'V', 'M']
    for col in new_columns:
        df[col] = np.nan

    # Fill DataFrame with values from output
    for i in range(len(output[0])):
        node_idx = node_numbers[i] - 1  # Adjust index for zero-based indexing
        column_name = column_names[i]
        value = output[1][i]
        df.at[node_idx, column_name] = value*1000

    df.to_csv("node1.csv", index=False)

    return jsonify({'success':True, 'data': df.to_dict(orient='records')})


if __name__ == "__main__":
    app.run(port=8000, debug=True)
