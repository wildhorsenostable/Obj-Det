from flask import Flask, request, jsonify, render_template, redirect, url_for
import base64
import cv2
import numpy as np
import face_recognition
import os

app = Flask(_name_)

# Store the captured face and name
face_data = {}
food_data = {}

def save_image(data, filename):
    with open(filename, "wb") as f:
        f.write(base64.b64decode(data.split(",")[1]))

def load_image(filename):
    return face_recognition.load_image_file(filename)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/recognize')
def recognize():
    return render_template('recognize.html')

@app.route('/submit', methods=['POST'])
def submit():
    name = request.form['nameData']
    image_data = request.form['imageData']
    food_data[name] = request.form['foodData']
    image_path = f"{name}.png"
    save_image(image_data, image_path)
    face_data[name] = face_recognition.face_encodings(load_image(image_path))[0]
    return jsonify({"status": "success"}), 200

@app.route('/recognize', methods=['POST'])
def recognize_face():
    image_data = request.json['imageData']
    image_path = "current_frame.png"
    save_image(image_data, image_path)
    unknown_image = load_image(image_path)
    unknown_encoding = face_recognition.face_encodings(unknown_image)

    if not unknown_encoding:
        return jsonify({"message": "No face detected"})

    unknown_encoding = unknown_encoding[0]
    for name, encoding in face_data.items():
        match = face_recognition.compare_faces([encoding], unknown_encoding)
        if match[0]:
            return jsonify({"message": f"Person identified: {name}", "foodData": food_data[name]})

    return jsonify({"message": "Stranger detected"})

if _name_ == '_main_':
    app.run(debug=True)

