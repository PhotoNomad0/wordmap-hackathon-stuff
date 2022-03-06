#This setup assumes using venv and pip
#adust accordingly for using conda or equivalent.


#-----create venv------
#(venv is a local collection of python 
#packages so your system isn't messed with)

#you may need to install venv
#install venv (linux)
pip3 install venv
#install venv (windows)
py -m pip install venv

#create venv (linux)
python3 -m venv venv
#create venv (windows)
#py -m venv venv


#activate venv (linux)
. ./venv/bin/activate
#activate venv (windows) (guessing from memory)
#venv\Scripts\activate
#to get back out of virtual env you execute
#deactivate

#-----installing packages------
#This package makes some errors go away when installing other packages.
#It has something to do with letting the packages build their own binaries.
pip install wheel


#jupyter runs the notebooks. (if you aren't using venv it might be pip3 instead of pip)
pip install jupyter

#If you are not just interested in the gpu and want to use
#your gpu with the automl
#you will need to install pytorch manually so that it cat
#match your cuda environment.
#Speaking of which you also need to install your cuda environment
#to match your drivers.
#Speaking of which, if you are on linux you need to switch to the propriatary drivers.
#not the open source ones.
#If this is too confusing just skip it and the requirements will automatically install
#the CPU version of pytorch.
#Here is the link to pytorch's install page:
#https://pytorch.org/

#This installs pytorch automl package.  You don't need this just for catboost.
pip install autoPyTorch

#If you don't want to install all of autoPyTorch but you do want catboost.
#https://catboost.ai/en/docs/concepts/python-installation
pip install catboost

#Here is to install the visualization tools
pip install ipywidgets
#and turn on the jupyter widgets
jupyter nbextension enable --py widgetsnbextension


#-------- start jupyter----------------
jupyter notebook

#a web browser should pop open.
#select the model you want to open, automl or catboost

#then run the cells in document to get the results

#The automl one will might make your computer unresponsive for 40 minutes or so
#whatever the time limit is currently set to.
