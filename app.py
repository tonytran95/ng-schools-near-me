from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from flask_talisman import Talisman
from mongoengine import connect
from models import School
from dotenv import load_dotenv
import os

app = Flask(__name__)
CORS(app)
Talisman(app, content_security_policy=None)

load_dotenv()
API_KEY = os.environ.get('API_KEY')
DATABASE_HOST = os.environ.get('DATABASE_HOST')
connect(host=DATABASE_HOST)


@app.route('/', methods=['GET'])
def index():
    return render_template('index.html', api_key=API_KEY)


@app.route('/api/schools', methods=['GET'])
def get_schools():
    pipeline = [
        {
            '$geoNear': {
                'near': {
                    'type': 'Point',
                    'coordinates': []
                },
                'spherical': True,
                'distanceField': "distance",
                'limit': 2207
            }
        },
        {
            '$match': {}
        }
    ]

    for arg in request.args:
        if arg != 'gender' and arg != 'selective':
            param = request.args.get(arg)
        else:
            param = request.args.getlist(arg)
        if arg == 'longitude' or arg == 'latitude':
            pipeline[0]['$geoNear']['near']['coordinates'].append(float(param))
        elif arg == 'distance':
            pipeline[0]['$geoNear']['maxDistance'] = int(param)
        elif arg == 'level':
            pipeline[1]['$match'][arg] = param
        elif arg == 'gender' or arg == 'selective':
            pipeline[1]['$match'][arg] = {'$in': param}
        elif arg == 'support_classes':
            if param != 'ALL':
                pipeline[1]['$match'][arg] = param
            else:
                pipeline[1]['$match'][arg] = {'$exists': ''}
        elif arg == 'enrolments' or arg == 'train_duration':
            pipeline[1]['$match'][arg] = {'$lte': int(param)}
        else:
            pipeline[1]['$match'][arg] = True

    schools = School.objects.aggregate(*pipeline)
    response = []
    for school in schools:
        school_dict_item = {
            'code': school['_id'],
            'name': school['name'],
            'longitude': school['location']['coordinates'][0],
            'latitude': school['location']['coordinates'][1],
            'distance': school['distance'],
            'street': school['street'],
            'suburb': school['suburb'],
            'postcode': school['postcode'],
            'logo': school['logo']
        }
        response.append(school_dict_item)
    return jsonify(response), 200


@app.route('/api/schools/all', methods=['GET'])
def get_all_schools():
    schools = School.objects()
    response = []
    for school in schools:
        temp = {}
        for key in school:
            temp[key] = school[key]
        response.append(temp)
    return jsonify(response), 200


@app.route('/api/schools/<int:code>', methods=['GET'])
def get_school(code):
    school = School.objects(code=code);
    if len(school) == 0:
        return jsonify(message='No school found'), 404
    response = {}
    for key in school:
        response[key] = school[key];
    return jsonify(response), 200


@app.route('/api/schools/compare', methods=['GET'])
def compare_schools():
    codes = request.args.getlist('code')
    if len(codes) == 0:
        return jsonify(message='No input'), 204
    schools = School.objects(code__in=codes)
    if len(schools) == 0:
        return jsonify(message='No schools found matching the codes'), 404
    response = []
    for school in schools:
        temp = {}
        for key in school:
            temp[key] = school[key]
        response.append(temp)
    return jsonify(response), 200


if __name__ == '__main__':
    app.run(debug=True)
