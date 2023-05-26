#! /bin/bash

WORKSPACE_DIR=/home/ben1904/temp/tftest
chmod 777 $WORKSPACE_DIR/protoc/bin/protoc
cd models/research
$WORKSPACE_DIR/protoc/bin/protoc /object_detection/protos/*.proto --python_out=.

cd $WORKSPACE_DIR
cd cocoapi/PythonAPI
make
cp -r pycocotools $WORKSPACE_DIR/models/research/


cd $WORKSPACE_DIR/models/research/
cp object_detection/packages/tf2/setup.py .
python -m pip install .
