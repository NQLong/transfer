#! /bin/bash

# ---------------------------------- IMPORTANT -------------------------------
WORKSPACE_DIR=/home/ben1904/temp/tftest
MODEL_LINK=http://download.tensorflow.org/models/object_detection/tf2/20200711/efficientdet_d0_coco17_tpu-32.tar.gz
MODEL_NAME=efficientdet_d0_coco17_tpu-32
# ---------------------------------- IMPORTANT -------------------------------
MODELS_DIR=$WORKSPACE_DIR/workspace/models
PRE_TRAINED_MODELS_DIR=$WORKSPACE_DIR/workspace/pre_trained_model
EXPORTED_MODELS_DIR=$WORKSPACE_DIR/workspace/exported_models



cd $WORKSPACE_DIR

mkdir -p $MODELS_DIR
mkdir -p $PRE_TRAINED_MODELS_DIR
mkdir -p $EXPORTED_MODELS_DIR

cd $PRE_TRAINED_MODELS_DIR
wget $MODEL_LINK -O "$MODEL_NAME.tar.gz"
tar -xvzf $MODEL_NAME.tar.gz

mkdir -p $MODELS_DIR/$MODEL_NAME/v1

cp $PRE_TRAINED_MODELS_DIR/$MODEL_NAME/pipeline.config $MODELS_DIR/$MODEL_NAME/v1/
