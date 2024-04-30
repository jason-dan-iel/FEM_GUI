import numpy as np
from sympy import symbols, Eq, solve, Matrix
import pandas as pd
import numpy as np
import csv

SOLUTION = None

class Node:
    def __init__(self, node_id):
        self.node_id = node_id
        self.x = None
        self.y = None
        self.theta = None
        self.H = None
        self.V = None
class Structure:
    def __init__(self, num_nodes):
        self.nodes = [Node(i) for i in range(1, num_nodes+1)]
        self.displacement_matrix = np.zeros((num_nodes * 3, 1))
        self.Force_matrix = np.zeros((num_nodes * 3, 1))
        self.symbolss = []

    def apply_support_conditions(self, support_conditions):
        for node_id, support_type,EHN,EVN,EMN,HSS,VSS in support_conditions:
            node = self.nodes[node_id - 1]  # Node indices start from 1
            if support_type == "Fixed":
                node.x = 0 + HSS
                node.y = 0 + VSS
                node.theta = 0
                node.H = symbols(f'H{node_id}') + EHN
                node.V = symbols(f'V{node_id}') + EVN
                node.M = symbols(f'M{node_id}') + EMN
                self.symbolss.append(f'H{node_id}')
                self.symbolss.append(f'M{node_id}')
                self.symbolss.append(f'V{node_id}')
                self.symbolss.append(f'x{node_id}')
                self.symbolss.append(f'y{node_id}')
                self.symbolss.append(f'theta{node_id}')
            elif support_type == "Free":
                node.x = symbols(f'x{node_id}')
                node.y = symbols(f'y{node_id}')
                node.theta = symbols(f'theta{node_id}')
                node.H = 0 + EHN
                node.V = 0 + EVN
                node.M = 0 + EMN
                self.symbolss.append(f'H{node_id}')
                self.symbolss.append(f'M{node_id}')
                self.symbolss.append(f'V{node_id}')
                self.symbolss.append(f'x{node_id}')
                self.symbolss.append(f'y{node_id}')
                self.symbolss.append(f'theta{node_id}')
            elif support_type == "Verticalroller":
                node.x = 0 + HSS
                node.y = symbols(f'y{node_id}') + VSS
                node.theta = symbols(f'theta{node_id}')
                node.H = symbols(f'H{node_id}') + EHN
                node.V = 0 + EVN
                node.M = 0 + EMN
                self.symbolss.append(f'H{node_id}')
                self.symbolss.append(f'M{node_id}')
                self.symbolss.append(f'V{node_id}')
                self.symbolss.append(f'x{node_id}')
                self.symbolss.append(f'y{node_id}')
                self.symbolss.append(f'theta{node_id}')
            elif support_type == "Horizontalroller":
                node.x = symbols(f'x{node_id}') + HSS
                node.y = 0 + VSS
                node.theta = symbols(f'theta{node_id}')
                node.H = 0 + EHN
                node.V = symbols(f'V{node_id}') + EVN
                node.M = 0 + EMN
                self.symbolss.append(f'H{node_id}')
                self.symbolss.append(f'M{node_id}')
                self.symbolss.append(f'V{node_id}')
                self.symbolss.append(f'x{node_id}')
                self.symbolss.append(f'y{node_id}')
                self.symbolss.append(f'theta{node_id}')
            elif support_type == "Pinned":
                node.x = 0 + HSS
                node.y = 0 + VSS
                node.theta = symbols(f'theta{node_id}')
                node.H = symbols(f'H{node_id}') + EHN
                node.V = symbols(f'V{node_id}') + EVN
                node.M = 0 + EMN
                self.symbolss.append(f'H{node_id}')
                self.symbolss.append(f'M{node_id}')
                self.symbolss.append(f'V{node_id}')
                self.symbolss.append(f'x{node_id}')
                self.symbolss.append(f'y{node_id}')
                self.symbolss.append(f'theta{node_id}')
            else:
                raise ValueError(f"Unsupported support type for node {node_id}: {support_type}")

    def generate_equations(self):
        equations = []
        Force_equation = []
        for node in self.nodes:
            if node.x is not None:
                equations.append(node.x)
                Force_equation.append(node.H)
            if node.y is not None:
                equations.append(node.y)
                Force_equation.append(node.V)
            if node.theta is not None:
                equations.append(node.theta)
                Force_equation.append(node.M)
        return equations, Force_equation

def create_transformation_matrix(x1, y1, x2, y2, L, transpose=False):
    c = (x2 - x1) / L
    s = (y2 - y1) / L
    t_matrix = np.array([
        [c, -s, 0, 0, 0, 0],
        [s, c, 0, 0, 0, 0],
        [0, 0, 1, 0, 0, 0],
        [0, 0, 0, c, -s, 0],
        [0, 0, 0, s, c, 0],
        [0, 0, 0, 0, 0, 1]
    ])
    if transpose:
        t_matrix = np.transpose(t_matrix)
    return t_matrix

def calculate_global_stiffness_matrix(A, E, L, I, node_indices, coordinates, Global_Stiffness_Matrix):
    for i in range(len(node_indices) - 1):
        i_index = node_indices[i] - 1
        j_index = node_indices[i + 1] - 1
        x1, y1 = coordinates[i]
        x2, y2 = coordinates[i + 1]
        k_local = np.zeros((6, 6))
        k_local[0, 0] = A * E / L
        k_local[0, 3] = -A * E / L
        k_local[1, 1] = 12 * E * I / (L ** 3)
        k_local[1, 4] = -12 * E * I / (L ** 3)
        k_local[1, 2] = 6 * E * I / (L ** 2)
        k_local[1, 5] = 6 * E * I / (L ** 2)
        k_local[2, 1] = 6 * E * I / (L ** 2)
        k_local[2, 4] = -6 * E * I / (L ** 2)
        k_local[2, 2] = 4 * E * I / L
        k_local[2, 5] = 2 * E * I / L
        k_local[3, 0] = -A * E / L
        k_local[3, 3] = A * E / L
        k_local[4, 1] = -12 * E * I / (L ** 3)
        k_local[4, 4] = 12 * E * I / (L ** 3)
        k_local[4, 2] = -6 * E * I / (L ** 2)
        k_local[4, 5] = -6 * E * I / (L ** 2)
        k_local[5, 1] = 6 * E * I / (L ** 2)
        k_local[5, 4] = -6 * E * I / (L ** 2)
        k_local[5, 2] = 2 * E * I / L
        k_local[5, 5] = 4 * E * I / L
        k_local_transformed = np.zeros((6, 6))
        t_matrix_list = create_transformation_matrix(x1, y1, x2, y2, L, transpose=False)
        k_local_transformed = np.dot(t_matrix_list, np.dot(k_local,np.transpose(t_matrix_list)))
        print(k_local_transformed)
        local_indices = np.array([3*(i_index + 1) - 2, 3*(i_index + 1) - 1, 3*(i_index + 1), 3*(j_index+1) - 2, 3*(j_index+1) - 1, 3*(j_index+1)])
        print(local_indices)
        l = len(Global_Stiffness_Matrix)
        if l == 0:
            Global_Stiffness_Matrix = k_local_transformed
        else:
            temp = k_local_transformed[0:3, 0:3]
            temp1 = Global_Stiffness_Matrix[local_indices[0]-1:local_indices[2], local_indices[0]-1:local_indices[2]]
            temp = temp + temp1
            Global_Stiffness_Matrix[local_indices[0]-1:local_indices[2], local_indices[0]-1:local_indices[2]] = temp
            if np.all(local_indices[3:] <= l):
                temp = k_local_transformed[3:, 3:]
                temp1 = Global_Stiffness_Matrix[local_indices[3]-1:local_indices[5], local_indices[3]-1:local_indices[5]]
                temp = temp + temp1
                Global_Stiffness_Matrix[local_indices[3]-1:local_indices[5], local_indices[3]-1:local_indices[5]] = temp
            else:
                Global_Stiffness_Matrix = np.concatenate([Global_Stiffness_Matrix, np.zeros((len(Global_Stiffness_Matrix), 3))], axis = 1)
                Global_Stiffness_Matrix = np.concatenate([Global_Stiffness_Matrix, np.zeros((3, len(Global_Stiffness_Matrix[0])))], axis = 0)
                Global_Stiffness_Matrix[-3:, -3:] = k_local_transformed[3:, 3:]
                Global_Stiffness_Matrix[local_indices[0]-1: local_indices[2], -3:] = k_local_transformed[:3, 3:]
                Global_Stiffness_Matrix[-3:, local_indices[0]-1: local_indices[2]] = k_local_transformed[3:, :3]
    return Global_Stiffness_Matrix

def process_data():
    node_data = pd.read_csv("./node_data.csv")
    node_data['supportType'] = node_data['supportType'].fillna("Free")
    node_data = node_data.fillna(0)
    member_data = pd.read_csv('./member_data.csv')
    properties = pd.read_csv("./properties_data.csv")
    member_data['loadType'] = member_data['loadType'].fillna("None")
    member_data = member_data.fillna(0)

    return (node_data, member_data, properties)

def node_input(node_data):
    N = len(node_data)
    Node_support = []
    for i in range(len(node_data)):
        support_type = node_data['supportType'][i].strip().capitalize()
        EH = node_data['Fx'][i]
        EV = node_data['Fy'][i]
        EM = node_data['Mz'][i]
        HS = node_data['Sx'][i]
        VS = node_data['Sy'][i]
        Node_support.append((i+1, support_type, EH, EV, EM, HS, VS))
    return N, Node_support

def member_input(node_data, member_data):
    Member_loads = []
    connections = []
    coordinates = []
    lengths = []

    num_members = len(member_data)
    for i in range(num_members):
        nodes = tuple((member_data['node1'][i], member_data['node2'][i]))
        connections.append(nodes)

        x1, y1 = node_data['x'][member_data['node1'][i]-1], node_data['y'][member_data['node1'][i]-1]
        x2, y2 = node_data['x'][member_data['node2'][i]-1], node_data['y'][member_data['node2'][i]-1]
        coordinates.append((x1,y1))
        coordinates.append((x2,y2))
        length = np.sqrt((x2 - x1)**2 + (y2 - y1)**2)
        lengths.append(length)
        load_type = member_data['loadType'][i].strip().capitalize()
        
        if load_type == "Concentrated":
            w = member_data['w1'][i]
            a1 = member_data['a1'][i]
            a2 = member_data['a2'][i]
            Member_loads.append((i+1, w, a1, a2, length, load_type))
        elif load_type == "None" :
           Member_loads.append((i+1, 0, 0, 0, length,load_type))
        elif load_type == "Trapezoidal":
            w1 = member_data['w1'][i]
            a1 = member_data['a1'][i]
            w2 = member_data['w2'][i]
            a2 = member_data['a2'][i]
            Member_loads.append((i+1, w1, w2, a1, a2, length,load_type))
        elif load_type == "Uniform":
            w = member_data['w1'][i]
            a1 = member_data['a1'][i]
            a2 = member_data['a2'][i]
            Member_loads.append((i+1, w, a1, a2, length,load_type))
        
    return num_members, Member_loads, connections, coordinates, lengths

def d2csv(dic, filename="output.csv"):
    with open(filename, 'w', newline='') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=dic.keys())
        writer.writeheader()
        writer.writerow(dic)

def main_ds():
    global SOLUTION
    node_data, member_data, properties = process_data()
    N, Node_support = node_input(node_data=node_data)
    num_members, Member_loads, connections, coordinates, lengths = member_input(node_data=node_data, member_data=member_data)

    structure = Structure(N)
    structure.apply_support_conditions(Node_support)
    equations,Force_equations = structure.generate_equations()
    print(equations,Force_equations)
    Force_Matrix = Matrix(Force_equations)
    equations_matrix = Matrix(equations)

    A,E,I = properties['A'][0], properties['E'][0] , properties['I'][0]

    Global_Stiffness_Matrix = np.array([])
    for i in range(len(connections)):
        Global_Stiffness_Matrix = calculate_global_stiffness_matrix(A, E, lengths[i], I, connections[i], coordinates[i*2:i*2+2], Global_Stiffness_Matrix)
    print(Global_Stiffness_Matrix)
    print(equations_matrix)
    result_symbolic = Global_Stiffness_Matrix * equations_matrix
    print("KD", result_symbolic)
    Global_Fixed_End_Matrix = np.zeros((N * 3, 1))

    for load_info in Member_loads:
        member_index = load_info[0] - 1
        local_fixed_end_matrix = np.zeros((6, 1))
        if load_info[-1] == "Uniform" :  # Uniform Load
            w = load_info[1]
            a = load_info[2]
            b = load_info[3]
            L = load_info[4]
            c = L-a-b
            d = b+ (c/2)
            e = a+c
            local_fixed_end_matrix[0] = 0
            local_fixed_end_matrix[1] = (w*c*((12*(d**2))-((8*(d**3))/(L))+ ((2*e*(c**2))/(L))-((c**3)/(L))-(c**2)))/(4*(L**2))
            local_fixed_end_matrix[2] = -(w*c*(((24*(d**3))/(L))-((6*e*(c**2))/(L))+((3*(c**3))/(L))+(4*(c**2))-(24*(d**2))))/(24*L)
            local_fixed_end_matrix[3] = 0
            local_fixed_end_matrix[4] = (w*c)-((w*c*((12*(d**2))-((8*(d**3))/(L))+ ((2*e*(c**2))/(L))-((c**3)/(L))-(c**2)))/(4*(L**2)))
            local_fixed_end_matrix[5] = (w*c*(((24*(d**3))/(L))-((6*e*(c**2))/(L))+((3*(c**3))/(L))+(4*(c**2))-(24*(d**2))))/(24*L)
            # Process uniform load for member
            # Your implementation here
        elif load_info[-1] == "None" :
            local_fixed_end_matrix[0] = 0
            local_fixed_end_matrix[1] = 0
            local_fixed_end_matrix[2] = 0
            local_fixed_end_matrix[3] = 0
            local_fixed_end_matrix[4] = 0
            local_fixed_end_matrix[5] = 0

        elif load_info[-1] == "Concentrated":  # Concentrated Load
            w = load_info[1]
            a = load_info[2]
            b = load_info[3]
            L = load_info[4]
            local_fixed_end_matrix[0] = 0
            local_fixed_end_matrix[1] = (w*(b**2)*(L+(2*a)))/(L**3)
            local_fixed_end_matrix[2] = (w*a*(b**2))/(L**2)
            local_fixed_end_matrix[3] = 0
            local_fixed_end_matrix[4] = (w*(b**2)*(L+(2*a)))/(L**3)
            local_fixed_end_matrix[5] = -(w*b*(a**2))/(L**2)
        elif load_info[-1] == "Trapezoidal":  # Trapezoidal Load
           w1 = load_info[1]
           w2 = load_info[2]
           a = load_info[3]
           b = load_info[4]
           L = load_info[5]
        x1, y1 = coordinates[2 * member_index]
        x2, y2 = coordinates[2 * member_index + 1]
        L = lengths[member_index]
        T_matrix = create_transformation_matrix(x1, y1, x2, y2, L, transpose=False)

        # Apply transformation to local fixed end matrix
        local_fixed_end_matrix = np.dot(T_matrix, local_fixed_end_matrix)
        node1_index = connections[member_index][0] - 1
        node2_index = connections[member_index][1] - 1
        global_indices = [3 * node1_index, 3 * node1_index + 1, 3 * node1_index + 2,
                          3 * node2_index, 3 * node2_index + 1, 3 * node2_index + 2]
        Global_Fixed_End_Matrix[global_indices] += local_fixed_end_matrix
    print("\nGlobal Fixed End Matrix:")
    print(Global_Fixed_End_Matrix)
    KD_Plus_Fixed_END_Moment = Global_Fixed_End_Matrix + result_symbolic
    print("KD_Plus_Fixed_END_Moment", KD_Plus_Fixed_END_Moment)
    print("Force",Force_Matrix)
    variables_KD = symbols(structure.symbolss)
    # variables_Force = list(Force_Matrix.free_symbols)

    equations = [Eq(KD_Plus_Fixed_END_Moment[i, 0], Force_Matrix[i, 0]) for i in range(KD_Plus_Fixed_END_Moment.rows)]

    solution = solve(equations, variables_KD)
    try:
      for i in variables_KD:
          if i not in solution:
              solution[i] = 0.0
    except:
      pass

    # Print the solution
    print("Solution:")
    print(solution)
    d2csv(solution)
    SOLUTION = solution
    return solution