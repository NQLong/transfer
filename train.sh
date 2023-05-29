#! /bin/bash

# ---------------------------------- IMPORTANT -------------------------------
WORKSPACE_DIR=/home/ben1904/temp/tftest
MODEL_LINK=http://download.tensorflow.org/models/object_detection/tf2/20200713/centernet_hg104_512x512_coco17_tpu-8.tar.gz
MODEL_NAME=efficientdet_d0_coco17_tpu-32
# ---------------------------------- IMPORTANT -------------------------------
MODELS_DIR=$WORKSPACE_DIR/workspace/models
PRE_TRAINED_MODELS_DIR=$WORKSPACE_DIR/workspace/pre_trained_model
EXPORTED_MODELS_DIR=$WORKSPACE_DIR/workspace/exported_models


cp $WORKSPACE_DIR/models/research/object_detection/model_main_tf2.py $WORKSPACE_DIR/workspace
cd $WORKSPACE_DIR/workspace

python model_main_tf2.py --pipeline_config_path=$MODELS_DIR/$MODEL_NAME/v1/pipeline.config --model_dir=$MODELS_DIR/$MODEL_NAME/v1/ --checkpoint_every_n=1 --num_workers=12 --alsologtostderr
