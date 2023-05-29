#! /bin/bash

# ---------------------------------- IMPORTANT -------------------------------
WORKSPACE_DIR=/home/ben1904/temp/tftest
MODEL_LINK=http://download.tensorflow.org/models/object_detection/tf2/20200713/centernet_hg104_512x512_coco17_tpu-8.tar.gz
MODEL_NAME=centernet_hg104_512x512_coco17_tpu-8
# ---------------------------------- IMPORTANT -------------------------------
MODELS_DIR=$WORKSPACE_DIR/workspace/models
PRE_TRAINED_MODELS_DIR=$WORKSPACE_DIR/workspace/pre_trained_model
EXPORTED_MODELS_DIR=$WORKSPACE_DIR/workspace/exported_models


sed -i 's/num_classes:.*/num_classes: 2/g' $MODELS_DIR/$MODEL_NAME/v1/pipeline.config
sed -zi 's/train_config {\n  batch_size: [0-9]*/train_config {\n  batch_size: 1/g' $MODELS_DIR/$MODEL_NAME/v1/pipeline.config
